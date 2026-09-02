const express = require("express");
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Controllers/VerifyToken");
const controller = require("../Controllers/ServiceOrder.Controllers");

// User Routes
router.post("/water", verifyToken, controller.createWaterOrder);
router.post("/bread", verifyToken, controller.createBreadOrder);
router.post("/shop-order", verifyToken, controller.createShopOrder);
router.get("/me", verifyToken, controller.getMyServiceOrders);
router.post("/:id/cancel", verifyToken, controller.cancelOrder);

// Shop Owner Routes
router.get("/shop/:shopId", verifyToken, controller.getShopOrders);
router.get("/shop/:shopId/stats", verifyToken, controller.getShopDashboardStats);
router.post("/:id/accept", verifyToken, controller.acceptOrder);
router.post("/:id/ready", verifyToken, controller.readyOrder);
router.post("/:id/shipped", verifyToken, controller.shippedOrder);
router.post("/:id/delivered", verifyToken, controller.deliveredOrder);
router.post("/:id/reject", verifyToken, controller.rejectOrder);

// Service Type prefixed Actions (/api/service-orders/water/:id/accept, etc.)
router.post("/:serviceType/:id/accept", verifyToken, controller.acceptOrder);
router.post("/:serviceType/:id/ready", verifyToken, controller.readyOrder);
router.post("/:serviceType/:id/shipped", verifyToken, controller.shippedOrder);
router.post("/:serviceType/:id/delivered", verifyToken, controller.deliveredOrder);
router.post("/:serviceType/:id/reject", verifyToken, controller.rejectOrder);
router.post("/:serviceType/:id/cancel", verifyToken, controller.cancelOrder);

// Admin Routes
router.get("/admin", verifyTokenAndAdmin, controller.getAllServiceOrders);
router.get("/admin/stats", verifyTokenAndAdmin, controller.getAdminDashboardStats);

// Single Order
router.get("/:id", verifyToken, controller.getServiceOrderById);
router.get("/:serviceType/:id", verifyToken, controller.getServiceOrderById);

module.exports = router;
