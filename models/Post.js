const { Schema, model } = require("mongoose");

const PostSchema = new Schema(
  {
    user: [{ type: Schema.Types.ObjectId, ref: "user" }],

    desc: {
      type: String,
      max: 500,
    },
    img: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model("post", PostSchema);
