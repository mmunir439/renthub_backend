const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/isAdmin");
const adminController = require("../controllers/adminController");
router.get(
  "/getalluser",
  protect,
  restrictTo("admin"),
  adminController.getAllUsers
);
router.put(
  "/approveItem/:id",
  protect,
  restrictTo("admin"),
  adminController.approveitem
);
router.get(
  "/tookallrented",
  protect,
  restrictTo("admin"),
  adminController.tookallrented
);
router.put(
  "/updateBookingStatus/:bookingId",
  protect,
  restrictTo("admin"),
  adminController.updateBookingStatus
);
module.exports = router;
