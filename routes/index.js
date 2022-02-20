const router = require("express").Router();

const userRoute = require("./users");
const authRoute = require("./auth");
const postRoute = require("./posts");
const healthcareServiceRoute = require("./heathcareservices");
const rating = require("./ratings");
const broadcastRoute = require("./broadcast");
const chatRoute = require("./chat");
const messageRoute = require("./message");

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/posts", postRoute);
router.use("/healthcareservices", healthcareServiceRoute);
router.use("/healthserviceratings", rating);
router.use("/broadcast", broadcastRoute);
router.use("/chat", chatRoute);
router.use("/message", messageRoute);

module.exports = router;
