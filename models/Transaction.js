const mongoose = require("mongoose");
const schema = mongoose.Schema;

const TransactionSchema = new mongoose.Schema(
    {
        user: { type: schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["deposit", "withdrawal", "order_payment", "order_refund", "recycling_income", "manual"],
            required: true
        },
        direction: {
            type: String,
            enum: ["in", "out"],
            required: true
        },
        amount: { type: Number, required: true, min: 0 },
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        referenceId: { type: String, default: "" },
        orderId: { type: String, default: "" },
        serviceOrder: { type: schema.Types.ObjectId, ref: "ServiceOrder", required: false },
        shop: { type: schema.Types.ObjectId, ref: "Shop", required: false },
        shopName: { type: String, default: "" },
        status: {
            type: String,
            enum: ["successful", "pending", "failed"],
            default: "successful"
        },
        balanceAfter: { type: Number, default: 0 }
    },
    { timestamps: true }
);

TransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", TransactionSchema);
