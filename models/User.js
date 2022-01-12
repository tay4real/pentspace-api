const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    phone: {
      type: String,
      min: 11,
    },
    whatsappBusinessPhone:{
      type: String,
      min: 11,
    },
    userCategory: {
      type: String,
      required: true,
      enum: ["Patient", "Health Care Provider"],
      default: "Patient",
    },
    serviceProvided:{
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    desc: {
      type: String,
      max: 50,
    },
    streetAddress: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    followers: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
