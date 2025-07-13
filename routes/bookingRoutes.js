const express = require("express");
const router = express.Router();
const {
  createBooking,
  approveBooking,
  rejectBooking,
} = require("../controllers/bookingController");
const { verifyToken } = require("../middleware/authMiddleware");
// router.get("/", (req, res) => {
//   res.send("this booking is done now");
// });
router.post("/:itemId", verifyToken, createBooking); // rent item
router.patch("/:id/approve", verifyToken, approveBooking); // owner action
router.patch("/:id/reject", verifyToken, rejectBooking); // owner action

module.exports = router;
