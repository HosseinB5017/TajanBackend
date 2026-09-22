const express = require("express");
const router = express.Router();
const { verifyTokenAndAdmin } = require("../Controllers/VerifyToken.js");
const controller = require("../Controllers/Cooperation.Controllers.js");

// 1) Public / User create cooperation request (auth header optional)
router.post("/", controller.createCooperation);

// 2) Admin list cooperations
router.get("/admin", verifyTokenAndAdmin, controller.getCooperations);
router.get("/", verifyTokenAndAdmin, controller.getCooperations);

// 3) Admin get single cooperation details
router.get("/admin/:id", verifyTokenAndAdmin, controller.getCooperationById);
router.get("/find", verifyTokenAndAdmin, controller.getCooperationById);
router.get("/:id", verifyTokenAndAdmin, controller.getCooperationById);

// 4) Admin update cooperation status & note
router.post("/update/:id", verifyTokenAndAdmin, controller.updateCooperationStatus);
router.put("/admin/:id", verifyTokenAndAdmin, controller.updateCooperationStatus);
router.put("/:id", verifyTokenAndAdmin, controller.updateCooperationStatus);
router.patch("/:id", verifyTokenAndAdmin, controller.updateCooperationStatus);

// 5) Admin delete cooperation
router.delete("/admin/:id", verifyTokenAndAdmin, controller.deleteCooperation);
router.delete("/:id", verifyTokenAndAdmin, controller.deleteCooperation);

module.exports = router;
