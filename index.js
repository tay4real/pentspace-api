const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const multer = require("multer");

const routes = require("./routes");
const passport = require("./utils/passport");

const app = express();

// const whitelist = [process.env.FE_URL];
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// };

// Middleware
app.use(cors());

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
app.listen(port, () => {
  console.log("Backend server is running on port " + port);
});

app.on("error", (error) => console.log("Backend server is not running "));
