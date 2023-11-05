const mongoose = require("mongoose");

const messageCollection_schema = mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chats",
    required: true,
  },
  message: [{ type: mongoose.Schema.Types.ObjectId, ref: "Messages" }],
});

const MessageCollection = mongoose.model(
  "MessageCollection",
  messageCollection_schema
);
module.exports = MessageCollection;
