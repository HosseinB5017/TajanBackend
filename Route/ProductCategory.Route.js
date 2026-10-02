const express = require("express");
const router = express.Router();
const { verifyToken } = require("../Controllers/VerifyToken");
const controller = require("../Controllers/ProductCategory.Controllers");

// List and get categories
router.get("/", controller.getProductCategories);
router.get("/:id", controller.getProductCategoryById);

// Create, Update, Delete categories
router.post("/", verifyToken, controller.createProductCategory);
router.put("/:id", verifyToken, controller.updateProductCategory);
router.delete("/:id", verifyToken, controller.deleteProductCategory);

module.exports = router;
