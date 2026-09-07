const express = require("express");
const router = express.Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Controllers/VerifyToken");
const controller = require("../Controllers/Transaction.Controllers");

router.get("/me", verifyToken, controller.getMyTransactions);
router.get("/admin", verifyTokenAndAdmin, controller.getAllTransactions);
router.get("/", verifyToken, controller.getMyTransactions);

module.exports = router;
