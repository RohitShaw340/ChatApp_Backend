const express = require("express");
const {
  registerUser,
  Login,
  allUsers,
} = require("../controllers/userControllers");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", Login);
router.get("/", protect, allUsers);

module.exports = router;
