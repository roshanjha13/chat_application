const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  room:      { type: String, required: true, index: true },
  username:  { type: String, required: true },
  text:      { type: String, required: true },
  type:      { type: String, enum: ["message", "system"], default: "message" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);