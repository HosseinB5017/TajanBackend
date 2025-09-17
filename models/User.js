const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true , trim: true},
        nationalId: { type: String, required: false, unique: true , sparse: true},
        email: { type: String, required: false, unique: true , sparse: true , trim: true, lowercase: true},
        password: { type: String, required: false},
        name: { type: String, required: false},
        lastName: { type: String, required: false},
        profileImg : { type : String , required : false , default:""},
        role: {
            type: String,
            default: "user",
        },
        finance : {type : Number , default : 0 },
        score : {type : Number , default : 0 },
        active : {type : Boolean , default : true },
        activeAddress : {type : Schema.Types.ObjectId , ref:  "Address"},
        userAddress : [{type : Schema.Types.ObjectId , ref:  "Address"}]
    }, 
    { timestamps: true},
);

module.exports = mongoose.model("User", UserSchema);