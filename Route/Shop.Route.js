const express = require("express");
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Controllers/VerifyToken");
const controller = require("../Controllers/Shop.Controllers");

// Public / Authenticated Shop Browsing
router.get("/", controller.getShops);
router.get("/me", verifyToken, controller.getMyShops);
router.get("/:id", controller.getShopById);
router.get("/:id/products", controller.getShopProducts);
router.get("/:shopId/stats", verifyToken, require("../Controllers/ServiceOrder.Controllers").getShopDashboardStats);

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

module.exports = router;
