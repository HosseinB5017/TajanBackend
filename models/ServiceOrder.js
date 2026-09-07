const mongoose = require("mongoose");
const schema = mongoose.Schema;
const autoIncrement = require("mongoose-sequence")(mongoose);

const OrderedProductItemSchema = new mongoose.Schema(
    {
        product: { type: schema.Types.ObjectId, required: true },
        productName: { type: String, default: "" },
        variant: { type: schema.Types.ObjectId, required: false },
        variantName: { type: String, default: "" },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        unitPrice: { type: Number, required: true, default: 0 },
        totalPrice: { type: Number, required: true, default: 0 }
    },
    { _id: true }
);

const ServiceOrderSchema = new mongoose.Schema(
    {
        orderId: { type: Number, default: 0 },
        serviceType: {
            type: String,
            enum: ["water", "bread", "restaurant", "supermarket", "shop", "other"],
            default: "shop",
            required: true
        },
        user: { type: schema.Types.ObjectId, ref: "User", required: true },
        shop: { type: schema.Types.ObjectId, ref: "Shop", required: true },
        shopName: { type: String, default: "" },
        shopType: { type: String, default: "" },
        orderedProducts: [OrderedProductItemSchema],
        address: { type: schema.Types.ObjectId, ref: "Address", required: false },
        addressDetails: {
            city: { type: String, default: "" },
            boulevard: { type: String, default: "" },
            alley: { type: String, default: "" },
            plaque: { type: String, default: "" },
            unit: { type: String, default: "" },
            postalCode: { type: String, default: "" },
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 },
            fullAddress: { type: String, default: "" }
        },
        selectedSlot: {
            timeSlot: { type: schema.Types.ObjectId, ref: "TimeSlot", required: false },
            slot: { type: schema.Types.ObjectId, ref: "SlotSchema", required: false },
            slotString: { type: String, default: "" },
            startTime: { type: String, default: "" },
            endTime: { type: String, default: "" },
            day: { type: String, default: "" }
        },
        deliveryTime: { type: String, default: "" },
        slot: { type: String, default: "" },
        status: {
            type: String,
            enum: ["pending", "accepted", "ready", "shipped", "delivered", "cancelled", "rejected"],
            default: "pending"
        },
        totalPrice: { type: Number, required: true, default: 0 },
        deliveryFee: { type: Number, default: 0 },
        deliveryCost: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        finalPrice: { type: Number, default: 0 },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "cash_on_delivery", "wallet"],
            default: "pending"
        },
        paymentMethod: { type: String, default: "cash_on_delivery" },
        cancellationReason: { type: String, default: "" },
        rejectionReason: { type: String, default: "" },
        notes: { type: String, default: "" },
        deliveredAt: { type: Date, required: false },
        timeline: [
            {
                status: { type: String, required: true },
                date: { type: Date, default: Date.now },
                comment: { type: String, default: "" },
                actor: { type: schema.Types.ObjectId, ref: "User" }
            }
        ]
    },
    { timestamps: true }
);

ServiceOrderSchema.plugin(autoIncrement, { inc_field: "orderId", id: "service_order_seq" });

module.exports = mongoose.model("ServiceOrder", ServiceOrderSchema);
