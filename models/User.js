const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true , trim: true},
        nationalId: { type: String, required: false, unique: true , sparse: true},
        email: { type: String, required: false, unique: true , sparse: true , trim: true, lowercase: true},
        phoneNumber: { type: String, required: false, trim: true },
        password: { type: String, required: false},
        name: { type: String, required: false},
        lastName: { type: String, required: false},
        invitedCode : {type : String ,default : ''},
        profileImg : { type : String , required : false , default:""},
        role: {
            type: String,
            default: "user",
        },
        finance : {type : Number , default : 0 },
        score : {type : Number , default : 0 },
        active : {type : Boolean , default : true },
        isBlocked: { type: Boolean, default: false },
        blockReason: { type: String, default: "" },
        activeAddress : {type : Schema.Types.ObjectId , ref:  "Address"},
        userAddress : [{type : Schema.Types.ObjectId , ref:  "Address"}],
        shaba : {type :String , default : ''}

    },
    { timestamps: true},
);

module.exports = mongoose.model("User", UserSchema);