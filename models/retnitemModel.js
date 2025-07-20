const mongoose = require("mongoose");

const RentItemSchema = new mongoose.Schema(
  {
    // ─────────── Listing info ───────────
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Vehicles",
        "House",
        "Electronics",
        "Tools",
        "Furniture",
        "Clothing",
        "Sports",
        "Other",
      ],
    },
    image: [
      {
        url: String,
        public_id: String, // Cloudinary ID
      },
    ],
    pricePerHour: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    features: { type: String, maxlength: 3000, default: "" },

    // ─────────── Ownership ───────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─────────── Quick flag ───────────
    isRented: { type: Boolean, default: false }, // ← set true when active rental exists
  },
  { timestamps: true }
);

module.exports = mongoose.model("RentItem", RentItemSchema);
