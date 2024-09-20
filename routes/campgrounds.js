const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('..//utils/isLoggedIn');
const { validateCampground } = require('../utils/validateCampground');
const { isAuthor } = require('../utils/isAuthor');
const campgrounds = require('../controllers/campgrounds');
const upload = require('../middleware/multer');
const cloudinary = require('../config/cloudinary');


// 显示所有campground
router.get('/', catchAsync(campgrounds.index));

// Create a new campground
router.post('/', upload.array('image'), validateCampground, validateCampground, catchAsync(campgrounds.createCampground));

// Show form to create a new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// Show a specific campground
router.get('/:id', catchAsync(campgrounds.showCampground));

// Show form to edit a specific campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// Update a specific campground
router.put('/:id', isLoggedIn, isAuthor, upload.array('images'), validateCampground, catchAsync(campgrounds.updateCampground));

// Delete a specific campground
// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    console.log('Delete route triggered');
    await campgrounds.deleteCampground(req, res);
}));

module.exports = router;