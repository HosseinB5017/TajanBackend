const mongoose = require("mongoose");

const SarakhsInfoSchema = new mongoose.Schema(
    {
        title: {type: String, required: false , default:''},
        otherInfo: {type: Array},
        desc: {type: String, required: false , default : '' },
    },
    {timestamps: true},
);


module.exports = mongoose.model("SarakhsInfo",SarakhsInfoSchema);