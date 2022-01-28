const mongoose = require("mongoose");
const { defaultAvatar } = require("../utils/defaultAvatar");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      min: 3,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      max: 50,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phone: {
      type: String,
      min: 11,
    },
    whatsappBusinessPhone: {
      type: String,
      min: 11,
    },
    userCategory: {
      type: String,
      required: true,
      enum: ["Patient", "Health Care Provider"],
      default: "Patient",
    },
    serviceProvided: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
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

UserSchema.methods.generateJWT = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
  return token;
};

module.exports = mongoose.model("User", UserSchema);
