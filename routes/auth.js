const router = require("express").Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const axios = require("axios");
const otpGenerator = require("otp-generator");

const User = require("../models/User");
const Otp = require("../models/Otp");

const uniqid = require("uniqid");
const jwt = require("jsonwebtoken");
const mailgun = require("mailgun-js");
const DOMAIN = "sandboxeeb91caad5754de2a3f3f42c8e6957d8.mailgun.org";
const mg = mailgun({
  apiKey: process.env.MAILGUN_APIKEY,
  domain: DOMAIN,
});

const { checkRefreshToken } = require("../middlewares/auth");
const { TokenPairs } = require("../utils/jwt");
const passport = require("../utils/passport");

//Register
router.post("/signup", async (req, res) => {
  try {
    User.findOne({ email: req.body.email }).exec((err, user) => {
      if (user) {
        return res
          .status(400)
          .json({ errorMsg: "User with this email aleady exists." });
      }
    });

    const OTP = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const data = {
      from: "noreply@pentspace.com",
      to: req.body.email,
      subject: "Confirmation Code",
      html: `<h2>Thank you for registering on Pentspace</h2>
      <P>Please complete your registration using the confirmation code</P>
      <h3>${OTP}</h3><p>Valid within 5 minutes.</p>`,
    };
    mg.messages().send(data, function (error, body) {
      console.log(body);
    });

    const otp = new Otp({ email: req.body.email, otp: OTP });
    const salt = await bcrypt.genSalt(10);
    otp.otp = await bcrypt.hash(otp.otp, salt);
    const result = await otp.save();
    return res.status(200).json({
      successMsg:
        "Thanks for signing up. A confirmation code has been sent to your Email.",
    });
  } catch (error) {
    res.status(500).json({ errorMsg: "Sorry, An error occured: " + error });
    console.log(error);
  }
});

router.post("/signup/verify", async (req, res) => {
  try {
    const { otp, email, password } = req.body;

    const username = email.substring(0, email.lastIndexOf("@"));

    const otpHolder = await Otp.find({
      email: email,
    });

    if (otpHolder.length === 0)
      return res.status(400).send("You use an Expired OTP!");

    const rightOtpFind = otpHolder[otpHolder.length - 1];
    const validUser = await bcrypt.compare(otp, rightOtpFind.otp);

    if (rightOtpFind.email === email && validUser) {
      const user = await new User({
        username: username,
        email: email,
        password: password,
      }).save();

      const tokenPair = await TokenPairs({ _id: user._id });

      const OTPDelete = await Otp.deleteMany({
        email: rightOtpFind.email,
      });

      // send token
      return res.status(200).json({
        successMsg: "User Registration Successfull",
        user,
        tokenPair,
      });
    } else {
      return res.status(400).json({
        errorMsg: "Sorry, the confirmation code is wrong or has expired",
      });
    }
  } catch (error) {
    res.status(500).json({ errorMsg: "Sorry, An error occured: " + error });
  }
});

router.post(
  "/refreshToken",
  passport.authenticate("refresh"),
  async (req, res, next) => {
    try {
      const { tokens } = req.user;

      res.status(200).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ errorMsg: error.message });
    }
  }
);

router.post("/login", async (req, res, _next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByCredentials(email, password);

    if (user) {
      const tokenPairs = await TokenPairs({ _id: user._id });

      res.status(200).json({ tokenPairs, user });
    } else {
      res.status(401).send({ errorMsg: "Email or password is incorrect" });
    }
  } catch (error) {
    res.status(500).send({ errorMsg: error.message });
  }
});

module.exports = router;
