const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");
const { defaultAvatar } = require("../utils/defaultAvatar");
const q2m = require("query-to-mongo");
const { authorize } = require("../middlewares/auth");
const { cloudinaryAvatar, cloudinaryDestroy } = require("../utils/cloudinary");

router.get("/me", authorize, async (req, res, next) => {
  try {
    console.log("@here", req.user);
    res.status(200).json({ success: true, data: req.user });
    next();
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
    next();
  }
});

router.put("/profile/me", authorize, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(201).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

router.put(
  "/profile/me/avatar",
  authorize,
  cloudinaryAvatar.single("avatar"),
  async (req, res) => {
    try {
      const data = req.user.profilePic;
      if (data.name) await cloudinaryDestroy(data);
      req.user.profilePic = req.file.path;
      await req.user.save();
      res.status(201).json({ user: req.user });
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
  }
);

router.delete("/profile/me/avatar", authorize, async (req, res) => {
  try {
    const data = parse(req.user.profilePic);
    if (data.name) await cloudinaryDestroy(data);
    req.user.profilePic = defaultAvatar(req.user.username);
    await req.user.save();
    res.status(201).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

router.put("/:id", authorize, async (req, res) => {
  if (req.body.userId === req.params.id) {
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
        res.status(201).json({ success: true, user: updatedUser });
      }
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
  } else {
    return res
      .status(401)
      .json({ error: true, message: "You can update only your account!" });
  }
});

// Delete
router.delete("/:id", authorize, async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      try {
        await Post.deleteMany({ user: user._id });
        await User.findByIdAndDelete(req.params.id);
        res
          .status(200)
          .json({ success: true, message: "User has been deleted..." });
      } catch (error) {
        res.status(500).json(error);
      }
    } catch (err) {
      res.status(404).json({ error: true, message: "User not found!" });
    }
  } else {
    res
      .status(401)
      .json({ error: true, message: "You can delete only your account!" });
  }
});

// Get User
router.get("/:id", authorize, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // const { password, updatedAt, ...others } = user._doc;
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// follow a user
router.put("/:id/follow", authorize, async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        res
          .status(200)
          .json({ success: true, follow: "User has been followed" });
      } else {
        res
          .status(403)
          .json({ error: true, followed: "You already followed this user" });
      }
    } catch (err) {
      res.status(500).json({ error: true, message: err.message });
    }
  } else {
    res
      .status(403)
      .json({ error: true, message: "You cannot follow yourself" });
  }
});

// unfollow a user
router.put("/:id/unfollow", authorize, async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });
        res
          .status(200)
          .json({ success: true, unfollow: "User has been unfollowed" });
      } else {
        res
          .status(403)
          .json({ error: true, message: "You are not following this user" });
      }
    } catch (err) {
      res.status(500).json({ error: true, message: err });
    }
  } else {
    res
      .status(403)
      .json({ error: true, message: "You cannot unfollow yourself" });
  }
});

// router.get("/", authorize, async (req, res, next) => {
//   try {
//     const query = q2m(req.query);

//     const users = await User.find(query.criteria, query.options.fields)
//       .find(query.criteria)
//       .sort(query.options.sort)
//       .skip(query.options.skip)
//       .limit(query.options.limit);

//     res.status(200).json({ success: true, data: users });
//   } catch (error) {
//     res.status(500).json({ error: true, message: error.message });
//     next();
//   }
// });

router.get("/", authorize, async (req, res, next) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    // res.send(users);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
    next();
  }
});

module.exports = router;
