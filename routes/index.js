const router = require("express").Router();

const userRoute = require("./users");
const authRoute = require("./auth");
const postRoute = require("./posts");
const commentRoute = require("./comments");
const healthcareServiceRoute = require("./heathcareservices");
const suggestedhealthcareServiceRoute = require("./suggetedheathcareservices");
const rating = require("./ratings");
const broadcastRoute = require("./broadcast");
const chatRoute = require("./chat");
const messageRoute = require("./message");
const countriesRoute = require("./countries");

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/posts", postRoute);
router.use("/comments", commentRoute);
router.use("/healthcareservices", healthcareServiceRoute);
router.use("/suggestedhealthcareservices", suggestedhealthcareServiceRoute);
router.use("/healthserviceratings", rating);
router.use("/broadcast", broadcastRoute);
router.use("/chat", chatRoute);
router.use("/message", messageRoute);
router.use("/countries", countriesRoute);

module.exports = router;
