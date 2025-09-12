const mongoose = require("mongoose");

const State = new mongoose.Schema(
    {
        name: {
            fa : {type: String,  default: "" },
            en : {type: String,  default: "" }
        },
        location: {
            lat:{type : Number , required: false},
            lng : {type : Number  , required : false}
        }
    });

module.exports = mongoose.model("State", State);