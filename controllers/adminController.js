const RentItem = require("../models/retnitemModel");
const TookOnRent = require("../models/tookonRent");
const User = require("../models/userModel");
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      message: "All users fetched successfully.",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};
exports.approveitem = async (req, res) => {
  const itemId = req.params.id;
  const { status } = req.body; // ✅ Get status from request body

  try {
    const item = await RentItem.findByIdAndUpdate(
      itemId,
      { status }, // ✅ Update with given status
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: `Item status changed to ${status}`, item });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// GET /tookonRent/all (Admin only)
exports.tookallrented = async (req, res) => {
  try {
    // You can double-check for admin role if needed here too
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const allBookings = await TookOnRent.find()
      .populate("item", "title image pricePerHour location")
      .populate("renter", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All rented items fetched successfully (admin)",
      count: allBookings.length,
      bookings: allBookings,
    });
  } catch (error) {
    console.error("❌ Admin fetch error:", error);
    res.status(500).json({
      message: "Server error while fetching all bookings",
      error: error.message,
    });
  }
};
