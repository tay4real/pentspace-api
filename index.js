const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const multer = require("multer");
dotenv.config();

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const healthcareServiceRoute = require("./routes/heathcareservices");
const rating = require("./routes/ratings");

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
app.use(express.json());

app.use(cors());

app.use(cookieParser("secretcode"));

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
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/healthcareservices", healthcareServiceRoute);
app.use("/api/healthserviceratings", rating);

let port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Backend server is running on port " + port);
});
