const express = require("express");
const router = express.Router();
const {
  createBooking,
  approveBooking,
  rejectBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
// router.get("/", (req, res) => {
//   res.send("this booking is done now");
// });
router.post("/:rentitemId", protect, createBooking); // rent item
// router.patch("/:id/approve", protect, approveBooking); // owner action
// router.patch("/:id/reject", protect, rejectBooking); // owner action

module.exports = router;
