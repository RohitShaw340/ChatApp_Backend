const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConnect = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const httpServer = createServer(app);
dotenv.config();
app.use(express.json());
app.use(cors());
// var allowedOrigins = [
//   "http://192.168.0.102:3000",
//   "http://localhost:3000",
//   "http://103.226.202.144/",
// ];
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // allow requests with no origin
//       // (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         var msg =
//           "The CORS policy for this site does not " +
//           "allow access from the specified Origin.";
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//   })
// );

const port = process.env.PORT || 3001;
console.log(port);
dbConnect();

app.get("/", (req, res) => {
  res.send("welcome to Chat App Talk-A-Tive");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

// const server = app.listen(port, console.log("server started"));

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});
// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });

io.on("connection", (socket) => {
  console.log("connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData?._id);
    console.log(userData?._id);
    socket.emit("connection");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room : " + room);
  });

  socket.on("new message", (newMessageRecived) => {
    let { chat, message } = newMessageRecived;
    // let  = newMessageRecived.message;
    console.log("chat", chat);
    if (!chat || !chat.Users || !message)
      return console.log("chat.user not defined");
    chat.Users.forEach((user) => {
      if (user._id == message.sender._id) return;
      socket.in(user._id).emit("message recived", newMessageRecived);
      console.log("sent", newMessageRecived);
    });
  });

  socket.on("typing", (room) => {
    const { selectedChat, user } = room;
    if (!selectedChat || !selectedChat.Users || !user)
      return console.log("chat.user not defined");
    selectedChat.Users.forEach((person) => {
      if (person._id === user._id) return;
      socket.in(person._id).emit("typing");
      // console.log("sent", newMessageRecived);
    });
    // socket.in(room).emit("typing")
  });

  socket.on("stop typing", (room) => {
    const { selectedChat, user } = room;
    if (!selectedChat || !selectedChat.Users || !user)
      return console.log("chat.user not defined");
    selectedChat.Users.forEach((person) => {
      if (person._id === user._id) return;
      socket.in(person._id).emit("stop typing");
      // console.log("sent", newMessageRecived);
    });
    // socket.in(room).emit("stop typing")
  });

  socket.off("setup", () => {
    console.log("user disconnected");
    socket.leave(userData._id);
  });
});

httpServer.listen(port, console.log("server started"));
