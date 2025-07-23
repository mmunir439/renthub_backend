const retnitemModel = require("../models/retnitemModel"); // Check this name if it's correct
const tookitemModel = require("../models/tookonRent"); // Check this name if it's correct
exports.Tookrentforbook = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const { rentitemId } = req.params;
    const userId = req.user._id;

    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "Admins are not allowed to rent items.",
      });
    }

    console.log("📩 Booking request received by user:", userId);

    const item = await retnitemModel.findOne({
      _id: rentitemId,
      status: "approved",
    });

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or not approved by admin." });
    }

    if (item.owner.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot rent your own item." });
    }

    // ✅ Parse and validate time
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid start or end time format." });
    }

    const hours = (end - start) / (1000 * 60 * 60); // ms → hours

    if (hours <= 0) {
      return res
        .status(400)
        .json({ message: "End time must be after start time." });
    }

    const totalHours = Math.round(hours); // Round to nearest hour
    const totalPrice = totalHours * item.pricePerHour;

    const bookingData = {
      item: item._id,
      renter: userId,
      startTime: start,
      endTime: end,
      totalHours,
      totalPrice,
    };

    const booking = await tookitemModel.create(bookingData);

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
    // ⛔ Prevent admin from accessing this
    if (req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins are not allowed to rent items.",
      });
    } //

    // ✅ Now this part will run only if the user is not an admin
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
// PUT /tookonRent/:bookingId
exports.updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { startTime, endTime } = req.body;

    const booking = await tookitemModel.findById(bookingId).populate("item");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);

    if (hours <= 0) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    booking.startTime = start;
    booking.endTime = end;
    booking.totalHours = Math.round(hours);
    booking.totalPrice = booking.totalHours * booking.item.pricePerHour;

    await booking.save();

    res.json({ message: "Booking updated successfully", booking });
  } catch (err) {
    console.error("❌ Update booking error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// DELETE /tookonRent/:bookingId
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await tookitemModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await tookitemModel.findByIdAndDelete(bookingId);

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("❌ Delete booking error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

