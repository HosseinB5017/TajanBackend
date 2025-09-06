const mongoose = require("mongoose");

const CityMediaSchema = new mongoose.Schema(
    {
        title: {type: String, required: false},
        desc: {type: String, required: false},
        otherInfo: {type: Array},
        video: {type: String, required: false},
        releaseDate : {type : String , required: false}
    },
    {timestamps: true},
);


module.exports = mongoose.model("CityMedia", CityMediaSchema);