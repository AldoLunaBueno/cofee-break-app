// server
import express from "express";
import { createServer } from "node:http";
import logger from "morgan";
import setupChatSocket from "./sockets/chatSocket.js";
import cors from "cors"

// server up and running for incomming requests
const app = express();
const httpServer = createServer(app);

httpServer.listen(3000, async () => {
  console.log(`Server running on port 3000`);
});

// Middleware
app.use(logger("dev"));
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"]
}))

// Sockets
setupChatSocket(httpServer)

// Routes
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/client/index.html");
});
