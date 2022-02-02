const router = require("express").Router();
const Broadcast = require("../models/Broadcast");

router.post("/", async (req, res) => {
  const newBroadcast = new Broadcast(req.body);
  try {
    const savedBroadcast = await newBroadcast.save();
    res.status(200).json(savedBroadcast);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const Broadcasts = await Broadcast.find();
    res.status(200).json(Broadcasts);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
