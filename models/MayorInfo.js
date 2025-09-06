const mongoose = require("mongoose");

const MayorInfoSchema = new mongoose.Schema(
    {
        title: {type: String, required: false},
        name: {type: String, required: false},
        desc: {type: String, required: false},
        otherInfo: {type: Array},
        img: {type: String, required: false},
    },
    {timestamps: true},
);


module.exports = mongoose.model("mayorInfo", MayorInfoSchema);