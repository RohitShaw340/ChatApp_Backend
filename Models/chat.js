const mongoose = require("mongoose");

const chat_schema = mongoose.Schema(
  {
    chatName: { type: String, trim: true, required: true },
    isGroupChat: { type: Boolean, default: false },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    Users: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    latestMassege: { type: mongoose.Schema.Types.ObjectId, ref: "Messages" },
  },
  { timestamps: true }
);

const Chats = mongoose.model.Chats || mongoose.model("Chats", chat_schema);

module.exports = Chats;
