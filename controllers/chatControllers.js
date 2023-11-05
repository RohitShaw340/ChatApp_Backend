const expressAsyncHandler = require("express-async-handler");
const Chats = require("../Models/chat");

const accessChats = expressAsyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      console.log("UserId pram not sent with req");
      return res.sendStatus(400);
    }
    const isChat = await Chats.find({
      isGroupChat: false,
      $and: [
        { Users: { $elemMatch: { $eq: req.user._id } } },
        { Users: { $elemMatch: { $eq: userId } } },
      ],
    }).populate("Users", "-password");

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        Users: [req.user._id, userId],
      };
      const createChat = await Chats.create(chatData);
      console.log(createChat);
      const FullChat = await Chats.findOne({ _id: createChat._id }).populate(
        "Users",
        "-password"
      );
      res.status(200).send(FullChat);
    }
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    const result = await Chats.find({
      Users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("Users", "-password")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 });
    res.status(200).send(result);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const createGroupChat = expressAsyncHandler(async (req, res) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Please Fill All Fields" });
    }

    let users = JSON.parse(req.body.users);
    if (users.length < 2) {
      return res
        .status(200)
        .send("More tha 2 users must be required to form a group");
    }
    users.push(req.user);
    const groupChat = await Chats.create({
      chatName: req.body.name,
      Users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    const result = await Chats.findOne({ _id: groupChat._id })
      .populate("Users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).send(result);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const renameGroup = expressAsyncHandler(async (req, res) => {
  try {
    const { chatId, new_chatName } = req.body;
    const updatedChat = await Chats.findByIdAndUpdate(
      chatId,
      { chatName: new_chatName },
      { new: true }
    )
      .populate("Users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.status(200).send(updatedChat);
    }
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const addGroupMember = expressAsyncHandler(async (req, res) => {
  try {
    const { chatId, member } = req.body;
    const added = await Chats.findByIdAndUpdate(
      chatId,
      { $push: { Users: member } },
      { new: true }
    )
      .populate("Users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.status(200).send(added);
    }
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

const removeGroupMember = expressAsyncHandler(async (req, res) => {
  try {
    const { chatId, member } = req.body;
    const removed = await Chats.findByIdAndUpdate(
      chatId,
      { $pull: { Users: member } },
      { new: true }
    )
      .populate("Users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.status(200).send(removed);
    }
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

module.exports = {
  accessChats,
  fetchChats,
  createGroupChat,
  renameGroup,
  addGroupMember,
  removeGroupMember,
};
