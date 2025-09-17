const mongoose = require("mongoose");
const schema = mongoose.Schema;

const WasteCategory = new mongoose.Schema(
    {
            title: {
                fa : {type: String,  default: "" },
                en : {type: String,  default: "" }
            },
        desc: {
            fa : {type: String,  default: "" },
            en : {type: String,  default: "" }
        },
        active : {type : Boolean , default : true}
    });

module.exports = mongoose.model("WasteCategory", WasteCategory);
