const express = require("express");
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Controllers/VerifyToken");
const controller = require("../Controllers/DiscountCode.Controllers");

router.get("/admin", verifyTokenAndAdmin, controller.getAdminDiscountCodes);
router.post("/admin", verifyTokenAndAdmin, controller.createAdminDiscountCode);
router.patch("/admin/:id", verifyTokenAndAdmin, controller.updateAdminDiscountCode);
router.post("/validate", verifyToken, controller.validateDiscountCode);

router.get("/:shopId/discount-codes", verifyToken, controller.getShopDiscountCodes);
router.post("/:shopId/discount-codes", verifyToken, controller.createShopDiscountCode);
router.patch("/:shopId/discount-codes/:id", verifyToken, controller.updateShopDiscountCode);

router.get("/shop/:shopId", verifyToken, controller.getShopDiscountCodes);
router.post("/shop/:shopId", verifyToken, controller.createShopDiscountCode);
router.patch("/shop/:shopId/:id", verifyToken, controller.updateShopDiscountCode);

router.get("/me", verifyToken, controller.getMyUsableDiscountCodes);

module.exports = router;
