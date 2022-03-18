const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const multer = require("multer");

const routes = require("./routes");
const oauth = require("./middlewares/auth/oauth");

const app = express();

const whitelist = [process.env.FE_URL];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json());

app.use(passport.initialize());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewURLParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DBConnection Successful!"))
  .catch((err) => {
    console.log(err);
  });

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Pentspace API");
});

app.use("/api", routes);

let port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log("Backend server is running on port " + port);
});

app.on("error", (error) => console.log("Backend server is not running "));

const io = require("socket.io")(server);

// , {
//   pingTimeout: 10000,
//   cors: {
//     origin: process.env.FE_URL,
//     // credentials: true,
//   },
// }

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
    socket.emit("online", userData._id);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    console.log("New Message", newMessageRecieved);
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
      //socket.emit("message received", newMessageRecieved);
    });
  });

  socket.on("new post", (data) => {
    console.log(data.newpost, data.sender);

    socket.emit("new post recieved", {
      newpost: data.newpost,
      sender: data.sender,
    });
  });

  socket.on("like post", (data) => {
    console.log(data.postid, data.userid);

    socket.emit("liked", {
      postid: data.postid,
      userid: data.userid,
    });
  });

  socket.on("comment", (data) => {
    console.log(data.postid, data.comment, data.userid);

    socket.emit("comment", {
      postid: data.postid,
      userid: data.userid,
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
