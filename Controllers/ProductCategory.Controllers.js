const ProductCategory = require("../models/ProductCategory");
const Shop = require("../models/Shop");
const erorrs = require("../Erorrs.js");

// Get product categories (can filter by shopId / shop query param or shopId in params)
const getProductCategories = async (req, res) => {
    try {
        const shopId = req.params.shopId || req.query.shop || req.query.shopId;
        const { active } = req.query;

        let filter = {};
        if (shopId) {
            filter.$or = [
                { shop: shopId },
                { shop: { $exists: false } },
                { shop: null }
            ];
        }

        if (active !== undefined) {
            filter.active = active === "true" || active === true;
        } else {
            // Default to only active categories for general browsing
            filter.active = true;
        }

        const categories = await ProductCategory.find(filter).sort({ order: 1, createdAt: 1 });
        return res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Get single product category by ID
const getProductCategoryById = async (req, res) => {
    try {
        const category = await ProductCategory.findById(req.params.categoryId || req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: "دسته‌بندی مورد نظر پیدا نشد" });
        }
        return res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Create a new product category
const createProductCategory = async (req, res) => {
    try {
        const shopId = req.params.shopId || req.body.shop || req.body.shopId;
        const { title, icon, order, active } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, error: "عنوان دسته‌بندی الزامی است" });
        }

        // Authorization check if shopId is provided
        if (shopId) {
            const shop = await Shop.findById(shopId);
            if (!shop) {
                return res.status(404).json({ success: false, error: "فروشگاه مورد نظر پیدا نشد" });
            }
            const isOwner = shop.owner.toString() === req.user.id;
            const isAdmin = req.user.role === "admin";
            if (!isOwner && !isAdmin) {
                return res.status(403).json({ success: false, error: erorrs.TokenNotAuthorized });
            }
        }

        const newCategory = new ProductCategory({
            title,
            shop: shopId || undefined,
            icon: icon || "",
            order: order !== undefined ? Number(order) : 0,
            active: active !== undefined ? Boolean(active) : true
        });

        const savedCategory = await newCategory.save();
        return res.status(201).json({
            success: true,
            data: savedCategory
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Update an existing product category
const updateProductCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId || req.params.id;
        const category = await ProductCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, error: "دسته‌بندی مورد نظر پیدا نشد" });
        }

        // Authorization check if category is tied to a shop
        if (category.shop) {
            const shop = await Shop.findById(category.shop);
            if (shop) {
                const isOwner = shop.owner.toString() === req.user.id;
                const isAdmin = req.user.role === "admin";
                if (!isOwner && !isAdmin) {
                    return res.status(403).json({ success: false, error: erorrs.TokenNotAuthorized });
                }
            }
        }

        const allowedFields = ["title", "icon", "order", "active", "shop"];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                category[field] = req.body[field];
            }
        });

        const updatedCategory = await category.save();
        return res.status(200).json({
            success: true,
            data: updatedCategory
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Delete product category
const deleteProductCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId || req.params.id;
        const category = await ProductCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, error: "دسته‌بندی مورد نظر پیدا نشد" });
        }

        // Authorization check
        if (category.shop) {
            const shop = await Shop.findById(category.shop);
            if (shop) {
                const isOwner = shop.owner.toString() === req.user.id;
                const isAdmin = req.user.role === "admin";
                if (!isOwner && !isAdmin) {
                    return res.status(403).json({ success: false, error: erorrs.TokenNotAuthorized });
                }
            }
        }

        await ProductCategory.findByIdAndDelete(categoryId);
        return res.status(200).json({
            success: true,
            message: "دسته‌بندی با موفقیت حذف شد"
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getProductCategories,
    getProductCategoryById,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory
};
