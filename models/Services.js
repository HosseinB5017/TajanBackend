const mongoose = require("mongoose");

const ServicesSchema = new mongoose.Schema(
    {
        title: {type: String, required: false},
        otherInfo: {type: Array},
        img: {type: String, required: false},
        link: {type: String, required: false},
        files : {type : Array , required : false}
    },
    {timestamps: true},
);


module.exports = mongoose.model("Services", ServicesSchema);