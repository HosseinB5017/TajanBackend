const mongoose = require("mongoose");

const ProjectsSchema = new mongoose.Schema(
    {
        title: {type: String, required: false},
        desc: {type: String, required: false},
        tag:{type: Array},
        otherInfo: {type: Array},
        imgBanner: {type: String, required: false},
        otherImg: {type: Array}
    },
    {timestamps: true},
);


module.exports = mongoose.model("Projects", ProjectsSchema);