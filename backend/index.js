// server
import express from "express";
import { createServer } from "node:http";
import logger from "morgan";
import setupChatSocket from "./sockets/chatSocket.js";

// server up and running for incomming requests
const port = process.env.PORT ?? 3000;
const ipAddress = "192.168.1.5";
const app = express();
const httpServer = createServer(app);

httpServer.listen(port, ipAddress, async () => {
  console.log(`Server running on port ${port} and IP address ${ipAddress}`);
});

// Middleware
app.use(logger("dev"));

// Sockets
setupChatSocket(httpServer)

// Routes
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/client/index.html");
});
