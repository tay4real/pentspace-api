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

//Register
router.post("/signup", async (req, res) => {
  try {
    User.findOne({ email: req.body.email }).exec((err, user) => {
      if (user) {
        return res
          .status(400)
          .json({ error: "User with this email aleady exists." });
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
      <P>Please complete your registration using the confirmation code</>
      <h4>${OTP}</h4>
      <p>Please note: This code expires after 5 minutes</p>`,
    };
    mg.messages().send(data, function (error, body) {
      console.log(body);
    });

    const otp = new Otp({ email: req.body.email, otp: OTP });
    const salt = await bcrypt.genSalt(10);
    otp.otp = await bcrypt.hash(otp.otp, salt);
    const result = await otp.save();
    return res.status(200).json({
      success:
        "Thanks for signing up. A confirmation code has been sent to your Email.",
    });
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

router.post("/signup/verify", async (req, res) => {
  try {
    const { otp, email, password } = req.body;

    const otpHolder = await Otp.find({
      email: email,
    });

    if (otpHolder.length === 0)
      return res.status(400).send("You use an Expired OTP!");

    const rightOtpFind = otpHolder[otpHolder.length - 1];
    const validUser = await bcrypt.compare(otp, rightOtpFind.otp);

    const username = uniqid();
    const salt = await bcrypt.genSalt(10);
    hashedPass = await bcrypt.hash(password, salt);

    if (rightOtpFind.email === email && validUser) {
      const user = new User({
        username: username,
        email: email,
        password: hashedPass,
      });
      // const token = user.generateJWT();
      const result = await user.save();
      const OTPDelete = await Otp.deleteMany({
        email: rightOtpFind.email,
      });
      return res.status(200).send({
        message: "User Registration Successfull",

        data: result,
      });
    } else {
      return res.status(400).send("Your OTP was wrong");
    }
  } catch (error) {
    res.status(500).json(error);
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
