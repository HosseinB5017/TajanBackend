const mongoose = require("mongoose");
const schema = mongoose.Schema;

const BannersSchema = new mongoose.Schema(
    {
        title: {type: String, required: false},
        desc: {type: String, required: false},
        otherInfo: {type: Array},
        imgBanner: {type: schema.Types.ObjectId , ref : "DownloadFile" },
        link: {type: String, default: '', trim: true},
        url: {type: String, default: '', trim: true},
        active: {type: Boolean, default: true},
    },
    {timestamps: true},
);


module.exports = mongoose.model("Banners", BannersSchema);