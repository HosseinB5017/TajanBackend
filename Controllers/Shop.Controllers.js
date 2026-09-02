const Shop = require("../models/Shop");
const User = require("../models/User");
const InventoryLog = require("../models/InventoryLog");
const erorrs = require("../Erorrs.js");

// Get all shops with filters (search, type, category, city, active)
const getShops = async (req, res) => {
    try {
        const { shopType, category, city, search, active, page = 1, limit, perpage } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(perpage) || parseInt(limit) || 20;
        let filter = {};

        if (shopType) {
            filter.shopType = shopType;
        }

        if (category) {
            filter.category = category;
        }

        if (city) {
            filter.city = city;
        }

        if (active !== undefined) {
            filter.active = active === "true" || active === true;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { cityName: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (pageNum - 1) * limitNum;
        const total = await Shop.countDocuments(filter);
        const shops = await Shop.find(filter)
            .populate("owner", "username name lastName")
            .populate("city", "name title")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        return res.status(200).json({
            shops,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get shop by ID
const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id)
            .populate("owner", "username name lastName profileImg")
            .populate("city", "name title")
            .populate("teamMembers.user", "username name lastName profileImg");

        if (!shop) {
            return res.status(404).json({ error: "فروشگاه مورد نظر پیدا نشد" });
        }

        return res.status(200).json(shop);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get current user's owned shops
const getMyShops = async (req, res) => {
    try {
        const shops = await Shop.find({
            $or: [
                { owner: req.user.id },
                { "teamMembers.user": req.user.id }
            ]
        })
            .populate("city", "name title")
            .populate("owner", "username name lastName")
            .sort({ createdAt: -1 });

        return res.status(200).json(shops);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Create a new shop (Admin or authorized user)
const createShop = async (req, res) => {
    try {
        const {
            name,
            shopType,
            category,
            city,
            cityName,
            address,
            phone,
            description,
            image,
            minOrderAmount,
            deliveryFee,
            deliveryCost,
            status,
            operatingHours,
            products
        } = req.body;

        if (!name || !shopType) {
            return res.status(400).json({ error: "نام فروشگاه و نوع سرویس الزامی است" });
        }

        const effectiveDeliveryFee = deliveryCost !== undefined ? deliveryCost : (deliveryFee || 0);

        const newShop = new Shop({
            name,
            shopType,
            category: category || "",
            owner: req.body.owner || req.user.id,
            city: city || undefined,
            cityName: cityName || "",
            address: address || "",
            phone: phone || "",
            description: description || "",
            image: image || "",
            minOrderAmount: minOrderAmount || 0,
            deliveryFee: effectiveDeliveryFee,
            deliveryCost: effectiveDeliveryFee,
            status: status || "active",
            operatingHours: operatingHours || { open: "08:00", close: "22:00" },
            products: products || [],
            active: true
        });

        // Recalculate totalStock
        let totalStock = 0;
        if (newShop.products && newShop.products.length > 0) {
            for (const p of newShop.products) {
                if (p.variants && p.variants.length > 0) {
                    for (const v of p.variants) {
                        totalStock += v.stock || 0;
                    }
                } else {
                    totalStock += p.stock || 0;
                }
            }
        }
        newShop.totalStock = totalStock;

        const savedShop = await newShop.save();
        return res.status(201).json(savedShop);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Update shop details
const updateShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ error: "فروشگاه مورد نظر پیدا نشد" });
        }

        // Authorization check: Admin or Shop Owner
        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: erorrs.TokenNotAuthorized });
        }

        const allowedFields = [
            "name",
            "shopType",
            "category",
            "city",
            "cityName",
            "address",
            "phone",
            "email",
            "description",
            "image",
            "active",
            "available",
            "status",
            "minOrderAmount",
            "deliveryFee",
            "deliveryCost",
            "operatingHours"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                shop[field] = req.body[field];
            }
        });

        if (req.body.deliveryCost !== undefined && req.body.deliveryFee === undefined) {
            shop.deliveryFee = req.body.deliveryCost;
        } else if (req.body.deliveryFee !== undefined && req.body.deliveryCost === undefined) {
            shop.deliveryCost = req.body.deliveryFee;
        }

        const updatedShop = await shop.save();
        return res.status(200).json(updatedShop);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Delete shop (Admin only)
const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findByIdAndDelete(req.params.id);
        if (!shop) {
            return res.status(404).json({ error: "فروشگاه مورد نظر پیدا نشد" });
        }
        return res.status(200).json({ message: "فروشگاه با موفقیت حذف شد" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get products of a shop
const getShopProducts = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ error: "فروشگاه پیدا نشد" });
        }

        return res.status(200).json(shop.products || []);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Add a product to a shop
const addProductToShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ error: "فروشگاه پیدا نشد" });
        }

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: erorrs.TokenNotAuthorized });
        }

        const { name, description, image, price, stock, category, variants } = req.body;
        if (!name) {
            return res.status(400).json({ error: "نام محصول الزامی است" });
        }

        const newProduct = {
            name,
            description: description || "",
            image: image || "",
            price: price || 0,
            stock: stock || 0,
            category: category || "",
            variants: variants || [],
            available: true,
            active: true
        };

        shop.products.push(newProduct);

        // Update total stock
        let totalStock = 0;
        for (const p of shop.products) {
            if (p.variants && p.variants.length > 0) {
                for (const v of p.variants) {
                    totalStock += v.stock || 0;
                }
            } else {
                totalStock += p.stock || 0;
            }
        }
        shop.totalStock = totalStock;

        await shop.save();
        const createdProduct = shop.products[shop.products.length - 1];

        return res.status(201).json(createdProduct);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const { shopId, productId } = req.params;
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ error: "فروشگاه پیدا نشد" });
        }

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: erorrs.TokenNotAuthorized });
        }

        const product = shop.products.id(productId);
        if (!product) {
            return res.status(404).json({ error: "محصول پیدا نشد" });
        }

        const fields = ["name", "description", "image", "price", "stock", "category", "available", "active"];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });
       console.log("Updated variant:", req.body.variant.stock);
        if (req.body.variants) {
            product.variants = req.body.variants;
        }

        // Recalculate totalStock
        let totalStock = 0;
        for (const p of shop.products) {
            if (p.variants && p.variants.length > 0) {
                for (const v of p.variants) {
                    totalStock += v.stock || 0;
                }
            } else {
                totalStock += p.stock || 0;
            }
        }
        shop.totalStock = totalStock;
        console.log("Updated totalStock:", shop.totalStock);
        await shop.save();
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { shopId, productId } = req.params;
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ error: "فروشگاه پیدا نشد" });
        }

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: erorrs.TokenNotAuthorized });
        }

        shop.products.pull(productId);

        let totalStock = 0;
        for (const p of shop.products) {
            if (p.variants && p.variants.length > 0) {
                for (const v of p.variants) {
                    totalStock += v.stock || 0;
                }
            } else {
                totalStock += p.stock || 0;
            }
        }
        shop.totalStock = totalStock;

        await shop.save();
        return res.status(200).json({ message: "محصول با موفقیت حذف شد" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Update stock and log inventory
const updateStock = async (req, res) => {
    try {
        const shopId = req.params.shopId || req.body.shopId;
        const productId = req.params.productId || req.body.productId;
        const variantId = req.params.variantId || req.body.variantId;
        const { newStock, quantity, type, reason } = req.body;

        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ error: "فروشگاه پیدا نشد" });
        }

        const isOwner = shop.owner.toString() === req.user.id;
        const isTeam = shop.teamMembers && shop.teamMembers.some((m) => m.user.toString() === req.user.id && m.active);
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isTeam && !isAdmin) {
            return res.status(403).json({ error: erorrs.TokenNotAuthorized });
        }

        const product = shop.products.id(productId);
        if (!product) {
            return res.status(404).json({ error: "محصول پیدا نشد" });
        }

        let previousStock = 0;
        let finalStock = 0;

        if (variantId) {
            const variant = product.variants.id(variantId);
            if (!variant) {
                return res.status(404).json({ error: "تنوع محصول پیدا نشد" });
            }
            previousStock = variant.stock || 0;
            if (newStock !== undefined) {
                finalStock = parseInt(newStock);
            } else if (quantity !== undefined) {
                finalStock = previousStock + parseInt(quantity);
            } else {
                return res.status(400).json({ error: "مقدار stock یا quantity مشخص نشده است" });
            }
            if (finalStock < 0) finalStock = 0;
            variant.stock = finalStock;
            variant.available = variant.stock > 0;
        } else {
            previousStock = product.stock || 0;
            if (newStock !== undefined) {
                finalStock = parseInt(newStock);
            } else if (quantity !== undefined) {
                finalStock = previousStock + parseInt(quantity);
            } else {
                return res.status(400).json({ error: "مقدار stock یا quantity مشخص نشده است" });
            }
            if (finalStock < 0) finalStock = 0;
            product.stock = finalStock;
            product.available = product.stock > 0;
        }

        // Recalculate totalStock
        let totalStock = 0;
        for (const p of shop.products) {
            if (p.variants && p.variants.length > 0) {
                for (const v of p.variants) {
                    totalStock += v.stock || 0;
                }
            } else {
                totalStock += p.stock || 0;
            }
        }
        shop.totalStock = totalStock;
        await shop.save();

        // Create inventory log
        const log = new InventoryLog({
            shop: shop._id,
            product: product._id,
            variant: variantId || undefined,
            previousStock,
            newStock: finalStock,
            difference: finalStock - previousStock,
            reason: reason || "به‌روزرسانی موجودی",
            type: type && ["manual", "order_deduct", "order_cancel_restore", "restock"].includes(type) ? type : "manual",
            user: req.user.id
        });
        await log.save();

        return res.status(200).json({ message: "موجودی با موفقیت به‌روزرسانی شد", product, log, stock: finalStock });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get Inventory Logs
const getInventoryLogs = async (req, res) => {
    try {
        const { shopId } = req.params;
        const logs = await InventoryLog.find({ shop: shopId })
            .populate("user", "username name lastName")
            .sort({ createdAt: -1 })
            .limit(100);

        return res.status(200).json(logs);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Add team member to shop
const addTeamMember = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { userId, role } = req.body;

        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ error: "فروشگاه پیدا نشد" });

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) return res.status(403).json({ error: erorrs.TokenNotAuthorized });

        const userToAdd = await User.findById(userId);
        if (!userToAdd) return res.status(404).json({ error: "کاربر پیدا نشد" });

        const alreadyExists = shop.teamMembers.some((m) => m.user.toString() === userId);
        if (alreadyExists) return res.status(400).json({ error: "این کاربر قبلاً به تیم اضافه شده است" });

        shop.teamMembers.push({
            user: userId,
            role: role || "operator",
            active: true
        });

        await shop.save();
        return res.status(200).json(shop.teamMembers);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Remove team member
const removeTeamMember = async (req, res) => {
    try {
        const { shopId, memberId } = req.params;
        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ error: "فروشگاه پیدا نشد" });

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) return res.status(403).json({ error: erorrs.TokenNotAuthorized });

        shop.teamMembers.pull(memberId);
        await shop.save();
        return res.status(200).json({ message: "عضو با موفقیت از تیم حذف شد" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getShops,
    getShopById,
    getMyShops,
    createShop,
    updateShop,
    deleteShop,
    getShopProducts,
    addProductToShop,
    updateProduct,
    deleteProduct,
    updateStock,
    getInventoryLogs,
    addTeamMember,
    removeTeamMember
};
