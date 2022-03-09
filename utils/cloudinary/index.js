const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pentspace/avatars",
  },
  limits: { fileSize: 200000 },
});

const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pentspace/posts",
  },
  limits: { fileSize: 5000000 },
});

const cloudinaryAvatar = multer({ storage: avatarStorage });
const cloudinaryPost = multer({ storage: postStorage });

const cloudinaryDestroy = async (data) => {
  const regex = "/upload/(?:vd+/)?([^.]+)/";
  const public_id = data.match(regex);
  //const public_id = $matches[1];
  console.log(public_id);
  // await cloudinary.uploader.destroy(public_id, (err, res) => {
  //   console.log(err, res);
  //   if (err) return new Error(err);
  //   else return res;
  // });
};

module.exports = {
  cloudinaryAvatar,
  cloudinaryPost,
  cloudinaryDestroy,
};
