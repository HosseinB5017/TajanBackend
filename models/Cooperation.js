const mongoose = require("mongoose");
const schema = mongoose.Schema;

const CooperationSchema = new mongoose.Schema(
    {
        user: { 
            type: schema.Types.ObjectId, 
            ref: "User", 
            required: false 
        },
        fullName: { 
            type: String, 
            required: [true, "نام و نام خانوادگی الزامی است"], 
            trim: true 
        },
        phoneNumber: { 
            type: String, 
            required: [true, "شماره تماس الزامی است"], 
            trim: true 
        },
        cooperationType: { 
            type: String, 
            required: [true, "نوع همکاری الزامی است"],
            enum: ["shop", "driver", "technical", "other"],
            default: "other"
        },
        shopNameOrSpecialty: { 
            type: String, 
            required: [true, "نام فروشگاه یا عنوان تخصص الزامی است"], 
            trim: true 
        },
        cityOrRegion: { 
            type: String, 
            default: "", 
            trim: true 
        },
        experience: { 
            type: String, 
            default: "", 
            trim: true 
        },
        description: { 
            type: String, 
            default: "", 
            trim: true 
        },
        status: { 
            type: String, 
            enum: ["pending", "reviewed", "accepted", "rejected"], 
            default: "pending" 
        },
        adminNote: { 
            type: String, 
            default: "", 
            trim: true 
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Cooperation", CooperationSchema);
