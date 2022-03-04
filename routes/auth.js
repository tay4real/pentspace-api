const router = require("express").Router();
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");

const User = require("../models/User");
const Otp = require("../models/Otp");

const mailgun = require("mailgun-js");
const DOMAIN = "sandboxeeb91caad5754de2a3f3f42c8e6957d8.mailgun.org";
const mg = mailgun({
  apiKey: process.env.MAILGUN_APIKEY,
  domain: DOMAIN,
});

const { authenticate, verifyRefreshToken } = require("../utils/jwt");
const passport = require("../utils/passport");

//Register
router.post("/signup", async (req, res) => {
  try {
    User.findOne({ email: req.body.email }).exec(async (err, user) => {
      if (user) {
        return res.status(400).json({
          error: true,
          message: "User with this email aleady exists.",
        });
      } else {
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
          success: true,
          message:
            "Thanks for signing up. A confirmation code has been sent to your Email.",
        });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Sorry, An error occured: " + error });
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

      const tokenPair = await authenticate({ _id: user._id });

      const OTPDelete = await Otp.deleteMany({
        email: rightOtpFind.email,
      });

      // send token
      return res.status(200).json({
        message: "User Registration Successfull",
        data: user,
        tokenPair,
        success: true,
      });
    } else {
      return res.status(400).json({
        error: true,
        message: "Sorry, the confirmation code is wrong or has expired",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Sorry, An error occured: " + error });
  }
});

router.post("/forgotpassword", async (req, res) => {
  try {
    User.findOne({ email: req.body.email }).exec(async (err, user) => {
      if (!user) {
        return res.status(400).json({
          error: true,
          message: "User with this email account does not exist.",
        });
      } else {
        const OTP = otpGenerator.generate(6, {
          digits: true,
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          specialChars: false,
        });

        const data = {
          from: "noreply@pentspace.com",
          to: req.body.email,
          subject: "Password Reset",
          html: `<h2>Request to Reset your password on Pentspace</h2>
      <P>Complete your password reset using this OTP</P>
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
          success: true,
          message: "Complete your password rest using OTP sent to your Email.",
          id: user._id,
          email: req.body.email,
        });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Sorry, An error occured: " + error });
    console.log(error);
  }
});

router.put("/resetpassword", async (req, res) => {
  try {
    const { otp, email, password, id } = req.body;

    const username = email.substring(0, email.lastIndexOf("@"));

    const otpHolder = await Otp.find({
      email: email,
    });

    if (otpHolder.length === 0)
      return res.status(400).send("You use an Expired OTP!");

    const rightOtpFind = otpHolder[otpHolder.length - 1];
    const validUser = await bcrypt.compare(otp, rightOtpFind.otp);

    if (rightOtpFind.email === email && validUser) {
      const OTPDelete = await Otp.deleteMany({
        email: rightOtpFind.email,
      });

      if (req.body.password) {
        try {
          const salt = await bcrypt.genSalt(10);
          req.body.password = await bcrypt.hash(req.body.password, salt);
        } catch (err) {
          return res.status(500).json({ error: err });
        }
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(id, {
          $set: req.body,
        });
        if (updatedUser) {
          res.status(201).json({
            success: true,
            message: "Password reset successful. You can now login.",
          });
        }
      } catch (error) {
        res.status(500).json({ error: true, message: error.message });
      }
    } else {
      return res.status(400).json({
        error: true,
        message: "Sorry, your OTP is wrong or has expired",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Sorry, An error occured: " + error });
  }
});

router.post("/refreshToken", async (req, res) => {
  try {
    // Grab the refresh token
    const oldRefreshToken = req.body.refreshToken;

    // Verify old refresh token
    const { payload, expired } = await verifyRefreshToken(oldRefreshToken); //  decoded._id

    if (payload) {
      // if everything is ok I can create new access and refresh tokens

      const tokenPair = await authenticate({ _id: payload._id });
      console.log(tokenPair);
      res.status(200).json({ success: true, tokenPair });
    } else {
      res.status(500).json({ error: true, message: expired });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

router.post("/login", async (req, res, _next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByCredentials(email, password);

    if (user) {
      const { accessToken, refreshToken } = await authenticate({
        _id: user._id,
      });

      res.status(200).json({
        success: true,
        tokenPair: { accessToken, refreshToken },
        user,
      });
    } else {
      res
        .status(401)
        .send({ error: true, message: "Email or password is incorrect" });
    }
  } catch (error) {
    res.status(500).send({ error: true, message: error.message });
  }
});

router.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      res.cookie("accessToken", req.user.tokens.accessToken, {
        httpOnly: true,
      });
      res.cookie("refreshToken", req.user.tokens.refreshToken, {
        httpOnly: true,
        path: "/users/refreshToken",
      });

      console.log("accessToken", req.user.tokens.accessToken);
      console.log("refreshToken", req.user.tokens.refreshToken);

      //A possible solution to send access token and refresh token to the frontend
      // is to add them to the url
      // res.status(200).redirect("http://localhost:3000/" + "?accessToken" + req.user.tokens.accessToken + "?refreshToken" + req.user.tokens.refreshToken )
      // then at the front end, you can extract the and store then in local storage for example

      res
        .status(200)
        .redirect(
          process.env.FE_URL +
            "?accessToken" +
            req.user.tokens.accessToken +
            "?refreshToken" +
            req.user.tokens.refreshToken
        );
    } catch (error) {
      next(error);
    }
  }
);

// router.post("/verifyGoogleLogin", async (req, res) => {
//   try {
//     const { email, password, googleId } = req.body;

//     const user = await User.findByCredentials(email, password);

//     if (user) {
//       if (user.googleId === googleId) {
//         const { accessToken, refreshToken } = await authenticate({
//           _id: user._id,
//         });

//         res.status(200).json({
//           success: true,
//           tokenPair: { accessToken, refreshToken },
//           user,
//         });
//       } else {
//         res.status(401).send({
//           error: true,
//           message:
//             "You did not register on this platform using Google, try another signin method!",
//         });
//       }
//     }

//     return res.status(200).json({
//       message: "New User",
//       success: true,
//     });
//   } catch (error) {
//     res.status(500).send({ error: true, message: error.message });
//   }
// });

// router.post("/googleSignUp", async (req, res) => {
//   try {
//     User.findOne({ email: req.body.email }).exec((err, user) => {
//       if (user) {
//         return res.status(400).json({
//           error: true,
//           message: "User with this email aleady exists.",
//         });
//       }
//     });

//     const {
//       email,
//       password,
//       profilePic,
//       username,
//       surname,
//       name,
//       firstname,
//       googleId,
//     } = req.body;

//     const user = await new User({
//       email,
//       password,
//       profilePic,
//       username,
//       surname,
//       name,
//       firstname,
//       googleId,
//     }).save();

//     const tokenPair = await authenticate({ _id: user._id });

//     return res.status(200).json({
//       message: "User Registration Successfull",
//       data: user,
//       tokenPair,
//       success: true,
//     });
//   } catch (error) {
//     res.status(500).send({ error: true, message: error.message });
//   }
// });

module.exports = router;
