const mongoose = require('mongoose');

const postModel = new mongoose.Schema({
    user: String,
    imgName: String,
    text: String,
    avatar: String,
    timestamp: String
});

module.exports  =  mongoose.model("posts", postModel)
