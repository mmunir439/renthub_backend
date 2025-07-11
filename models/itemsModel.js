const mongoose = require("mongoose");

const RentItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
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
    images: [
      {
        url: String,
        public_id: String, // if using Cloudinary
      },
    ],
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
    },
    isRented: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    features: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RentItem", RentItemSchema);
