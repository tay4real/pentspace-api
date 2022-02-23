const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { cloudinaryPost, cloudinaryDestroy } = require("../utils/cloudinary");
const q2m = require("query-to-mongo");

const { authorize } = require("../middlewares/auth");

//create a post
router.post("/", authorize, async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    console.log(savedPost);
    res.status(200).json(savedPost);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

router.post(
  "/:id/upload",
  authorize,
  cloudinaryPost.array("postImg"),
  async (req, res, next) => {
    try {
      const upload = await req.files.map(async (file) => {
        console.log(file);
        await Post.findByIdAndUpdate(req.params.id, {
          $push: {
            postImage: file.path,
          },
        });
      });

      if (upload) {
        res
          .status(200)
          .json({ success: true, message: "Uploaded Successfully" });
      }
    } catch (error) {
      console.log("Error while uploading profile image", error.message);
      res
        .status(500)
        .json({ success: false, message: "Server error, try after some time" });
      next(error);
    }
  }
);

//update a post
router.put("/:id", authorize, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated ");
    } else {
      res.status(403).json("You can only update your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete a post
router.delete("/:id", authorize, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("The post has been deleted ");
    } else {
      res.status(403).json("You can only delete your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//like a post
router.put("/:id/like", authorize, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

//get a post
router.get("/:id", authorize, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", authorize, async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await Post.countDocuments(query.criteria);
    const allposts = await Post.find(query.criteria)
      .sort(query.options.sort)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .populate("user");

    res.status(200).json({ total: total, data: allposts.reverse() });
  } catch (error) {
    next(new Error(error.message));
  }
});

// router.get("/", authorize, async (req, res, next) => {
//   try {
//     const query = q2m(req.query);

//     const users = await UserModel.find(query.criteria, query.options.fields)
//       .find(query.criteria)
//       .sort(query.options.sort)
//       .skip(query.options.skip)
//       .limit(query.options.limit)
//       .populate("user");

//     res.send(users);
//   } catch (error) {
//     next(new Error(error.message));
//   }
// });

//get timeline posts
router.get("/timeline/all/:id", authorize, async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    console.log(userPosts);
    res.json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
    console.log(err.message);
  }
});

module.exports = router;
