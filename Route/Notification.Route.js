const express = require("express");
const router = express.Router();
const { verifyToken } = require("../Controllers/VerifyToken");
const controller = require("../Controllers/Notification.Controllers");

router.get("/", verifyToken, controller.getNotifications);
router.post("/read-all", verifyToken, controller.markAllAsRead);
router.post("/:id/read", verifyToken, controller.markAsRead);

module.exports = router;
