import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
import logger from "morgan";
import "dotenv/config";
import { createClient } from "@libsql/client";

// server up and running for incomming requests
const port = process.env.PORT ?? 3000;
const ipAddress = "192.168.1.5"
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
});
httpServer.listen(port, ipAddress, async () => {
  console.log(`Server running on port ${port} and IP address ${ipAddress}`);
});
io.on("connection", async (socket) => {
  console.log("A user has connected");
  socket.on("disconnect", () => {
    console.log("A user has diconnected");
  });
  socket.on("chat message", async (message) => {
    // persistance
    let result;
    try {
      result = await db.execute({
        sql: 'INSERT INTO messages (content) VALUES (:message)',
        args: { message }
      })
    } catch(err) {
      console.log(err)
      return
    }

    // message to all users
    const messageId = result.lastInsertRowid.toString()
    io.emit("chat message", message, messageId);
  });
  
  // recover lost messages
  if (!socket.recovered) {
    try {
      const result = await db.execute({
        sql: 'SELECT id, content FROM messages WHERE id > ?',
        args: [socket.handshake.auth.serverOffset ?? 0],
      })
      result.rows.forEach(row => {
        socket.emit("chat message", row.content, row.id.toString())  
      });
    } catch(err) {
      console.log(err)
      return
    }
  }
});

// db
const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

db.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT
  )
`);

// logs
app.use(logger("dev"));

// routes
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/client/index.html");
});
