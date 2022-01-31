const router = require("express").Router();

const userRoute = require("./users");
const authRoute = require("./auth");
const postRoute = require("./posts");
const healthcareServiceRoute = require("./heathcareservices");
const rating = require("./ratings");

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/posts", postRoute);
router.use("/healthcareservices", healthcareServiceRoute);
router.use("/healthserviceratings", rating);

module.exports = router;
