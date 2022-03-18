const router = require("express").Router();
const HealthCareService = require("../models/SuggestedHealthCareService");

router.post("/", async (req, res) => {
  const newService = new HealthCareService(req.body);
  try {
    const savedService = await newService.save();
    res.status(200).json(savedService);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const services = await HealthCareService.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
