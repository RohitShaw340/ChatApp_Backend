const expressAsyncHandler = require("express-async-handler");
const Messages = require("../Models/messages");
const MessageCollection = require("../Models/messageCollection");
const Chats = require("../Models/chat");
const Users = require("../Models/user");

const sendMessage = expressAsyncHandler(async (req, res) => {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
      res.status(400);
      throw new Error("Invalid data passed into request");
    }
    let newMessage = {
      sender: req.user._id,
      content: content,
    };

    const result = await Messages.create(newMessage);
    const final_result = await result.populate("sender", "name pic");
    const update = await MessageCollection.findOneAndUpdate(
      { chatId: chatId },
      { $push: { message: result._id } },
      { new: true }
    );
    console.log(update);
    if (!update) {
      const new_message_collec = { chatId: chatId, message: [result._id] };
      const mess_collec = await MessageCollection.create(new_message_collec);
      console.log(mess_collec);
    }
    const chat_result = await Chats.findByIdAndUpdate(
      chatId,
      { latestMassege: result._id },
      { new: true }
    );
    console.log(chat_result);
    res.status(200).send(final_result);
  } catch (err) {
    console.log(err);
    res.status(400);
    throw new Error(err.message);
  }
});

const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    const chatId = req.params.chatId;
    // console.log(chatId);
    const result = await MessageCollection.findOne({ chatId: chatId }).populate(
      "message",
      "sender content"
    );
    //   .populate("sender", "name pic email");
    const final_result = await Users.populate(result, {
      path: "message",
      populate: {
        path: "sender",
        select: "name pic email",
      },
    });
    res.send(final_result);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
    throw new Error(err.message);
  }
});

module.exports = { sendMessage, allMessages };
