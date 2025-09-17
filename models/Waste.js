const mongoose = require("mongoose");
const schema = mongoose.Schema;

const WasteSchema = new mongoose.Schema(
    {
        title: {type: String, required: false ,default : 0 },
        price: {type: Number , default : 0 },
        img: {type: schema.Types.ObjectId , ref : "DownloadFile" },
        info: {type: String, required: false ,default : ''},
        category : {type : schema.Types.ObjectId , ref : 'WasteCategory'},
        active : {type : Boolean , default : true }
    },
    {timestamps: true},
);


module.exports = mongoose.model("Waste", WasteSchema);