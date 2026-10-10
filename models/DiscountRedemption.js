const mongoose = require("mongoose");
const schema = mongoose.Schema;

const DiscountRedemptionSchema = new mongoose.Schema(
  {
    discountCodeId: {
      type: schema.Types.ObjectId,
      ref: "DiscountCode",
      required: true,
      index: true
    },
    userId: {
      type: schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    orderId: {
      type: schema.Types.ObjectId,
      ref: "ServiceOrder",
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ["reserved", "committed", "released"],
      default: "reserved",
      index: true
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    reservedAt: {
      type: Date,
      default: Date.now
    },
    committedAt: {
      type: Date,
      default: null
    },
    releasedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiscountRedemption", DiscountRedemptionSchema);
