const mongoose = require("mongoose");

const FilesSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, default: ""},
        title : {type : String , required : false , default : ""},
        desc : {type : String , required : false , default : ""},
        fileSize : {type : Number , required : false , default : 0},
        mimeType: {type: String, required: false, default: ""},
        path : {type : String , required : true , default : ""},
        reference : {type : String , required : false , default:""},
        active : {type : Boolean , default : true}
    } ,{timestamps : true}
);

module.exports = mongoose.model("DownloadFile", FilesSchema);