import db from "../config/db.js";

class Message {
  static async create(message) {
    try {
      await db.execute({
        sql: "INSERT INTO messages (content) VALUES (:message)",
        args: { message },
      });
    } catch (err) {
      console.log(err);
      return;
    }
  }

  static async getMessages(sinceID = 0) {
    try {
      const result = await db.execute({
        sql: "SELECT id, content FROM messages WHERE id > ?",
        args: [sinceID],
      });
      return result.rows;
    } catch (err) {
      console.log(err);
      return;
    }
  }
}

export default Message;
