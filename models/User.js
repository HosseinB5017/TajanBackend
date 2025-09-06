const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true},
        nationalId: { type: String, required: false, unique: true , sparse: true},
        email: { type: String, required: false, unique: true , sparse: true},
        password: { type: String, required: false},
        name: { type: String, required: false},
        lastName: { type: String, required: false},
        profileImg : { type : String , required : false , default:""},
        role: {
            type: String,
            default: "user",
        },
    }, 
    { timestamps: true},
);

module.exports = mongoose.model("User", UserSchema);