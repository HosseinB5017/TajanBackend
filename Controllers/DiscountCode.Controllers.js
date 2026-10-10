const DiscountCode = require("../models/DiscountCode");
const DiscountRedemption = require("../models/DiscountRedemption");
const Shop = require("../models/Shop");
const User = require("../models/User");

const normalizeDiscountCode = (value) => {
  return String(value || "").trim().replace(/\s+/g, "").toUpperCase();
};

const apiError = (statusCode, code, message) => ({
  statusCode,
  error: { code, message }
});

const toTehranExpiredAt = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error("INVALID_DISCOUNT_DATE");
  }

  const date = new Date(`${dateString}T23:59:59.999+03:30`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_DISCOUNT_DATE");
  }
  return date;
};

const evaluateDiscountAmount = (discountKind, discountValue, subtotal) => {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);

  if (discountKind === "percentage") {
    const value = Number(discountValue) || 0;
    return Math.min(Math.floor((safeSubtotal * value) / 100), safeSubtotal);
  }

  const value = Number(discountValue) || 0;
  return Math.min(value, safeSubtotal);
};

const getShopItemSubtotal = async (shop, items = []) => {
  if (!shop || !Array.isArray(items) || items.length === 0) {
    return 0;
  }

  let total = 0;

  for (const item of items) {
    const productId = item.productId || item.product;
    const variantId = item.variantId || item.variant;
    const quantity = Number(item.quantity || 1);

    if (!productId || quantity <= 0) {
      throw apiError(422, "INVALID_ORDER_ITEMS", "قلم یا تعداد سفارش نامعتبر است");
    }

    const product = shop.products.id(productId);
    if (!product || !product.active) {
      throw apiError(404, "PRODUCT_NOT_FOUND", "محصول مورد نظر یافت نشد");
    }

    const productPrice = product.price || 0;
    let unitPrice = productPrice;

    if (variantId) {
      const variant = product.variants.id(variantId);
      if (!variant || !variant.available) {
        throw apiError(422, "INVALID_ORDER_ITEMS", "تنوع محصول انتخابی نامعتبر است");
      }
      unitPrice = Number(variant.price || productPrice);
    }

    total += unitPrice * quantity;
  }

  return total;
};

const ensureDiscountUsable = async (discountCodeDoc, shop, userId) => {
  if (!discountCodeDoc) {
    throw apiError(404, "DISCOUNT_CODE_NOT_FOUND", "کد تخفیف پیدا نشد");
  }

  const now = new Date();
  if (!discountCodeDoc.isActive) {
    throw apiError(409, "DISCOUNT_CODE_INACTIVE", "کد تخفیف غیرفعال است");
  }

  if (now > new Date(discountCodeDoc.expiresAt)) {
    throw apiError(409, "DISCOUNT_CODE_EXPIRED", "کد تخفیف منقضی شده است");
  }

  if (discountCodeDoc.scope === "shop") {
    if (!shop || !discountCodeDoc.shopId || String(discountCodeDoc.shopId) !== String(shop._id)) {
      throw apiError(409, "SHOP_SCOPE_MISMATCH", "کد تخفیف برای این فروشگاه قابل استفاده نیست");
    }
  }

  if (!shop) {
    throw apiError(404, "SHOP_NOT_FOUND", "فروشگاه پیدا نشد");
  }

  if (!discountCodeDoc.shopTypes || !discountCodeDoc.shopTypes.includes(shop.shopType)) {
    throw apiError(409, "SHOP_TYPE_NOT_ALLOWED", "این فروشگاه برای کد تخفیف مجاز نیست");
  }

  const userUseCount = await DiscountRedemption.countDocuments({
    discountCodeId: discountCodeDoc._id,
    userId,
    status: { $in: ["reserved", "committed"] }
  });

  if (userUseCount >= Number(discountCodeDoc.maxUsesPerUser || 1)) {
    throw apiError(409, "USER_USE_LIMIT_REACHED", "سقف استفاده از این کد برای شما تکمیل شده است");
  }

  const distinctUserIds = await DiscountRedemption.distinct("userId", {
    discountCodeId: discountCodeDoc._id,
    status: { $in: ["reserved", "committed"] }
  });

  if (distinctUserIds.length >= Number(discountCodeDoc.maxDistinctUsers || 1)) {
    throw apiError(409, "MAX_USERS_REACHED", "سقف تعداد کاربران این کد تکمیل شده است");
  }

  return true;
};

const getFilterDiscountCodes = async (req) => {
  const query = {};

  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === "true" || req.query.isActive === true;
  }

  if (req.query.search) {
    const search = String(req.query.search).trim();
    query.$or = [
      { code: { $regex: search, $options: "i" } },
      { normalizedCode: { $regex: search, $options: "i" } }
    ];
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const perpage = Math.max(1, Number(req.query.perpage) || 20);
  const skip = (page - 1) * perpage;

  return { query, page, perpage, skip };
};

const getAdminDiscountCodes = async (req, res) => {
  try {
    const { query, page, perpage, skip } = await getFilterDiscountCodes(req);
    const total = await DiscountCode.countDocuments(query);
    const items = await DiscountCode.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perpage)
      .lean();

    return res.status(200).json({
      data: items,
      total,
      page,
      perpage,
      totalPages: Math.ceil(total / perpage)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createAdminDiscountCode = async (req, res) => {
  try {
    return createDiscountCode(req, res, "global", null);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateAdminDiscountCode = async (req, res) => {
  try {
    return updateDiscountCode(req, res, "global", null);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createDiscountCode = async (req, res, scope, shopId) => {
  try {
    const payload = { ...req.body };
    const code = normalizeDiscountCode(payload.code || payload.discountCode);

    if (!code || code.length < 3 || code.length > 40) {
      return res.status(400).json(apiError(400, "INVALID_DISCOUNT_CODE", "کد تخفیف نامعتبر است"));
    }

    if (!payload.discountKind || !["percentage", "fixed"].includes(payload.discountKind)) {
      return res.status(400).json(apiError(400, "INVALID_DISCOUNT_VALUE", "نوع تخفیف نامعتبر است"));
    }

    if (!payload.shopTypes || !Array.isArray(payload.shopTypes) || payload.shopTypes.length === 0) {
      return res.status(400).json(apiError(400, "INVALID_SHOP_TYPES", "نوع فروشگاه‌ها نامعتبر است"));
    }

    if (!payload.expiresOn) {
      return res.status(400).json(apiError(400, "INVALID_DISCOUNT_DATE", "تاریخ انقضا الزامی است"));
    }

    if (!payload.maxDistinctUsers || Number(payload.maxDistinctUsers) < 1) {
      return res.status(400).json(apiError(400, "INVALID_DISCOUNT_VALUE", "maxDistinctUsers نامعتبر است"));
    }

    if (!payload.maxUsesPerUser || Number(payload.maxUsesPerUser) < 1) {
      return res.status(400).json(apiError(400, "INVALID_DISCOUNT_VALUE", "maxUsesPerUser نامعتبر است"));
    }

    const expiresAt = toTehranExpiredAt(payload.expiresOn);
    if (scope === "shop" && !shopId) {
      return res.status(400).json(apiError(400, "SHOP_NOT_FOUND", "شناسه فروشگاه الزامی است"));
    }

    const discountValue = Number(payload.discountValue);
    if (Number.isNaN(discountValue) || discountValue <= 0) {
      return res.status(400).json(apiError(400, "INVALID_DISCOUNT_VALUE", "مقدار تخفیف نامعتبر است"));
    }

    if (payload.discountKind === "percentage" && (discountValue < 1 || discountValue > 100)) {
      return res.status(400).json(apiError(400, "INVALID_DISCOUNT_VALUE", "درصد تخفیف باید بین 1 تا 100 باشد"));
    }

    const normalizedCode = normalizeDiscountCode(code);
    const duplicate = await DiscountCode.findOne({ normalizedCode }).lean();
    if (duplicate) {
      return res.status(409).json(apiError(409, "CODE_ALREADY_EXISTS", "کد تخفیف از قبل وجود دارد"));
    }

    const doc = await DiscountCode.create({
      code: normalizedCode,
      normalizedCode,
      scope,
      shopId: scope === "shop" ? shopId : null,
      discountKind: payload.discountKind,
      discountValue,
      shopTypes: payload.shopTypes.map((item) => String(item).trim()),
      expiresOn: payload.expiresOn,
      expiresAt,
      maxDistinctUsers: Number(payload.maxDistinctUsers),
      maxUsesPerUser: Number(payload.maxUsesPerUser),
      isActive: payload.isActive !== false,
      createdBy: req.user.id
    });

    return res.status(201).json({ data: doc.toObject() });
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.status(400).json(apiError(400, "INVALID_DISCOUNT_CODE", error.message));
    }
    if (error && error.code === 11000) {
      return res.status(409).json(apiError(409, "CODE_ALREADY_EXISTS", "کد تخفیف تکراری است"));
    }
    return res.status(500).json({ error: error.message });
  }
};

const updateDiscountCode = async (req, res, scope, shopId) => {
  try {
    const discountId = req.params.id;
    const existing = await DiscountCode.findById(discountId);
    if (!existing) {
      return res.status(404).json(apiError(404, "DISCOUNT_CODE_NOT_FOUND", "کد تخفیف یافت نشد"));
    }

    if (scope === "shop") {
      if (!shopId || String(existing.shopId || "") !== String(shopId)) {
        return res.status(403).json(apiError(403, "DISCOUNT_CODE_FORBIDDEN", "این کد متعلق به فروشگاه شما نیست"));
      }
    }

    const update = { ...req.body };
    delete update._id;
    delete update.createdAt;
    delete update.updatedAt;
    delete update.createdBy;
    delete update.scope;
    delete update.shopId;
    delete update.normalizedCode;

    if (update.code) {
      update.code = normalizeDiscountCode(update.code);
      update.normalizedCode = normalizeDiscountCode(update.code);
      const duplicate = await DiscountCode.findOne({ normalizedCode: update.normalizedCode, _id: { $ne: discountId } }).lean();
      if (duplicate) {
        return res.status(409).json(apiError(409, "CODE_ALREADY_EXISTS", "کد تخفیف تکراری است"));
      }
    }

    if (update.discountValue !== undefined) {
      const numericValue = Number(update.discountValue);
      if (Number.isNaN(numericValue) || numericValue <= 0) {
        return res.status(400).json(apiError(400, "INVALID_DISCOUNT_VALUE", "مقدار تخفیف نامعتبر است"));
      }
      update.discountValue = numericValue;
    }

    if (update.discountKind && !["percentage", "fixed"].includes(update.discountKind)) {
      return res.status(400).json(apiError(400, "INVALID_DISCOUNT_VALUE", "نوع تخفیف نامعتبر است"));
    }

    if (update.expiresOn) {
      update.expiresAt = toTehranExpiredAt(update.expiresOn);
      update.expiresOn = String(update.expiresOn);
    }

    if (update.maxDistinctUsers !== undefined) {
      update.maxDistinctUsers = Number(update.maxDistinctUsers);
    }

    if (update.maxUsesPerUser !== undefined) {
      update.maxUsesPerUser = Number(update.maxUsesPerUser);
    }

    if (update.shopTypes) {
      update.shopTypes = Array.isArray(update.shopTypes) ? update.shopTypes.map((item) => String(item).trim()) : [];
      if (!update.shopTypes.length) {
        return res.status(400).json(apiError(400, "INVALID_SHOP_TYPES", "نوع فروشگاه‌ها نامعتبر است"));
      }
    }

    if (update.isActive !== undefined) {
      existing.isActive = Boolean(update.isActive);
      update.isActive = Boolean(update.isActive);
    }

    Object.assign(existing, update);
    const saved = await existing.save();

    return res.status(200).json({ data: saved.toObject() });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json(apiError(409, "CODE_ALREADY_EXISTS", "کد تخفیف تکراری است"));
    }
    return res.status(500).json({ error: error.message });
  }
};

const getShopDiscountCodes = async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const shop = await Shop.findById(shopId).lean();
    if (!shop) {
      return res.status(404).json(apiError(404, "SHOP_NOT_FOUND", "فروشگاه پیدا نشد"));
    }

    const isShopOwner = shop.owner && String(shop.owner) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isShopOwner && !isAdmin) {
      return res.status(403).json(apiError(403, "DISCOUNT_CODE_FORBIDDEN", "شما مالک این فروشگاه نیستید"));
    }

    const records = await DiscountCode.find({ scope: "shop", shopId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ data: records });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createShopDiscountCode = async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json(apiError(404, "SHOP_NOT_FOUND", "فروشگاه پیدا نشد"));
    }

    const isOwner = String(shop.owner) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json(apiError(403, "DISCOUNT_CODE_FORBIDDEN", "شما مجاز به ساخت کد برای این فروشگاه نیستید"));
    }

    return createDiscountCode(req, res, "shop", shop._id);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateShopDiscountCode = async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json(apiError(404, "SHOP_NOT_FOUND", "فروشگاه پیدا نشد"));
    }

    const isOwner = String(shop.owner) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json(apiError(403, "DISCOUNT_CODE_FORBIDDEN", "شما مجاز به ویرایش این کد نیستید"));
    }

    return updateDiscountCode(req, res, "shop", shop._id);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyUsableDiscountCodes = async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await DiscountCode.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
      $or: [
        { scope: "global" },
        { scope: "shop" }
      ]
    }).sort({ createdAt: -1 }).lean();

    const validCodes = [];
    for (const code of records) {
      const isAlreadyUsed = await DiscountRedemption.countDocuments({
        discountCodeId: code._id,
        userId,
        status: { $in: ["reserved", "committed"] }
      });

      if (Number(isAlreadyUsed) < Number(code.maxUsesPerUser || 1)) {
        validCodes.push(code);
      }
    }

    return res.status(200).json({ data: validCodes });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const validateDiscountCode = async (req, res) => {
  try {
    const codeValue = normalizeDiscountCode(req.body.code || req.body.discountCode);
    const shopId = req.body.shopId || req.body.shop;
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (!codeValue) {
      return res.status(400).json(apiError(400, "INVALID_DISCOUNT_CODE", "کد تخفیف نامعتبر است"));
    }

    if (!shopId) {
      return res.status(400).json(apiError(400, "SHOP_NOT_FOUND", "شناسه فروشگاه الزامی است"));
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json(apiError(404, "SHOP_NOT_FOUND", "فروشگاه پیدا نشد"));
    }

    const discountDoc = await DiscountCode.findOne({ normalizedCode: codeValue }).lean();
    if (!discountDoc) {
      return res.status(404).json(apiError(404, "DISCOUNT_CODE_NOT_FOUND", "کد تخفیف پیدا نشد"));
    }

    await ensureDiscountUsable(discountDoc, shop, req.user.id);

    const subtotal = await getShopItemSubtotal(shop, items);
    const discountAmount = evaluateDiscountAmount(discountDoc.discountKind, discountDoc.discountValue, subtotal);
    const deliveryCost = Number(shop.deliveryCost || shop.deliveryFee || 0);
    const totalPayable = Math.max(0, subtotal - discountAmount + deliveryCost);

    return res.status(200).json({
      data: {
        valid: true,
        code: discountDoc.code,
        discountKind: discountDoc.discountKind,
        discountValue: discountDoc.discountValue,
        itemsSubtotal: subtotal,
        discountAmount,
        deliveryCost,
        totalPayable,
        expiresAt: discountDoc.expiresAt
      }
    });
  } catch (error) {
    if (error && error.statusCode) {
      return res.status(error.statusCode).json(error.error);
    }
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  normalizeDiscountCode,
  evaluateDiscountAmount,
  getAdminDiscountCodes,
  createAdminDiscountCode,
  updateAdminDiscountCode,
  getShopDiscountCodes,
  createShopDiscountCode,
  updateShopDiscountCode,
  getMyUsableDiscountCodes,
  validateDiscountCode,
  ensureDiscountUsable,
  createDiscountCode,
  updateDiscountCode
};
