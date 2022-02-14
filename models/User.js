const mongoose = require("mongoose");
const { defaultAvatar } = require("../utils/defaultAvatar");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    googleId: String,
    facebookId: String,
    surname: String,
    firstname: String,
    name: String,
    username: String,
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
      default: "xxxxxxxxxxx",
    },
    whatsapp: {
      type: String,
      min: 11,
      default: "xxxxxxxxxxx",
    },
    userCategory: {
      type: String,
      default: "",
    },
    profession: {
      type: String,
      default: "",
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
    photos: Array,
    profilePic: String,
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

UserSchema.methods.toJSON = function () {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;

  delete userObject.__v;

  return userObject;
};

UserSchema.statics.findByCredentials = async function (email, plainPW) {
  const user = await this.findOne({ email });

  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

UserSchema.pre("save", async function (next) {
  const user = this;

  if (user.profilePic === undefined) {
    user.profilePic = defaultAvatar(user.username);
  }

  const plainPW = user.password;
  const salt = await bcrypt.genSalt(10);
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPW, salt);
  }
  next();
});

module.exports = mongoose.model("user", UserSchema);
