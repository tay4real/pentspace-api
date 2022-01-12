const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const uniqid = require("uniqid");

//Register
router.post("/register", async (req, res) => {
  try {
    let username = uniqid("user-");
    if (req.body.username) {
      username = req.body.username;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: username,
      userCategory: req.body.userCategory,
      email: req.body.email,
      password: hashedPass,
    });

    const user = await newUser.save();
    const { password, updatedAt, __v, createdAt, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.username === 1) {
        res.status(403).json("Username already used");
      } else if (error.keyPattern.email === 1) {
        res.status(403).json("Email already used");
      } else {
        res.status(403).json("User credentials already exist");
      }
    } else {
      res.status(500).json(error);
    }
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(400).json("Wrong credentials");

    const validated = await bcrypt.compare(req.body.password, user.password);
    !validated && res.status(400).json("Wrong credentials");

    const { password, ...others } = user._doc;

    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
