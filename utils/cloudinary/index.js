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

const cloudinaryAvatar = multer({ storage: avatarStorage });

const cloudinaryDestroy = async (data) => {
  console.log("old pic", data);
  const { dir, name } = data;
  const public_id = `${dir.substr(62, dir.length)}/${name}`;
  await cloudinary.uploader.destroy(public_id, (err, res) => {
    console.log(err, res);
    if (err) return new Error(err);
    else return res;
  });
};

module.exports = {
  cloudinaryAvatar,
  cloudinaryDestroy,
};
