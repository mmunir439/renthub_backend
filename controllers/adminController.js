const RentItem = require("../models/retnitemModel");

exports.approveItem = async (req, res) => {
  try {
    const item = await RentItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.status = "approved";
    await item.save();

    res.json({ message: "Item approved successfully", item });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find().select("-password"); // Hide passwords
//     res.status(200).json({
//       message: "All users fetched successfully.",
//       count: users.length,
//       users,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to fetch users.",
//       error: error.message,
//     });
//   }
// };
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
