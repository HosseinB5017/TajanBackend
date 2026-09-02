const mongoose = require("mongoose");
const schema = mongoose.Schema;

const InventoryLogSchema = new mongoose.Schema(
    {
        shop: { type: schema.Types.ObjectId, ref: "Shop", required: true },
        product: { type: schema.Types.ObjectId, required: true },
        variant: { type: schema.Types.ObjectId, required: false },
        previousStock: { type: Number, required: true },
        newStock: { type: Number, required: true },
        difference: { type: Number, required: true },
        reason: { type: String, default: "" },
        type: { type: String, enum: ["manual", "order_deduct", "order_cancel_restore", "restock"], default: "manual" },
        user: { type: schema.Types.ObjectId, ref: "User", required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("InventoryLog", InventoryLogSchema);
