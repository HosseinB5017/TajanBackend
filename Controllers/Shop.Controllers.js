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
            paymentSettings,
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
            paymentSettings: paymentSettings || {
                walletEnabled: true,
                cardEnabled: false,
                cashOnDeliveryEnabled: false,
                gatewayEnabled: false,
                cardInfo: { cardNumber: "", cardHolderName: "", bankName: "", iban: "" }
            },
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
            "operatingHours",
            "paymentSettings"
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
        const shop = await Shop.findById(req.params.id || req.params.shopId);
        if (!shop) {
            return res.status(404).json({ error: "فروشگاه پیدا نشد" });
        }

        let products = shop.products || [];

        // Filter by active status if requested
        if (req.query.active !== undefined) {
            const isActive = req.query.active === "true" || req.query.active === true;
            products = products.filter(p => (p.active !== undefined ? p.active : true) === isActive);
        }

        // Filter by category or categoryId
        const categoryFilter = (req.query.category || req.query.categoryId || "").toString().trim().toLowerCase();
        if (categoryFilter) {
            products = products.filter(p => {
                const catNameMatch = p.category && p.category.toLowerCase() === categoryFilter;
                const catIdMatch = p.categoryId && p.categoryId.toString().toLowerCase() === categoryFilter;
                return Boolean(catNameMatch || catIdMatch);
            });
        }

        // Support optional backend search/filtering via `search` or `q` query parameters
        const searchQuery = (req.query.search || req.query.q || "").toString().trim().toLowerCase();
        if (searchQuery) {
            products = products.filter(product => {
                const nameMatch = product.name && product.name.toLowerCase().includes(searchQuery);
                const descMatch = product.description && product.description.toLowerCase().includes(searchQuery);
                const catMatch = product.category && product.category.toLowerCase().includes(searchQuery);
                const variantMatch = Array.isArray(product.variants) && product.variants.some(v => 
                    (v.name && v.name.toLowerCase().includes(searchQuery)) ||
                    (v.description && v.description.toLowerCase().includes(searchQuery))
                );
                return Boolean(nameMatch || descMatch || catMatch || variantMatch);
            });
        }

        return res.status(200).json(products);
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

        const { name, description, image, img, images, price, basePrice, stock, category, categoryId, variants, active } = req.body;
        if (!name) {
            return res.status(400).json({ error: "نام محصول الزامی است" });
        }

        const effectivePrice = basePrice !== undefined ? basePrice : (price || 0);
        const effectiveImage = image || img || "";
        const formattedVariants = (variants || []).map(v => ({
            ...v,
            price: v.basePrice !== undefined ? v.basePrice : (v.price || 0),
            basePrice: v.basePrice !== undefined ? v.basePrice : (v.price || 0)
        }));

        const newProduct = {
            name,
            description: description || "",
            image: effectiveImage,
            images: images || (effectiveImage ? [effectiveImage] : []),
            price: effectivePrice,
            basePrice: effectivePrice,
            stock: stock || 0,
            category: category || "",
            categoryId: categoryId || undefined,
            variants: formattedVariants,
            available: true,
            active: active !== undefined ? Boolean(active) : true
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

        const fields = ["name", "description", "image", "price", "basePrice", "stock", "category", "categoryId", "available", "active", "images"];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        if (req.body.img !== undefined && req.body.image === undefined) {
            product.image = req.body.img;
        }

        if (req.body.basePrice !== undefined && req.body.price === undefined) {
            product.price = req.body.basePrice;
        } else if (req.body.price !== undefined && req.body.basePrice === undefined) {
            product.basePrice = req.body.price;
        }

        if (req.body.variants) {
            product.variants = req.body.variants.map(v => ({
                ...v,
                price: v.basePrice !== undefined ? v.basePrice : (v.price || 0),
                basePrice: v.basePrice !== undefined ? v.basePrice : (v.price || 0)
            }));
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

// ======================= SHOP TIME SLOTS CONTROLLERS =======================

// Get all time slots of a shop
const getShopTimeSlots = async (req, res) => {
    try {
        const shopId = req.params.shopId || req.params.id;
        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ error: "فروشگاه پیدا نشد" });

        return res.status(200).json(shop.timeSlots || []);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Create a time slot for shop
const createShopTimeSlot = async (req, res) => {
    try {
        const shopId = req.params.shopId || req.params.id;
        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ error: "فروشگاه پیدا نشد" });

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        const isTeam = shop.teamMembers && shop.teamMembers.some((m) => m.user.toString() === req.user.id && m.active);
        if (!isOwner && !isAdmin && !isTeam) return res.status(403).json({ error: erorrs.TokenNotAuthorized });

        // بررسی اینکه آیا body یک آرایه از بازه‌هاست یا یک شیء منفرد
        const incomingSlots = Array.isArray(req.body) ? req.body : (Array.isArray(req.body.slots) ? req.body.slots : [req.body]);

        if (!shop.timeSlots) {
            shop.timeSlots = [];
        }

        const addedSlots = [];

        for (const item of incomingSlots) {
            const {
                dayOfWeek,
                day,
                startTime,
                endTime,
                time,
                duration,
                capacity,
                leadTimeHours,
                active
            } = item;

            let finalStartTime = startTime;
            let finalEndTime = endTime;

            // اگر فرانت فیلد time را به شکل "10:00 - 12:00" یا "10:00-12:00" فرستاده باشد
            if ((!finalStartTime || !finalEndTime) && time && typeof time === "string") {
                const parts = time.split(/[-–—]/).map(s => s.trim());
                if (parts.length >= 2) {
                    finalStartTime = parts[0];
                    finalEndTime = parts[1];
                }
            }

            if (!finalStartTime || !finalEndTime) {
                return res.status(400).json({
                    error: "ساعت شروع و پایان بازه الزامی است (startTime و endTime یا time مانند '10:00 - 12:00')",
                    receivedBody: req.body
                });
            }

            const slotCapacity = capacity !== undefined ? parseInt(capacity) : 10;
            const newSlot = {
                dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined,
                day: day || "",
                startTime: finalStartTime,
                endTime: finalEndTime,
                duration: duration !== undefined ? parseInt(duration) : 60,
                capacity: slotCapacity,
                remaining: slotCapacity,
                leadTimeHours: leadTimeHours !== undefined ? parseFloat(leadTimeHours) : 0,
                active: active !== undefined ? Boolean(active) : true
            };

            shop.timeSlots.push(newSlot);
            addedSlots.push(shop.timeSlots[shop.timeSlots.length - 1]);
        }

        await shop.save();

        return res.status(201).json(Array.isArray(req.body) || Array.isArray(req.body?.slots) ? addedSlots : addedSlots[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Update a time slot
const updateShopTimeSlot = async (req, res) => {
    try {
        const { shopId, slotId } = req.params;
        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ error: "فروشگاه پیدا نشد" });

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        const isTeam = shop.teamMembers && shop.teamMembers.some((m) => m.user.toString() === req.user.id && m.active);
        if (!isOwner && !isAdmin && !isTeam) return res.status(403).json({ error: erorrs.TokenNotAuthorized });

        const slot = shop.timeSlots.id(slotId);
        if (!slot) return res.status(404).json({ error: "بازه زمانی پیدا نشد" });

        const { dayOfWeek, day, startTime, endTime, duration, capacity, remaining, leadTimeHours, active } = req.body;

        if (dayOfWeek !== undefined) slot.dayOfWeek = parseInt(dayOfWeek);
        if (day !== undefined) slot.day = day;
        if (startTime !== undefined) slot.startTime = startTime;
        if (endTime !== undefined) slot.endTime = endTime;
        if (duration !== undefined) slot.duration = parseInt(duration);
        if (capacity !== undefined) slot.capacity = parseInt(capacity);
        if (remaining !== undefined) slot.remaining = parseInt(remaining);
        if (leadTimeHours !== undefined) slot.leadTimeHours = parseFloat(leadTimeHours);
        if (active !== undefined) slot.active = Boolean(active);

        await shop.save();
        return res.status(200).json(slot);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Delete a time slot
const deleteShopTimeSlot = async (req, res) => {
    try {
        const { shopId, slotId } = req.params;
        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ error: "فروشگاه پیدا نشد" });

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        const isTeam = shop.teamMembers && shop.teamMembers.some((m) => m.user.toString() === req.user.id && m.active);
        if (!isOwner && !isAdmin && !isTeam) return res.status(403).json({ error: erorrs.TokenNotAuthorized });

        shop.timeSlots.pull(slotId);
        await shop.save();
        return res.status(200).json({ message: "بازه زمانی با موفقیت حذف شد" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get valid delivery slots for user checkout with Lead Time calculation
const getShopValidDeliverySlots = async (req, res) => {
    try {
        const shopId = req.params.shopId || req.params.id;
        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ error: "فروشگاه پیدا نشد" });

        const now = new Date();
        const slots = shop.timeSlots || [];

        const validSlots = slots.map(slot => {
            const slotObj = slot.toObject ? slot.toObject() : slot;
            const [hStr = "00", mStr = "00"] = (slot.startTime || "00:00").split(":");
            const startHour = parseInt(hStr, 10);
            const startMin = parseInt(mStr, 10);

            // محاسبه مهلت زمانی (Cutoff Time):
            // اگر leadTimeHours مثبت باشد (مثلاً 2): ثبت تا 2 ساعت قبل از شروع بازه مجاز است.
            // اگر leadTimeHours منفی باشد (مثلاً -0.5 یا -1 یا -2): ثبت تا 30 دقیقه، 1 ساعت یا 2 ساعت بعد از شروع بازه مجاز است.
            // فرمول یکپارچه: Cutoff Time = Slot Start Time - (leadTimeHours * 60 min)
            // به عنوان مثال: leadTimeHours = -0.5 => Cutoff = 18:00 - (-30) = 18:30
            const cutoffMinutes = (slot.leadTimeHours !== undefined ? slot.leadTimeHours : 0) * 60;
            const slotStartTotalMin = startHour * 60 + startMin;
            const currentTotalMin = now.getHours() * 60 + now.getMinutes();
            const cutoffTotalMin = slotStartTotalMin - cutoffMinutes;

            const isPassedCutoff = currentTotalMin > cutoffTotalMin;
            const isCapacityFull = (slot.remaining !== undefined ? slot.remaining : slot.capacity) <= 0;
            const isAvailable = slot.active && !isPassedCutoff && !isCapacityFull;

            let statusLabel = "available"; // 'available' | 'expired' | 'full' | 'inactive'
            if (!slot.active) statusLabel = "inactive";
            else if (isCapacityFull) statusLabel = "full";
            else if (isPassedCutoff) statusLabel = "expired";

            return {
                ...slotObj,
                isAvailable,
                statusLabel,
                cutoffTimeMinutes: cutoffTotalMin
            };
        });

        return res.status(200).json(validSlots);
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
    removeTeamMember,
    getShopTimeSlots,
    createShopTimeSlot,
    updateShopTimeSlot,
    deleteShopTimeSlot,
    getShopValidDeliverySlots
};
