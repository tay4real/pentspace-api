const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");
const passport = require("../utils/passport");
const { defaultAvatar } = require("../utils/defaultAvatar");
const q2m = require("query-to-mongo");
const {
  checkBearerToken,
  checkRefreshToken,
  isAuthorizedUser,
} = require("../middlewares/auth");
const { cloudinaryAvatar, cloudinaryDestroy } = require("../utils/cloudinary");

//
router
  .route("/me")
  .get(checkBearerToken, checkRefreshToken, async (req, res, next) => {
    try {
      res.send(req.user.toJSON());
    } catch (error) {
      next();
    }
  })
  .put(checkBearerToken, checkRefreshToken, async (req, res, next) => {
    try {
      const updates = Object.keys(req.body);
      updates.forEach((update) => (req.user[update] = req.body[update]));
      await req.user.save();
      res.send(req.user);
    } catch (error) {
      next(error);
      //res.send({ error: true, message: error.message });
    }
  });

router
  .route("/me/avatar")
  .put(
    checkBearerToken,
    checkRefreshToken,
    cloudinaryAvatar.single("avatar"),
    async (req, res, next) => {
      try {
        const data = parse(req.user.profilePic);
        if (data.name) await cloudinaryDestroy(data);
        req.user.profilePic = req.file.path;
        await req.user.save();
        res.status(201).send(req.user);
      } catch (error) {
        next(error);
      }
    }
  )
  .delete(checkBearerToken, checkRefreshToken, async (req, res, next) => {
    try {
      const data = parse(req.user.profilePic);
      if (data.name) await cloudinaryDestroy(data);
      req.user.avatar = defaultAvatar(req.user.firstName, req.user.lastName);
      delete req.user.profilePic.public_id;
      await req.user.save();
      res.send(req.user);
    } catch (error) {
      next(error);
    }
  });

//Update
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      if (updatedUser) {
        res.status(200).json({ successMsg: "Account has been updated" });
      }
    } catch (error) {
      res.status(500).json({ errorMsg: error });
    }
  } else {
    return res
      .status(401)
      .json({ errorMsg: "You can update only your account!" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findById(req.params.id);
      try {
        await Post.deleteMany({ username: user.username });
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
      } catch (error) {
        res.status(500).json(error);
      }
    } catch (err) {
      res.status(404).json("User not found!");
    }
  } else {
    res.status(401).json("You can delete only your account!");
  }
});

// Get User
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// follow a user
router.put(
  "/:id/follow",

  async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);

        if (!user.followers.includes(req.body.userId)) {
          await user.updateOne({ $push: { followers: req.body.userId } });
          await currentUser.updateOne({ $push: { following: req.params.id } });
          res.status(200).json("User has been followed");
        } else {
          res.status(403).json("You already followed this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("You cannot follow yourself");
    }
  }
);

// unfollow a user
router.put(
  "/:id/unfollow",

  async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);

        if (user.followers.includes(req.body.userId)) {
          await user.updateOne({ $pull: { followers: req.body.userId } });
          await currentUser.updateOne({ $pull: { following: req.params.id } });
          res.status(200).json("User has been unfollowed");
        } else {
          res.status(403).json("You are not following this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("You cannot unfollow yourself");
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const query = q2m(req.query);

    const users = await User.find(query.criteria, query.options.fields)
      .find(query.criteria)
      .sort(query.options.sort)
      .skip(query.options.skip)
      .limit(query.options.limit);

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
    next();
  }
});

module.exports = router;
