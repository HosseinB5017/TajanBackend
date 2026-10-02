const mongoose = require("mongoose");
const schema = mongoose.Schema;

const ProductCategorySchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        shop: { type: schema.Types.ObjectId, ref: "Shop", required: false, index: true },
        icon: { type: String, default: "" },
        order: { type: Number, default: 0 },
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ProductCategory", ProductCategorySchema);
