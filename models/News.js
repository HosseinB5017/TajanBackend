const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true},
        desc: {type: String, required: false},
        tag: {type : Array},
        otherInfo: {type: Array},
        imgBanner: {type: String, required: false},
        otherImg: {type: Array},
        releaseDate : {type: String}
    },
    {timestamps: true},
);

module.exports = mongoose.model("News", NewsSchema);