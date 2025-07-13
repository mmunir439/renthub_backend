  const Booking = require("../models/bookingModel");
  const RentItem = require("../models/itemsModel");

  ///bookings/:itemId
  exports.createBooking = async (req, res) => {
  const { startTime, endTime } = req.body;
  console.log("🔍 Incoming booking request");
  console.log("🧾 req.user:", req.user);
  console.log("📆 startTime:", startTime, "| endTime:", endTime);

  const item = await RentItem.findById(req.params.itemId);
  if (!item) return res.status(404).json({ msg: "Item not found" });

  if (item.owner.equals(req.user._id)) {
    return res.status(400).json({ msg: "Cannot rent your own item" });
  }

  const hours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
  const bookingData = {
    item: item._id,
    renter: req.user._id,
    startTime,
    endTime,
    totalHours: hours,
    totalPrice: hours * item.pricePerHour,
  };

  console.log("📦 Booking payload to be created:", bookingData);

  try {
    const booking = await Booking.create(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    console.error("❌ Booking creation error:", error);
    res.status(500).json({ msg: "Booking failed", error: error.message });
  }
};


  // PATCH /api/bookings/:id/approve
  exports.approveBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate("item");
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    // only the item owner can approve
    if (!booking.item.owner.equals(req.user._id))
      return res.status(403).json({ msg: "Not authorized" });

    booking.status = "approved";
    await booking.save();

    // mark item busy
    booking.item.isRented = true;
    await booking.item.save();

    res.json({ msg: "Booking approved" });
  };

  // PATCH /api/bookings/:id/reject
  exports.rejectBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate("item");
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    if (!booking.item.owner.equals(req.user._id))
      return res.status(403).json({ msg: "Not authorized" });

    booking.status = "rejected";
    await booking.save();
    res.json({ msg: "Booking rejected" });
  };
