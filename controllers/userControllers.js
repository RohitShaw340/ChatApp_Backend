const asyncHandler = require("express-async-handler");
const User = require("../Models/user");
const generateToken = require("../config/generateToken");

// REGISTER :-

const registerUser = asyncHandler(async (req, res) => {
  //   console.log(req.body);
  try {
    // console.log(req.body);
    const { name, email, password, pic } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter All the Fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User Already Exists");
    }

    const result = await User.create({ name, email, password, pic });
    if (result) {
      res.status(201).send({
        _id: result._id,
        name: result.name,
        email: result.email,
        pic: result.pic,
        token: generateToken(result._id),
      });
    } else {
      res.status(400);
      throw new Error("Fail To create user");
    }
  } catch (err) {
    console.log(err);
    res.status(400);
    throw new Error(err);
  }
});

// LOGIN :-

const Login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Enter Complete Details");
    }

    const result = await User.findOne({ email });
    if (result && (await result.matchPassword(password))) {
      res.status(201).send({
        _id: result._id,
        name: result.name,
        email: result.email,
        pic: result.pic,
        token: generateToken(result._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400);
    throw new Error(err);
  }
});

// GET ALL USERS :-

const allUsers = asyncHandler(async (req, res) => {
  try {
    const query = req.query.search
      ? {
          $and: [
            {
              $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
              ],
            },
            { _id: { $ne: req.user._id } },
          ],
        }
      : {};
    const result = await User.find(query);
    res.send(result);
  } catch (err) {
    res.status(400);
    throw new Error(err);
  }
});

module.exports = { registerUser, Login, allUsers };
