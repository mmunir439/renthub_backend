const mongoose = require("mongoose");

// ─────────────── Schema Definition ───────────────
const tookrent = new mongoose.Schema(
  {
    /* -------------------------------------------------
     * References (relations to other collections)
     * ------------------------------------------------- */

    // The item being rented (links to RentItem collection)
    item: {
      type: mongoose.Schema.Types.ObjectId, // Store the _id of the item
      ref: "RentItem", // Reference model name
      required: true, // Must supply an item
    },

    // The user who is renting the item
    renter: {
      type: mongoose.Schema.Types.ObjectId, // Store the _id of the user
      ref: "User", // Reference model name
      required: true, // Must supply a renter
    },

    /* -------------------------------------------------
     * Rental period
     * ------------------------------------------------- */
    startTime: {
      type: Number, // e.g. 9
      required: true,
    },
    endTime: {
      type: Number, // e.g. 13
      required: true,
    },

    /* -------------------------------------------------
     * Auto‑calculated fields (set in the controller)
     * ------------------------------------------------- */

    // Total hours between startTime and endTime
    totalHours: {
      type: Number,
      required: true, // Controller should compute this
    },

    // totalHours × item.pricePerHour
    totalPrice: {
      type: Number,
      required: true, // Controller should compute this
    },

    /* -------------------------------------------------
     * Booking lifecycle status
     * ------------------------------------------------- */

    status: {
      type: String,
      enum: [
        "pending", // Awaiting owner approval
        "approved", // Owner approved, item reserved
        "rejected", // Owner rejected the request
        "cancelled", // Renter or owner cancelled before start
        "completed", // Rental period finished successfully
      ],
      default: "pending",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
module.exports = mongoose.model("TookOnRent", tookrent);
