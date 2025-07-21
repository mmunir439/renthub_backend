const retnitemModel = require("../models/retnitemModel"); // Check this name if it's correct
const tookitemModel = require("../models/tookonRent"); // Check this name if it's correct
// POST /tookonRent/:rentitemId
exports.Tookrentforbook = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const { rentitemId } = req.params;
    const userId = req.user._id;

    console.log("📩 Booking request received by user:", userId);

    // 1. Check if the item exists and is approved
    const item = await retnitemModel.findOne({
      _id: rentitemId,
      status: "approved",
    });

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or not approved by admin." });
    }

    // 2. Prevent owner from renting their own item
    if (item.owner.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot rent your own item." });
    }

    // 3. Calculate hours and total price
    const hours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
    if (hours <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid rental duration provided." });
    }

    const bookingData = {
      item: item._id,
      renter: userId,
      startTime,
      endTime,
      totalHours: hours,
      totalPrice: hours * item.pricePerHour,
    };

    // 4. Create booking
    const booking = await tookitemModel.create(bookingData);

    // 5. Mark item as rented
    item.isRented = true;
    await item.save();

    console.log("✅ Booking successful:", booking._id);

    res.status(201).json({
      message: "Item rented successfully",
      booking,
    });
  } catch (err) {
    console.error("❌ Booking error:", err);
    res.status(500).json({
      message: "Server error while booking item",
      error: err.message,
    });
  }
};
// GET /tookonRent/my
exports.getMyRentedItems = async (req, res) => {
  try {
    const bookings = await tookitemModel
      .find({ renter: req.user._id })
      .populate("item", "title image pricePerHour location")
      .sort({ createdAt: -1 });

    res.json({
      message: "My rented items fetched successfully",
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    console.error("❌ Fetching my bookings error:", err);
    res.status(500).json({ message: "Failed to fetch your bookings" });
  }
};
