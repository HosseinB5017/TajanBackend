const mongoose = require("mongoose");

const BannersSchema = new mongoose.Schema(
    {
        title: {type: String, required: false},
        desc: {type: String, required: false},
        otherInfo: {type: Array},
        imgBanner: {type: String, required: false},
    },
    {timestamps: true},
);


module.exports = mongoose.model("Banners", BannersSchema);