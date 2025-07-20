const express = require("express");
const router = express.Router();
const { tookonRent, getMyRentedItems } = require("../controllers/tookonRent");
const { protect } = require("../middleware/authMiddleware");

// 🔒 Only logged-in users can rent or view rented items
router.post("/:rentitemId", protect, tookonRent);
router.get("/my", protect, getMyRentedItems); // ➕ added route to get user's bookings

// Simple test route
router.get("/", (req, res) => {
  res.send("✅ Took on rent route working");
});

module.exports = router;
