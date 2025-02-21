import { Server } from "socket.io";
import cors from "cors";

// persistance
import Message from "../models/message.js";

export default function setupChatSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
    },
  });

  io.on("connection", async (socket) => {
    console.log("A user has connected");
    socket.on("disconnect", () => {
      console.log("A user has diconnected");
    });
    socket.on("chat message", async (content) => {
      console.log(content)
      const message = await Message.create(content);

      // message to all users
      const messageId = message.lastInsertRowid.toString();
      io.emit("chat message", content, messageId);
    });

    // recover lost messages
    if (!socket.recovered) {
      const rows = await Message.getMessages(
        socket.handshake.auth.serverOffset
      );
      rows.forEach((row) => {
        socket.emit("chat message", row.content, row.id.toString());
      });
    }
  });
}
