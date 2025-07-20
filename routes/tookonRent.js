const express = require("express");
const router = express.Router();
const {
  tookonRent,
  getMyBookings,
  approveBooking,
  rejectBooking,
} = require("../controllers/tookonRent");
const { protect } = require("../middleware/authMiddleware");
// router.get("/", (req, res) => {
//   res.send("this booking is done now");
// });
router.post("/:rentitemId", protect, tookonRent);
router.get("/my", protect, getMyBookings);

module.exports = router;
