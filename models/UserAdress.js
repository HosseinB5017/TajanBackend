const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserAddressSchema = new mongoose.Schema(
    {
        Address : {
        title : { type: String, required: true},
        city : { type : Schema.Types.ObjectId , ref : "City"},
        boulevard : {type: String, required : false},
        alley : {type: String, required : false},
        plaque : {type: String, required : false},
        unit : {type: String, required : false},
        postalCode :{type: String, required : false},
        info : {type : String , default : ''}
    },
       user : {type : Schema.Types.ObjectId  , ref : 'User'},
       active : {type : Boolean , default : true }

    }
);

module.exports = mongoose.model("Address", UserAddressSchema);