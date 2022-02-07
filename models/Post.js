const { Schema, model } = require("mongoose");

const PostSchema = new Schema(
  {
    user: [{ type: Schema.Types.ObjectId, ref: "user" }],

    desc: {
      type: String,
      max: 500,
    },
    postImage: {
      type: Array,
      default: [],
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model("post", PostSchema);
