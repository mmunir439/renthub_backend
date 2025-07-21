const retnitemModel = require("../models/retnitemModel"); // Check this name if it's correct
const tookitemModel = require("../models/tookonRent"); // Check this name if it's correct
// POST /tookonRent/:rentitemId
// exports.Tookrentforbook = async (req, res) => {
//   try {
//     const { startTime, endTime } = req.body;
//     const { rentitemId } = req.params;
//     const userId = req.user._id;

//     // ❌ Prevent admin from booking
//     if (req.user.role === "admin") {
//       return res.status(403).json({
//         message: "Admins are not allowed to rent items.",
//       });
//     }

//     console.log("📩 Booking request received by user:", userId);

//     // ✅ Find the item and make sure it's approved
//     const item = await retnitemModel.findOne({
//       _id: rentitemId,
//       status: "approved",
//     });

//     if (!item) {
//       return res
//         .status(404)
//         .json({ message: "Item not found or not approved by admin." });
//     }

//     // ❌ Prevent owner from renting their own item
//     if (item.owner.toString() === userId.toString()) {
//       return res
//         .status(400)
//         .json({ message: "You cannot rent your own item." });
//     }

//     // ✅ Calculate duration in hours
//     const start = new Date(startTime);
//     const end = new Date(endTime);
//     const hours = (end - start) / (1000 * 60 * 60); // milliseconds → hours

//     if (isNaN(hours) || hours <= 0) {
//       return res
//         .status(400)
//         .json({ message: "Invalid rental duration provided." });
//     }

//     // ✅ Calculate total price
//     const totalPrice = hours * item.pricePerHour;

//     const bookingData = {
//       item: item._id,
//       renter: userId,
//       startTime,
//       endTime,
//       totalHours: hours,
//       totalPrice,
//     };

//     // ✅ Create booking
//     const booking = await tookitemModel.create(bookingData);

//     // ✅ Mark item as rented
//     item.isRented = true;
//     await item.save();

//     console.log("✅ Booking successful:", booking._id);

//     res.status(201).json({
//       message: "Item rented successfully",
//       booking,
//     });
//   } catch (err) {
//     console.error("❌ Booking error:", err);
//     res.status(500).json({
//       message: "Server error while booking item",
//       error: err.message,
//     });
//   }
// };
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
