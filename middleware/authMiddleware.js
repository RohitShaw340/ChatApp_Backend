const jwt = require("jsonwebtoken");
const User = require("../Models/user");
const expressAsyncHandler = require("express-async-handler");

const protect = expressAsyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      const user_id = await User.findById(decode.id).select("-password");
      req.user = user_id;
      next();
    } catch (err) {
      console.log(err);
      res.status(401);
      throw new Error("Not authorized , token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized , no token");
  }
});

module.exports = protect;
