const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { cloudinaryPost, cloudinaryDestroy } = require("../utils/cloudinary");

//create a post
router.post("/", async (req, res) => {
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
  cloudinaryPost.array("postImg"),
  async (req, res, next) => {
    try {
      const upload = await req.files.map(async (file) => {
        console.log(file);
        await Post.findByIdAndUpdate(req.params.id, {
          $push: {
            img: file.path,
          },
        });
      });

      if (upload) {
        res.status(200).json({ success: true, message: "Uploaded Successfully" });
      }
    } catch (error) {
      console.log('Error while uploading profile image', error.message);
      res.status(500).json({success: false, message: 'Server error, try after some time'})
      next(error);
    }
  }
);

//update a post
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
router.put("/:id/like", async (req, res) => {
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
    res.status(500).json(err);
  }
});

//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts
router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);

    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
