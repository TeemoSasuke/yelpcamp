const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const catchAsync = require('../utils/catchAsync');
const validateComment = require('../utils/validateComment');
const { isLoggedIn } = require('../utils/isLoggedIn');
const { isCommentAuthor } = require('../utils/isCommentAuthor');
const comments = require('../controllers/comments');


// Add a new comment
router.post('/', isLoggedIn, validateComment, catchAsync(comments.createComment));

// Edit a comment form
router.get('/:commentId/edit', isLoggedIn, isCommentAuthor, catchAsync(comments.renderEditForm));

// Update a comment
router.put('/:commentId', isLoggedIn, isCommentAuthor, validateComment, catchAsync(comments.updateComment));

// Delete a comment
router.delete('/:commentId', isLoggedIn, isCommentAuthor, catchAsync(comments.deleteComment));

module.exports = router;