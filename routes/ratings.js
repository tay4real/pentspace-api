const router = require("express").Router();
const HealthServiceRating = require("../models/HealthServiceRating");
const User = require("../models/User");

//create a rating
router.post("/", async (req, res) => {
  const newRating = new HealthServiceRating(req.body);
  try {
    const savedRating = await newRating.save();
    console.log(savedRating);
    res.status(200).json(savedRating);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

//update a rating
router.put("/:id", async (req, res) => {
  try {
    const rating = await HealthServiceRating.findById(req.params.id);
    if (rating.userId === req.body.userId) {
      await rating.updateOne({ $set: req.body });
      res.status(200).json("The rating has been updated ");
    } else {
      res.status(403).json("You can only update your rating");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete a rating
router.delete("/:id", async (req, res) => {
  try {
    const rating = await HealthServiceRating.findById(req.params.id);
    if (rating.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("The rating has been deleted");
    } else {
      res.status(403).json("You can only delete your rating");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a rating
router.get("/:id", async (req, res) => {
  try {
    const rating = await HealthServiceRating.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline ratings
router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);

    const userRatings = await HealthServiceRating.find({
      userId: currentUser._id,
    });
    const friendRatings = await Promise.all(
      currentUser.following.map((friendId) => {
        return HealthServiceRating.find({ userId: friendId });
      })
    );
    res.json(userRatings.concat(...friendRatings));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
