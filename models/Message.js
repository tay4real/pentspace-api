const { Schema, model } = require("mongoose");

const MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "user" },
    content: { type: String, trim: true },
    chat: { type: Schema.Types.ObjectId, ref: "chat" },
    readBy: [{ type: Schema.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

module.exports = model("message", MessageSchema);
