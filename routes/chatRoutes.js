const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  accessChats,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeGroupMember,
  addGroupMember,
} = require("../controllers/chatControllers");
const router = express.Router();

router.get("/", protect, fetchChats);

router.post("/", protect, accessChats);
router.post("/group", protect, createGroupChat);

router.put("/rename", protect, renameGroup);
router.put("/group/remove", protect, removeGroupMember);
router.put("/group/add", protect, addGroupMember);

module.exports = router;
