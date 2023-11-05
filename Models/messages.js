const mongoose = require("mongoose");
const message_schema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    content: { type: String },
  },
  {
    timestamps: true,
  }
);

const Messages =
  mongoose.model.Messages || mongoose.model("Messages", message_schema);
module.exports = Messages;
