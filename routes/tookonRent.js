const express = require("express");
const router = express.Router();
const {
  Tookrentforbook,
  getMyRentedItems,
  updateBooking,
  deleteBooking,
} = require("../controllers/tookonRentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:rentitemId", protect, Tookrentforbook);
router.get("/my", protect, getMyRentedItems);
router.put("/:bookingId", protect, updateBooking);
router.delete("/:bookingId", protect, deleteBooking);

module.exports = router;
