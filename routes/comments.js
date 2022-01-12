const router = require("express").Router();
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

//create a comment
router.post("/", async (req, res) => {
  const newComment = new Comment(req.body);
  try {
    const savedComment = await newComment.save();
    console.log(savedComment);
    res.status(200).json(savedComment);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

//update a comment
router.put("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (comment.userId === req.body.userId) {
      await comment.updateOne({ $set: req.body });
      res.status(200).json("The comment has been updated ");
    } else {
      res.status(403).json("You can only update your comment");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete a comment
router.delete("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (comment.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("The comment has been deleted ");
    } else {
      res.status(403).json("You can only delete your comment");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//like a comment
router.put("/:id/like", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The comment has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The comment has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a comment
router.get("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline comments
router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const currentPost = await Post.findById(req.body.postId);

    const userComments = await Comment.find({
      userId: currentUser._id,
      postId: currentPost._id,
    });
    const friendComments = await Promise.all(
      currentUser.following.map((friendId) => {
        return Comment.find({ userId: friendId, postId: currentPost._id });
      })
    );
    res.json(userComments.concat(...friendComments));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
