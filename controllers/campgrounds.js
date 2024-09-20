// controllers/campground.js
const Campground = require('../models/campground');
const cloudinary = require('../config/cloudinary');
const getGeocode = require('../utils/getGeocode');
// 显示所有campground
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({}).populate('author');
    res.render('campgrounds/index', {
        campgrounds,
        apiKey: process.env.MAPTILER_API_KEY // 传递 API 密钥
    });
};

// Create a new campground
module.exports.createCampground = async (req, res) => {
    // Create new Campground instance
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;

    // Handle images
    req.files.forEach(file => {
        newCampground.images.push({ url: file.path, filename: file.filename });
    });
    console.log("Images added:", newCampground.images);

    // Fetch geocode information
    if (req.body.campground.location) {
        const geoData = await getGeocode(req.body.campground.location);
        console.log("Geocode data received:", geoData);

        if (geoData) {
            newCampground.longitude = geoData.longitude;  // Store longitude
            newCampground.latitude = geoData.latitude;   // Store latitude
            console.log("Longitude and Latitude added:", newCampground.longitude, newCampground.latitude);
        } else {
            throw new Error('Unable to get geocode information.');
        }
    }
    // Save new Campground
    await newCampground.save();
    console.log("Campground saved:", newCampground);

    // Redirect and flash message
    res.redirect(`/campgrounds/${newCampground._id}`);
    req.flash('success', 'Campground successfully created!');
};

// Show a specific campground
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('author').populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    });
    if (!campground) {
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

// Show form to create a new campground
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

// Show form to edit a specific campground
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('author');
    res.render('campgrounds/edit', { campground });
};

// Update a specific campground
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const { deletedImages } = req.body;
    const newCampground = new Campground(req.body.campground);

    // 找到当前的营地
    const campground = await Campground.findById(id);
    console.log('Received request to edit campground with ID:', id);

    // 执行更新逻辑
    campground.title = newCampground.title;
    campground.location = newCampground.location;
    campground.price = newCampground.price;
    campground.description = newCampground.description;

    // 删除图片逻辑
    if (deletedImages && deletedImages.length > 0) {
        const deletedImageIds = deletedImages.split(',');

        // 从数据库中删除图片
        await Campground.findByIdAndUpdate(id, {
            $pull: { images: { filename: { $in: deletedImageIds } } }
        });

        // 从 Cloudinary 上删除图片
        for (let filename of deletedImageIds) {
            const result = await cloudinary.uploader.destroy(filename);
        }
    }

    // 其他更新操作（如更新 campgrounds 的其他字段）
    // 上传新图片逻辑
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));

        // 将新图片添加到数据库
        campground.images.push(...newImages);
    }

    // 保存更新
    await campground.save();
    console.log('Form submission successful. Redirecting to the campground page.');

    res.redirect(`/campgrounds/${id}`);
};

// Delete a specific campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    console.log("Deleting campground with ID:", id);

    // 找到要删除的 campground
    const campground = await Campground.findById(id);
    if (!campground) {
        throw new Error('Campground not found');
    }
    console.log("Campground found:", campground);

    // 删除图片
    for (let image of campground.images) {
        console.log("Deleting image:", image.filename);
        await cloudinary.uploader.destroy(image.filename);
    }
    console.log("All images deleted.");

    // 删除 campground
    await Campground.findByIdAndDelete(id);
    console.log("Campground successfully deleted.");

    // Flash message and redirect
    req.flash('success', 'Campground successfully deleted!');
    res.redirect('/campgrounds');
};