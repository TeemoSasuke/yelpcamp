const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'YELPCAMP', // 可选：指定图片存储的文件夹
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif'], // 允许的图片格式
  },
});

const upload = multer({ storage: storage });

module.exports = upload;