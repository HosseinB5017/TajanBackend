const mongoose = require("mongoose");
const schema = mongoose.Schema;

const ShopNotificationSchema = new mongoose.Schema(
    {
        recipient: { type: schema.Types.ObjectId, ref: "User", required: true },
        shop: { type: schema.Types.ObjectId, ref: "Shop", required: false },
        order: { type: schema.Types.ObjectId, ref: "ServiceOrder", required: false },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ["order_created", "order_status_change", "inventory_alert", "system"], default: "system" },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date, required: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ShopNotification", ShopNotificationSchema);
