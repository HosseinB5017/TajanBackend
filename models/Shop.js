const mongoose = require("mongoose");
const schema = mongoose.Schema;

const ProductVariantSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., '20 لیتری', 'بسته 10 تایی'
        price: { type: Number, required: true, default: 0 },
        basePrice: { type: Number, required: false },
        stock: { type: Number, required: true, default: 0 },
        available: { type: Boolean, default: true },
        description: { type: String, default: "" }
    },
    { _id: true }
);

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        image: { type: String, default: "" },
        images: [{ type: String }],
        price: { type: Number, required: true, default: 0 },
        basePrice: { type: Number, required: false },
        stock: { type: Number, required: true, default: 0 },
        available: { type: Boolean, default: true },
        category: { type: String, default: "" },
        variants: [ProductVariantSchema],
        active: { type: Boolean, default: true }
    },
    { _id: true, timestamps: true }
);

const ShopTeamMemberSchema = new mongoose.Schema(
    {
        user: { type: schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["manager", "operator", "courier"], default: "operator" },
        active: { type: Boolean, default: true }
    },
    { _id: true }
);

const ShopTimeSlotSchema = new mongoose.Schema(
    {
        dayOfWeek: { type: Number, required: false }, // 0: شنبه تا 6: جمعه (یا بر اساس فرمت انتخابی)
        day: { type: String, default: "" }, // شنبه، یکشنبه، ... یا تاریخ مشخص
        startTime: { type: String, required: true }, // '10:00'
        endTime: { type: String, required: true }, // '12:00'
        duration: { type: Number, default: 60 }, // دقیقه: 60 یا 120
        capacity: { type: Number, default: 10 },
        remaining: { type: Number, default: 10 },
        leadTimeHours: { type: Number, default: 0 }, // حداقل ساعت قبل از بازه برای ثبت سفارش
        active: { type: Boolean, default: true }
    },
    { _id: true, timestamps: true }
);

const ShopSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        shopType: {
            type: String,
            enum: ["water", "bread", "restaurant", "supermarket", "other"],
            default: "other",
            required: true
        },
        category: { type: String, default: "" },
        owner: { type: schema.Types.ObjectId, ref: "User", required: true },
        city: { type: schema.Types.ObjectId, ref: "City", required: false },
        cityName: { type: String, default: "" },
        address: { type: String, default: "" },
        phone: { type: String, default: "" },
        description: { type: String, default: "" },
        image: { type: String, default: "" },
        active: { type: Boolean, default: true },
        products: [ProductSchema],
        teamMembers: [ShopTeamMemberSchema],
        timeSlots: [ShopTimeSlotSchema],
        totalStock: { type: Number, default: 0 },
        available: { type: Boolean, default: true },
        minOrderAmount: { type: Number, default: 0 },
        deliveryFee: { type: Number, default: 0 },
        deliveryCost: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
        operatingHours: {
            open: { type: String, default: "08:00" },
            close: { type: String, default: "22:00" }
        },
        paymentSettings: {
            walletEnabled: { type: Boolean, default: true },
            cardEnabled: { type: Boolean, default: false },
            gatewayEnabled: { type: Boolean, default: false },
            cardInfo: {
                cardNumber: { type: String, default: "" },
                cardHolderName: { type: String, default: "" },
                bankName: { type: String, default: "" },
                iban: { type: String, default: "" }
            }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Shop", ShopSchema);
