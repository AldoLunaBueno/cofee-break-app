import { Server } from "socket.io";

// persistance
import Message from "../models/message.js";

export default function setupChatSocket(httpServer) {
  const io = new Server(httpServer, {
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
    },
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
      const rows = await Message.getMessages(
        socket.handshake.auth.serverOffset
      );
      rows.forEach((row) => {
        socket.emit("chat message", row.content, row.id.toString());
      });
    }
  });
}
