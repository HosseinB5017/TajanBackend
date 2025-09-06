const mongoose = require("mongoose");

const OtpCodes = new mongoose.Schema(
    {
            code : {type: String , default : 0},
            phoneNumber  :  {type :String , required: true  },
             expiresAt: { type: Date, default: () => new Date(Date.now() + 50 * 60 * 1000), required: true }

    },
{ timestamps: true},

);


OtpCodes.statics.isCodeValid = async function(code, phoneNumber) {
    const otpCode = await this.findOne({ code, phoneNumber });
    if (!otpCode) return false;
    return otpCode.expiresAt > Date.now();
};

module.exports = mongoose.model("OtpCodes", OtpCodes);
