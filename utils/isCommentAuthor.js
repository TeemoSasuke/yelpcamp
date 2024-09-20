// utils/isCommentAuthor.js
const Comment = require('../models/comment');

module.exports.isCommentAuthor = async (req, res, next) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        req.flash('error', 'Comment not found!');
        return res.redirect(`/campgrounds/${req.params.id}`);
    }
    if (!comment.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${req.params.id}`);
    }
    next();
};