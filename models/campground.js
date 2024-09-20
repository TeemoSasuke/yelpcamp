const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');  // 缩略图URL
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema], // 用于存储图片的 URL
    price: Number,
    description: String,
    location: String,
    latitude: Number, 
    longitude: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});

module.exports = mongoose.model('Campground', CampgroundSchema);