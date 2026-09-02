const ServiceOrder = require("../models/ServiceOrder");
const Shop = require("../models/Shop");
const User = require("../models/User");
const Address = require("../models/UserAdress");
const InventoryLog = require("../models/InventoryLog");
const ShopNotification = require("../models/ShopNotification");
const erorrs = require("../Erorrs.js");

// Helper function to create Service / Shop Order
const createServiceOrder = async (req, res, forcedServiceType) => {
    try {
        const {
            shop: rawShopId,
            shopId: bodyShopId,
            shopName: bodyShopName,
            shopType: bodyShopType,
            orderedProducts: rawOrderedProducts,
            items: bodyItems,
            address: rawAddress,
            addressDetails,
            selectedSlot,
            paymentMethod,
            itemsPrice,
            deliveryCost: bodyDeliveryCost,
            deliveryFee: bodyDeliveryFee,
            totalPrice: clientTotalPrice,
            notes,
            serviceType: bodyServiceType
        } = req.body;

        const targetShopId = rawShopId || bodyShopId;
        if (!targetShopId) {
            return res.status(400).json({ error: "شناسه فروشگاه (shopId) الزامی است" });
        }

        const rawItems = rawOrderedProducts || bodyItems;
        if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
            return res.status(400).json({ error: "لیست محصولات سفارش (items) نمی‌تواند خالی باشد" });
        }

        // Normalize items structure: accept { product, variant, quantity } or { productId, variantId, quantity, price }
        const orderedProducts = rawItems.map((item) => ({
            product: item.product || item.productId,
            variant: item.variant || item.variantId,
            quantity: item.quantity || 1,
            unitPrice: item.price || item.unitPrice,
            productName: item.productName || "",
            variantName: item.variantName || ""
        }));

        const shop = await Shop.findById(targetShopId);
        if (!shop) {
            return res.status(404).json({ error: "فروشگاه مورد نظر یافت نشد" });
        }

        if (!shop.active) {
            return res.status(400).json({ error: "این فروشگاه در حال حاضر غیرفعال است" });
        }

        // Determine service type
        const determinedServiceType = forcedServiceType || bodyServiceType || shop.shopType || "shop";

        // Validate and calculate products & stock
        let calculatedTotalPrice = 0;
        const verifiedItems = [];

        for (const item of orderedProducts) {
            const product = shop.products.id(item.product);
            if (!product || !product.active) {
                return res.status(400).json({ error: `محصول مورد نظر موجود نیست` });
            }

            let unitPrice = item.unitPrice !== undefined ? item.unitPrice : product.price;
            let variantName = "";

            if (item.variant) {
                const variant = product.variants.id(item.variant);
                if (!variant || !variant.available) {
                    return res.status(400).json({ error: `تنوع انتخابی برای محصول ${product.name} موجود نیست` });
                }
                if (variant.stock < item.quantity) {
                    return res.status(400).json({
                        error: `موجودی تنوع ${variant.name} از محصول ${product.name} کافی نیست. موجودی فعلی: ${variant.stock}`
                    });
                }
                unitPrice = item.unitPrice !== undefined ? item.unitPrice : variant.price;
                variantName = variant.name;

                // Deduct variant stock
                variant.stock -= item.quantity;
                if (variant.stock <= 0) variant.available = false;
            } else {
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        error: `موجودی محصول ${product.name} کافی نیست. موجودی فعلی: ${product.stock}`
                    });
                }
                // Deduct product stock
                product.stock -= item.quantity;
                if (product.stock <= 0) product.available = false;
            }

            const itemTotalPrice = unitPrice * item.quantity;
            calculatedTotalPrice += itemTotalPrice;

            verifiedItems.push({
                product: product._id,
                productName: item.productName || product.name,
                variant: item.variant || undefined,
                variantName: item.variantName || variantName,
                quantity: item.quantity,
                unitPrice: unitPrice,
                totalPrice: itemTotalPrice
            });
        }

        // Process Address Details
        let finalAddressDetails = addressDetails || {};
        let finalAddressId = undefined;

        if (typeof rawAddress === "string") {
            // Check if it's an ObjectId or a text address string
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(rawAddress);
            if (isObjectId) {
                finalAddressId = rawAddress;
                const userAddr = await Address.findById(rawAddress);
                if (userAddr) {
                    finalAddressDetails = {
                        city: userAddr.City ? userAddr.City.name || "" : "",
                        boulevard: userAddr.bolvar || "",
                        alley: userAddr.koche || "",
                        plaque: userAddr.pelak || "",
                        unit: userAddr.vahed || "",
                        postalCode: userAddr.postalCode || "",
                        lat: userAddr.lat || 0,
                        lng: userAddr.long || 0,
                        fullAddress: userAddr.title || `${userAddr.bolvar || ""} ${userAddr.koche || ""} پلاک ${userAddr.pelak || ""}`
                    };
                }
            } else {
                finalAddressDetails = {
                    ...finalAddressDetails,
                    fullAddress: rawAddress
                };
            }
        }

        const effectiveDeliveryCost = bodyDeliveryCost !== undefined ? bodyDeliveryCost : (bodyDeliveryFee !== undefined ? bodyDeliveryFee : (shop.deliveryCost || shop.deliveryFee || 0));
        const finalPrice = calculatedTotalPrice + effectiveDeliveryCost;

        // Payment method validation & wallet deduction
        const selectedPaymentMethod = paymentMethod || "cash_on_delivery";
        let paymentStatus = "pending";

        if (selectedPaymentMethod === "wallet") {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(400).json({ error: erorrs.userFound_404, message: typeof erorrs.userFound_404 === 'object' ? (erorrs.userFound_404.fa || erorrs.userFound_404.en || "کاربر یافت نشد") : erorrs.userFound_404 });
            }

            if ((user.finance || 0) < finalPrice) {
                const errMsg = `موجودی کیف پول شما کافی نیست. موجودی: ${(user.finance || 0).toLocaleString()} تومان، مبلغ سفارش: ${finalPrice.toLocaleString()} تومان`;
                return res.status(400).json({
                    error: errMsg,
                    message: errMsg
                });
            }

            // Deduct from wallet
            user.finance = (user.finance || 0) - finalPrice;
            await user.save();
            paymentStatus = "paid";
        }

        // Recalculate shop totalStock & save
        let totalShopStock = 0;
        for (const p of shop.products) {
            if (p.variants && p.variants.length > 0) {
                for (const v of p.variants) {
                    totalShopStock += v.stock || 0;
                }
            } else {
                totalShopStock += p.stock || 0;
            }
        }
        shop.totalStock = totalShopStock;
        await shop.save();

        // Process selectedSlot if string or object
        let processedSlot = {};
        if (typeof selectedSlot === "string") {
            processedSlot = { slotString: selectedSlot };
        } else if (selectedSlot && typeof selectedSlot === "object") {
            processedSlot = {
                timeSlot: selectedSlot.timeSlot || undefined,
                slot: selectedSlot.slot || undefined,
                slotString: selectedSlot.slotString || ""
            };
        }

        const newOrder = new ServiceOrder({
            serviceType: determinedServiceType,
            user: req.user.id,
            shop: shop._id,
            shopName: bodyShopName || shop.name || "",
            shopType: bodyShopType || shop.shopType || "",
            orderedProducts: verifiedItems,
            address: finalAddressId,
            addressDetails: finalAddressDetails,
            selectedSlot: processedSlot,
            status: "pending",
            totalPrice: calculatedTotalPrice,
            deliveryFee: effectiveDeliveryCost,
            deliveryCost: effectiveDeliveryCost,
            discount: 0,
            finalPrice: finalPrice,
            discount: 0,
            finalPrice: finalPrice,
            paymentMethod: selectedPaymentMethod,
            paymentStatus: paymentStatus,
            notes: notes || "",
            timeline: [
                {
                    status: "pending",
                    date: new Date(),
                    comment: selectedPaymentMethod === "wallet" ? "سفارش با کسر از کیف پول ثبت شد" : "سفارش توسط کاربر ثبت شد",
                    actor: req.user.id
                }
            ]
        });

        const savedOrder = await newOrder.save();

        // Log inventory deductions
        for (const item of verifiedItems) {
            await new InventoryLog({
                shop: shop._id,
                product: item.product,
                variant: item.variant,
                previousStock: item.quantity,
                newStock: 0,
                difference: -item.quantity,
                reason: `کسر بابت ثبت سفارش #${savedOrder.orderId}`,
                type: "order_deduct",
                user: req.user.id
            }).save();
        }

        // Create notification for shop owner
        const serviceNameMap = {
            water: "آب تسویه",
            bread: "نان",
            restaurant: "رستوران",
            supermarket: "سوپرمارکت",
            shop: "فروشگاه",
            other: "پذیرنده"
        };
        const serviceName = serviceNameMap[determinedServiceType] || "فروشگاه";

        await new ShopNotification({
            recipient: shop.owner,
            shop: shop._id,
            order: savedOrder._id,
            title: `سفارش جدید #${savedOrder.orderId}`,
            message: `سفارش جدیدی برای ${serviceName} ثبت شده است.`,
            type: "order_created"
        }).save();

        const populatedOrder = await ServiceOrder.findById(savedOrder._id)
            .populate("shop")
            .populate("user", "username name lastName finance");

        return res.status(201).json(populatedOrder);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Create Generic Shop Order
const createShopOrder = async (req, res) => {
    return createServiceOrder(req, res);
};

// Create Water Order
const createWaterOrder = async (req, res) => {
    return createServiceOrder(req, res, "water");
};

// Create Bread Order
const createBreadOrder = async (req, res) => {
    return createServiceOrder(req, res, "bread");
};

// Get current user's orders with filtering
const getMyServiceOrders = async (req, res) => {
    try {
        const { serviceType, status, page = 1, limit = 10, perpage } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(perpage) || parseInt(limit) || 10;
        const filter = { user: req.user.id };

        if (serviceType) {
            filter.serviceType = serviceType;
        }

        if (status) {
            if (status === "active") {
                // Active = non-terminal statuses
                filter.status = { $in: ["pending", "accepted", "ready", "shipped"] };
            } else if (status === "completed") {
                filter.status = "delivered";
            } else if (status === "cancelled") {
                filter.status = { $in: ["cancelled", "rejected"] };
            } else {
                filter.status = status;
            }
        }

        const skip = (pageNum - 1) * limitNum;
        const total = await ServiceOrder.countDocuments(filter);
        const orders = await ServiceOrder.find(filter)
            .populate("shop", "name shopType image phone address")
            .populate("user", "username name lastName finance")
            .populate({
                path: "address",
                populate: { path: "Address.city", select: "name title" }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const formattedOrders = orders.map((order) => {
            const doc = order.toObject();
            let addressObj = doc.addressDetails || {};
            if (order.address && order.address.Address) {
                const addr = order.address.Address;
                addressObj = {
                    title: addr.title || "",
                    boulevard: addr.boulevard || "",
                    alley: addr.alley || "",
                    plaque: addr.plaque || "",
                    unit: addr.unit || "",
                    cityName: (addr.city && (addr.city.name || addr.city.title)) || doc.addressDetails?.city || "",
                    postalCode: addr.postalCode || "",
                    lat: addr.lat || 0,
                    lng: addr.lng || 0,
                    fullAddress: doc.addressDetails?.fullAddress || ""
                };
            }
            return {
                ...doc,
                address: addressObj
            };
        });

        const totalPages = Math.ceil(total / limitNum);

        return res.status(200).json({
            data: formattedOrders,
            orders: formattedOrders,
            total,
            CountOfData: total,
            totalPages,
            pages: totalPages,
            CountOfPage: totalPages,
            currentPage: pageNum,
            page: pageNum
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get Shop Orders (for Shop Owner)
const getShopOrders = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { serviceType, status, page = 1, limit, perpage, search } = req.query;
        const pageSize = parseInt(perpage || limit || 20);
        const currentPage = parseInt(page || 1);

        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ error: "فروشگاه یافت نشد" });
        }

        // Permission check
        const isOwner = shop.owner.toString() === req.user.id;
        const isTeam = shop.teamMembers.some((m) => m.user.toString() === req.user.id);
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isTeam && !isAdmin) {
            return res.status(403).json({ error: erorrs.TokenNotAuthorized });
        }

        const filter = { shop: shopId };
        if (serviceType) filter.serviceType = serviceType;
        if (status) filter.status = status;

        if (search) {
            const searchNum = parseInt(search);
            if (!isNaN(searchNum)) {
                filter.orderId = searchNum;
            }
        }

        const skip = (currentPage - 1) * pageSize;
        const total = await ServiceOrder.countDocuments(filter);
        const orders = await ServiceOrder.find(filter)
            .populate("user", "username name lastName")
            .populate({
                path: "address",
                populate: { path: "Address.city", select: "name title" }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        const formattedOrders = orders.map((order) => {
            const doc = order.toObject();
            let addressObj = doc.addressDetails || {};
            if (order.address && order.address.Address) {
                const addr = order.address.Address;
                addressObj = {
                    title: addr.title || "",
                    boulevard: addr.boulevard || "",
                    alley: addr.alley || "",
                    plaque: addr.plaque || "",
                    unit: addr.unit || "",
                    cityName: (addr.city && (addr.city.name || addr.city.title)) || doc.addressDetails?.city || "",
                    postalCode: addr.postalCode || "",
                    lat: addr.lat || 0,
                    lng: addr.lng || 0,
                    fullAddress: doc.addressDetails?.fullAddress || ""
                };
            }
            return {
                ...doc,
                address: addressObj
            };
        });

        return res.status(200).json({
            data: formattedOrders,
            orders: formattedOrders,
            total,
            CountOfData: total,
            totalPages: Math.ceil(total / pageSize),
            pages: Math.ceil(total / pageSize),
            currentPage: currentPage,
            page: currentPage
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get All Orders (Admin panel with filters)
const getAllServiceOrders = async (req, res) => {
    try {
        const { serviceType, status, city, shopId, search, page = 1, limit = 20 } = req.query;
        let filter = {};

        if (serviceType) filter.serviceType = serviceType;
        if (status) filter.status = status;
        if (shopId) filter.shop = shopId;

        if (search) {
            const searchNum = parseInt(search);
            if (!isNaN(searchNum)) {
                filter.orderId = searchNum;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await ServiceOrder.countDocuments(filter);
        const orders = await ServiceOrder.find(filter)
            .populate("shop")
            .populate("user", "username name lastName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        return res.status(200).json({
            orders,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get single order by ID
const getServiceOrderById = async (req, res) => {
    try {
        const order = await ServiceOrder.findById(req.params.id)
            .populate("shop")
            .populate("user", "username name lastName");

        if (!order) {
            return res.status(404).json({ error: "سفارش پیدا نشد" });
        }

        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Update order status workflow (accept, ready, shipped, delivered)
const updateOrderStatus = async (req, res, targetStatus, comment) => {
    try {
        const order = await ServiceOrder.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "سفارش پیدا نشد" });
        }

        const shop = await Shop.findById(order.shop);
        const isOwner = shop && shop.owner.toString() === req.user.id;
        const isTeam = shop && shop.teamMembers.some((m) => m.user.toString() === req.user.id);
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isTeam && !isAdmin) {
            return res.status(403).json({ error: erorrs.TokenNotAuthorized });
        }

        // Allowed transitions:
        // pending -> accepted, rejected, cancelled
        // accepted -> ready, cancelled
        // ready -> shipped, cancelled
        // shipped -> delivered
        const validTransitions = {
            pending: ["accepted", "rejected", "cancelled"],
            accepted: ["ready", "cancelled"],
            ready: ["shipped", "cancelled"],
            shipped: ["delivered"],
            delivered: [],
            cancelled: [],
            rejected: []
        };

        if (!validTransitions[order.status].includes(targetStatus)) {
            return res.status(400).json({
                error: `تغییر وضعیت از ${order.status} به ${targetStatus} امکان‌پذیر نیست`
            });
        }

        order.status = targetStatus;
        if (targetStatus === "delivered") {
            order.deliveredAt = new Date();
            order.paymentStatus = "paid";
        }

        order.timeline.push({
            status: targetStatus,
            date: new Date(),
            comment: comment || req.body.comment || `وضعیت سفارش به ${targetStatus} تغییر یافت`,
            actor: req.user.id
        });

        await order.save();

        // Notification for user
        await new ShopNotification({
            recipient: order.user,
            shop: order.shop,
            order: order._id,
            title: `وضعیت سفارش #${order.orderId}`,
            message: `وضعیت سفارش شما به ${targetStatus} تغییر یافت.`,
            type: "order_status_change"
        }).save();

        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const acceptOrder = async (req, res) => updateOrderStatus(req, res, "accepted", "سفارش توسط فروشگاه تایید شد");
const readyOrder = async (req, res) => updateOrderStatus(req, res, "ready", "سفارش آماده ارسال است");
const shippedOrder = async (req, res) => updateOrderStatus(req, res, "shipped", "سفارش ارسال شد");
const deliveredOrder = async (req, res) => updateOrderStatus(req, res, "delivered", "سفارش تحویل داده شد");

// Reject order by shop owner
const rejectOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await ServiceOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "سفارش پیدا نشد" });

        const shop = await Shop.findById(order.shop);
        const isOwner = shop && shop.owner.toString() === req.user.id;
        const isTeam = shop && shop.teamMembers.some((m) => m.user.toString() === req.user.id);
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isTeam && !isAdmin) return res.status(403).json({ error: erorrs.TokenNotAuthorized });

        if (order.status !== "pending") {
            return res.status(400).json({ error: "فقط سفارش‌های در انتظار تایید قابلیت رد شدن دارند" });
        }

        order.status = "rejected";
        order.rejectionReason = reason || "عدم امکان پاسخگویی فروشگاه";
        order.timeline.push({
            status: "rejected",
            date: new Date(),
            comment: `سفارش رد شد: ${order.rejectionReason}`,
            actor: req.user.id
        });

        // Restore stock
        if (shop) {
            for (const item of order.orderedProducts) {
                const prod = shop.products.id(item.product);
                if (prod) {
                    if (item.variant) {
                        const v = prod.variants.id(item.variant);
                        if (v) {
                            v.stock += item.quantity;
                            v.available = true;
                        }
                    } else {
                        prod.stock += item.quantity;
                        prod.available = true;
                    }
                }
            }
            await shop.save();
        }

        // Refund wallet if paid via wallet
        if (order.paymentStatus === "paid" && order.paymentMethod === "wallet") {
            const orderUser = await User.findById(order.user);
            if (orderUser) {
                orderUser.finance = (orderUser.finance || 0) + (order.finalPrice || order.totalPrice || 0);
                await orderUser.save();
            }
            order.paymentStatus = "pending";
        }

        await order.save();

        await new ShopNotification({
            recipient: order.user,
            shop: order.shop,
            order: order._id,
            title: `سفارش #${order.orderId} رد شد`,
            message: `سفارش شما به دلیل '${order.rejectionReason}' رد شد.${order.paymentMethod === "wallet" ? " مبلغ به کیف پول شما بازگردانده شد." : ""}`,
            type: "order_status_change"
        }).save();

        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Cancel order by User or Admin
const cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await ServiceOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "سفارش پیدا نشد" });

        const isUser = order.user.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if (!isUser && !isAdmin) {
            return res.status(403).json({ error: erorrs.TokenNotAuthorized });
        }

        if (!["pending", "accepted"].includes(order.status)) {
            return res.status(400).json({ error: "امکان لغو این سفارش در این مرحله وجود ندارد" });
        }

        order.status = "cancelled";
        order.cancellationReason = reason || "لغو شده توسط کاربر";
        order.timeline.push({
            status: "cancelled",
            date: new Date(),
            comment: `سفارش لغو شد: ${order.cancellationReason}`,
            actor: req.user.id
        });

        // Restore stock
        const shop = await Shop.findById(order.shop);
        if (shop) {
            for (const item of order.orderedProducts) {
                const prod = shop.products.id(item.product);
                if (prod) {
                    if (item.variant) {
                        const v = prod.variants.id(item.variant);
                        if (v) {
                            v.stock += item.quantity;
                            v.available = true;
                        }
                    } else {
                        prod.stock += item.quantity;
                        prod.available = true;
                    }
                }
            }
            await shop.save();
        }

        // Refund wallet if paid via wallet
        if (order.paymentStatus === "paid" && order.paymentMethod === "wallet") {
            const orderUser = await User.findById(order.user);
            if (orderUser) {
                orderUser.finance = (orderUser.finance || 0) + (order.finalPrice || order.totalPrice || 0);
                await orderUser.save();
            }
            order.paymentStatus = "pending";
        }

        await order.save();

        if (shop) {
            await new ShopNotification({
                recipient: shop.owner,
                shop: shop._id,
                order: order._id,
                title: `سفارش #${order.orderId} لغو شد`,
                message: `سفارش لغو شد به دلیل: ${order.cancellationReason}${order.paymentMethod === "wallet" ? " - مبلغ به کیف پول بازگردانده شد." : ""}`,
                type: "order_status_change"
            }).save();
        }

        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Shop Owner Dashboard Stats
const getShopDashboardStats = async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ error: "فروشگاه پیدا نشد" });

        const isOwner = shop.owner.toString() === req.user.id;
        const isTeam = shop.teamMembers.some((m) => m.user.toString() === req.user.id);
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isTeam && !isAdmin) return res.status(403).json({ error: erorrs.TokenNotAuthorized });

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const [
            totalOrders,
            todayOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            revenueData,
            topProductsData,
            recentOrders
        ] = await Promise.all([
            ServiceOrder.countDocuments({ shop: shopId }),
            ServiceOrder.countDocuments({ shop: shopId, createdAt: { $gte: startOfToday } }),
            ServiceOrder.countDocuments({ shop: shopId, status: "pending" }),
            ServiceOrder.countDocuments({ shop: shopId, status: "delivered" }),
            ServiceOrder.countDocuments({ shop: shopId, status: { $in: ["cancelled", "rejected"] } }),
            ServiceOrder.aggregate([
                { $match: { shop: shop._id, status: "delivered" } },
                { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
            ]),
            ServiceOrder.aggregate([
                { $match: { shop: shop._id, status: { $nin: ["cancelled", "rejected"] } } },
                { $unwind: "$orderedProducts" },
                {
                    $group: {
                        _id: "$orderedProducts.product",
                        productName: { $first: "$orderedProducts.productName" },
                        salesCount: { $sum: "$orderedProducts.quantity" },
                        revenue: { $sum: "$orderedProducts.totalPrice" }
                    }
                },
                { $sort: { salesCount: -1 } },
                { $limit: 10 },
                {
                    $project: {
                        _id: 0,
                        product: "$_id",
                        productName: 1,
                        salesCount: 1,
                        revenue: 1
                    }
                }
            ]),
            ServiceOrder.find({ shop: shopId })
                .populate("user", "username name lastName")
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        return res.status(200).json({
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            revenue: totalRevenue,
            totalRevenue,
            todayOrders,
            topProducts: topProductsData,
            totalStock: shop.totalStock,
            recentOrders
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Admin Dashboard Stats
const getAdminDashboardStats = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const [
            totalShops,
            waterShops,
            breadShops,
            restaurantShops,
            supermarketShops,
            otherShops,
            totalOrders,
            waterOrders,
            breadOrders,
            restaurantOrders,
            supermarketOrders,
            shopOrders,
            pendingOrders,
            deliveredOrders,
            revenueData
        ] = await Promise.all([
            Shop.countDocuments(),
            Shop.countDocuments({ shopType: "water" }),
            Shop.countDocuments({ shopType: "bread" }),
            Shop.countDocuments({ shopType: "restaurant" }),
            Shop.countDocuments({ shopType: "supermarket" }),
            Shop.countDocuments({ shopType: "other" }),
            ServiceOrder.countDocuments(),
            ServiceOrder.countDocuments({ serviceType: "water" }),
            ServiceOrder.countDocuments({ serviceType: "bread" }),
            ServiceOrder.countDocuments({ serviceType: "restaurant" }),
            ServiceOrder.countDocuments({ serviceType: "supermarket" }),
            ServiceOrder.countDocuments({ serviceType: "shop" }),
            ServiceOrder.countDocuments({ status: "pending" }),
            ServiceOrder.countDocuments({ status: "delivered" }),
            ServiceOrder.aggregate([
                { $match: { status: "delivered" } },
                { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
            ])
        ]);

        return res.status(200).json({
            shops: {
                total: totalShops,
                water: waterShops,
                bread: breadShops,
                restaurant: restaurantShops,
                supermarket: supermarketShops,
                other: otherShops
            },
            orders: {
                total: totalOrders,
                water: waterOrders,
                bread: breadOrders,
                restaurant: restaurantOrders,
                supermarket: supermarketOrders,
                shop: shopOrders,
                pending: pendingOrders,
                delivered: deliveredOrders
            },
            totalRevenue: revenueData.length > 0 ? revenueData[0].totalRevenue : 0
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createShopOrder,
    createWaterOrder,
    createBreadOrder,
    getMyServiceOrders,
    getShopOrders,
    getAllServiceOrders,
    getServiceOrderById,
    acceptOrder,
    readyOrder,
    shippedOrder,
    deliveredOrder,
    rejectOrder,
    cancelOrder,
    getShopDashboardStats,
    getAdminDashboardStats
};
