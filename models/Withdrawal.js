const mongoose = require("mongoose");
const schema = mongoose.Schema;

const WithdrawalSchema = new mongoose.Schema(
    {
            user: { type: schema.Types.ObjectId, ref: "User", required: true }, // کاربر یا سفیر
            amount: { type: Number, required: true }, // مبلغ برداشت
            method: {
                    type: String,
                    enum: ["bank", "wallet", "cash"],
                    default: "wallet"
            }, // روش برداشت
            status: {
                    type: String,
                    enum: ["pending", "approved", "rejected"],
                    default: "pending"
            }, // وضعیت برداشت
            description: { type: String, default: "" }, // توضیحات اضافی
            adminDescription: { type: String, default: "" }, // توضیحات اضافی
            requestTime: { type: Date, default: Date.now }, // زمان ثبت درخواست
            processTime: { type: Date } ,// زمان تایید/رد توسط ادمین,
            active: { type: Boolean, default: true },

    },
    { timestamps: true }
);

module.exports = mongoose.model("WithdrawalHistory", WithdrawalSchema);
