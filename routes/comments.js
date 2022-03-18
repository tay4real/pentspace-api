const router = require("express").Router();
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");
const { authorize } = require("../middlewares/auth");
const q2m = require("query-to-mongo");

//create a comment
router.post("/", async (req, res) => {
  const { user, postId, comment } = req.body;
  const newComment = new Comment({
    user,
    postId,
    comment,
  });
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
      const updated = await comment.updateOne({ $set: req.body });
      res.status(200).json(updated);
    } else {
      res.status(403).json("You can only update your comment");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete a comment
// router.delete("/:id", async (req, res) => {
//   try {
//     const comment = await Comment.findById(req.params.id);
//     if (comment.userId === req.body.userId) {
//       await post.deleteOne();
//       res.status(200).json("The comment has been deleted ");
//     } else {
//       res.status(403).json("You can only delete your comment");
//     }
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//delete all comments for a post
router.delete("/:id", async (req, res) => {
  try {
    const currentPost = await Post.findById(req.params.id);
    const postComments = await Comment.findOneAndDelete({
      postId: currentPost._id,
    });
    res.status(200).json(postComments);
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
      res.status(200).json("liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a comment
router.get("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get allcomments
router.get("/", async (req, res) => {
  try {
    const query = q2m(req.query);
    const total = await Comment.countDocuments(query.criteria);
    const allcomments = await Comment.find(query.criteria)
      .sort(query.options.sort)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .populate("user");

    res.status(200).json({ total: total, data: allcomments.reverse() });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.get("/timeline/all", authorize, async (req, res) => {
  try {
    const currentPost = await Post.findById(req.params.id);
    const postComments = await Comment.find({
      postId: currentPost._id,
    }).populate("user");

    console.log(postComments);
    res.json(postComments);
  } catch (err) {
    res.status(500).json(err.message);
    console.log(err.message);
  }
});

module.exports = router;
