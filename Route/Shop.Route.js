const express = require("express");
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Controllers/VerifyToken");
const controller = require("../Controllers/Shop.Controllers");
const productCategoryController = require("../Controllers/ProductCategory.Controllers");

// Public / Authenticated Shop Browsing
router.get("/", controller.getShops);
router.get("/me", verifyToken, controller.getMyShops);
router.get("/:id", controller.getShopById);
router.get("/:id/products", controller.getShopProducts);
router.get("/:shopId/stats", verifyToken, require("../Controllers/ServiceOrder.Controllers").getShopDashboardStats);

// Shop Product Categories
router.get("/:shopId/categories", productCategoryController.getProductCategories);
router.post("/:shopId/categories", verifyToken, productCategoryController.createProductCategory);
router.put("/:shopId/categories/:categoryId", verifyToken, productCategoryController.updateProductCategory);
router.delete("/:shopId/categories/:categoryId", verifyToken, productCategoryController.deleteProductCategory);

// Shop Management (Admin or Owner)
router.post("/", verifyToken, controller.createShop);
router.put("/:id", verifyToken, controller.updateShop);
router.delete("/:id", verifyTokenAndAdmin, controller.deleteShop);

// Products Management
router.post("/:id/products", verifyToken, controller.addProductToShop);
router.put("/:shopId/products/:productId", verifyToken, controller.updateProduct);
router.delete("/:shopId/products/:productId", verifyToken, controller.deleteProduct);

// Inventory & Stock Management
router.put("/inventory/stock", verifyToken, controller.updateStock);
router.patch("/:shopId/products/:productId/stock", verifyToken, controller.updateStock);
router.patch("/:shopId/products/:productId/variants/:variantId/stock", verifyToken, controller.updateStock);
router.get("/:shopId/inventory/logs", verifyToken, controller.getInventoryLogs);

// Team Members
router.post("/:shopId/team", verifyToken, controller.addTeamMember);
router.delete("/:shopId/team/:memberId", verifyToken, controller.removeTeamMember);

// Shop Time Slots & Scheduling
router.get("/:shopId/time-slots", verifyToken, controller.getShopTimeSlots);
router.get("/:shopId/time-slots/valid", verifyToken, controller.getShopValidDeliverySlots);
router.post("/:shopId/time-slots", verifyToken, controller.createShopTimeSlot);
router.put("/:shopId/time-slots/:slotId", verifyToken, controller.updateShopTimeSlot);
router.delete("/:shopId/time-slots/:slotId", verifyToken, controller.deleteShopTimeSlot);
router.get("/:shopId/valid-slots", verifyToken, controller.getShopValidDeliverySlots);

module.exports = router;
