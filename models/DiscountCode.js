const mongoose = require("mongoose");
const schema = mongoose.Schema;

const DiscountCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 40
    },
    normalizedCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true
    },
    scope: {
      type: String,
      enum: ["global", "shop"],
      required: true,
      default: "global"
    },
    shopId: {
      type: schema.Types.ObjectId,
      ref: "Shop",
      default: null,
      index: true
    },
    discountKind: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1
    },
    shopTypes: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "shopTypes must be a non-empty array"
      }
    },
    expiresOn: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    maxDistinctUsers: {
      type: Number,
      required: true,
      min: 1
    },
    maxUsesPerUser: {
      type: Number,
      required: true,
      min: 1
    },
    uniqueUsersCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalUsesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiscountCode", DiscountCodeSchema);
