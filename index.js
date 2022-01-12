const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const helmet = require("helmet")
// const morgan = require("morgan")
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const healthcareServiceRoute = require("./routes/heathcareservices");
const rating = require("./routes/ratings");
const multer = require("multer");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL, {
    useNewURLParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DBConnection Successful!"))
  .catch((err) => {
    console.log(err);
  });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("file has been uploaded");
});

// Middleware
app.use(express.json());
// app.use(helmet())
// app.use(morgan("common"))

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
