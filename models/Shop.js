const mongoose = require("mongoose");
const schema = mongoose.Schema;

const ProductVariantSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., '20 لیتری', 'بسته 10 تایی'
        price: { type: Number, required: true, default: 0 },
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
        price: { type: Number, required: true, default: 0 },
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
        totalStock: { type: Number, default: 0 },
        available: { type: Boolean, default: true },
        minOrderAmount: { type: Number, default: 0 },
        deliveryFee: { type: Number, default: 0 },
        deliveryCost: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
        operatingHours: {
            open: { type: String, default: "08:00" },
            close: { type: String, default: "22:00" }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Shop", ShopSchema);
