// controllers/comments.js
const Campground = require('../models/campground');
const Comment = require('../models/comment');

// Add a new comment
module.exports.createComment = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    campground.comments.push(comment);
    await comment.save();
    await campground.save();
    req.flash('success', 'Comment successfully created!');
    res.redirect(`/campgrounds/${campground._id}`);
};

// Edit a comment form
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const comment = await Comment.findById(req.params.commentId);
    res.render('comments/edit', { campground, comment });
};

// Update a comment
module.exports.updateComment = async (req, res) => {
    const { id, commentId } = req.params;
    await Comment.findByIdAndUpdate(commentId, req.body.comment);
    req.flash('success', 'Comment successfully updated!');
    res.redirect(`/campgrounds/${id}`);
};

// Delete a comment
module.exports.deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
    await Comment.findByIdAndDelete(commentId);
    const campground = await Campground.findById(id);
    campground.comments.pull(commentId);
    await campground.save();
    req.flash('success', 'Comment successfully deleted!');
    res.redirect(`/campgrounds/${id}`);
};