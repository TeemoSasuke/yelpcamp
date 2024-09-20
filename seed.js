const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('./models/user'); // 假设你有一个 User 模型
const Campground = require('./models/campground'); // 假设你有一个 Campground 模型
const cloudinary = require('cloudinary').v2; // 确保 cloudinary 已正确配置
require('dotenv').config();

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 连接到数据库
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// 生成单个测试用户
async function seedUser() {
  await User.deleteMany({});
  
  const user = new User({
    username: 'testuser',
    password: 'password' // 你可以对密码进行加密
  });

  await user.save();
  
  return user;
}

// 上传图片到 Cloudinary
async function uploadImage(filePath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

// 生成30个假数据
async function seedDB() {
  await Campground.deleteMany({}); // 清空数据库中的现有数据
  
  const user = await seedUser(); // 创建单个测试用户

  for (let i = 0; i < 30; i++) {
    try {
      // 上传图片到 Cloudinary
      const imageResult = await uploadImage('public/images/723.jpg'); // 上传本地图片
      const image = {
        url: imageResult.secure_url,
        filename: imageResult.public_id
      };

      const newCampground = new Campground({
        title: faker.location.city(), // 使用faker生成随机的城市名字作为title
        images: [image], // 只使用一张图片
        price: faker.number.int({ min: 10, max: 100 }), // 随机价格
        description: faker.lorem.paragraph(), // 随机描述
        location: faker.location.city(), // 随机城市作为location
        latitude: faker.location.latitude(), // 随机纬度
        longitude: faker.location.longitude(), // 随机经度
        author: user._id // 所有campground的作者都是这个用户
      });

      await newCampground.save();
      console.log(`Added campground: ${newCampground.title}`);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  mongoose.connection.close(); // 完成后关闭数据库连接
}

seedDB().catch(err => {
  console.error('Error seeding database:', err);
  mongoose.connection.close();
});