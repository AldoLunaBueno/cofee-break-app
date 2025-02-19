// server
import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";

// persistance
import Message from "./models/message.js";
import logger from "morgan";

// server up and running for incomming requests
const port = process.env.PORT ?? 3000;
const ipAddress = "192.168.1.5";
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
  socket.on("chat message", async (messageText) => {
    const message = Message.create(messageText);

    // message to all users
    const messageId = message.lastInsertRowid.toString();
    io.emit("chat message", messageText, messageId);
  });

  // recover lost messages
  if (!socket.recovered) {
    const rows = await Message.getMessages(socket.handshake.auth.serverOffset);
    rows.forEach((row) => {
      socket.emit("chat message", row.content, row.id.toString());
    });
  }
});

// logs
app.use(logger("dev"));

// routes
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/client/index.html");
});
