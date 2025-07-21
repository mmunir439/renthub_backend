const RentItem = require("../models/retnitemModel");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ───────────────────────────────
// Add New Item
// ───────────────────────────────
exports.addnewitem = async (req, res) => {
  const {
    title,
    description,
    category,
    image,
    pricePerHour,
    location,
    features, // ← still a string right now
    isRented,
  } = req.body;
  const parsedFeatures = features; // Just keep it as-is, a paragraph string

  const owner = req.user.id;

  try {
    // 2️⃣  Handle the (optional) image
    let imageBlock = { url: "", public_id: "" };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "renthub_items", // You can change this folder name
      });

      imageBlock = {
        url: result.secure_url,
        public_id: result.public_id,
      };

      // Optional: delete the local file after upload
      fs.unlinkSync(req.file.path);
    }

    // 3️⃣  Create the item using the **parsed** features
    const newItem = new RentItem({
      title,
      description,
      category,
      image: [imageBlock],
      pricePerHour: Number(pricePerHour),
      location,
      owner,
      features: parsedFeatures, // ← object/Map, not string
      isRented: isRented || false,
    });

    const savedItem = await newItem.save();

    res.status(201).json({
      success: true,
      data: savedItem,
      message: "Item created successfully!",
    });
  } catch (error) {
    console.error("addnewitem error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create item",
      error: error.message,
    });
  }
};
// GET /rentitem/my — Fetch only items posted by the current user
exports.getMyPostedItems = async (req, res) => {
  try {
    const myItems = await RentItem.find({ owner: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: myItems.length,
      data: myItems,
      message: "Your posted items fetched successfully!",
    });
  } catch (error) {
    console.error("getMyPostedItems error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your posted items",
      error: error.message,
    });
  }
};

// ───────────────────────────────
// Get All Items
// ───────────────────────────────
exports.getallitems = async (req, res) => {
  try {
    const allItems = await RentItem.find();

    if (!allItems || allItems.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No items available" });
    }

    res.status(200).json({
      success: true,
      data: allItems,
      message: "Items fetched successfully!",
    });
  } catch (error) {
    console.error("getallitems error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get items",
      error: error.message,
    });
  }
};
exports.getitem = async (req, res) => {
  const id = req.params.id;

  try {
    const item = await RentItem.findById(id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    res.status(200).json({
      success: true,
      data: item,
      message: "Item fetched successfully!",
    });
  } catch (error) {
    console.error("getitem error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get item",
      error: error.message,
    });
  }
};
//just for testing purpose only
exports.munir = async (req, res) => {
  res.send("hlo and how are you?");
};
// ───────────────────────────────
// Update Item
// ───────────────────────────────
// controllers/itemController.js
exports.updateItem = async (req, res) => {
  const itemId = req.params.id;

  try {
    /* ─────── 1. Find the item first ─────── */
    const item = await RentItem.findById(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    /* ─────── 2. Owner‑only guard ─────── */
    if (!item.owner.equals(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    /* ─────── 3. Build an update object ─────── */
    const update = {};

    // text fields may or may not be present
    const fields = [
      "title",
      "description",
      "category",
      "pricePerHour",
      "location",
      "isRented",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });

    /* ─────── 4. Parse features if provided ─────── */
    if (req.body.features !== undefined) {
      update.features = req.body.features; // Just update the string
    }

    /* ─────── 5. Optional new image upload ─────── */
    if (req.file) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "renthub_items",
        resource_type: "auto",
      });

      // If you want to REPLACE first image:
      update["image.0"] = {
        url: result.secure_url,
        public_id: result.public_id,
      };

      // OR push a new image (keep the old ones):
      // update.$push = { image: { url: result.secure_url, public_id: result.public_id } };
    }

    /* ─────── 6. Perform the update ─────── */
    const updatedItem = await RentItem.findByIdAndUpdate(itemId, update, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedItem,
      message: "Item updated successfully!",
    });
  } catch (error) {
    console.error("updateItem error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update item",
      error: error.message,
    });
  }
};

// ───────────────────────────────
// Delete Item
// ───────────────────────────────
exports.deleteitem = async (req, res) => {
  const itemId = req.params.id;

  try {
    const deletedItem = await RentItem.findByIdAndDelete(itemId);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: deletedItem,
      message: "Item deleted successfully!",
    });
  } catch (error) {
    console.error("deleteitem error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
};
// GET /items/rented — Get all rented items
exports.getRentedItems = async (req, res) => {
  try {
    const rentedItems = await RentItem.find({ isRented: true });

    res.status(200).json({
      success: true,
      data: rentedItems,
      message: "All rented items fetched successfully",
    });
  } catch (error) {
    console.error("getRentedItems error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rented items",
      error: error.message,
    });
  }
};
// PUT /rentitem/:id/toggle-status
exports.toggleRentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await RentItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.isRented = !item.isRented;
    await item.save();

    res.status(200).json({ message: "Status updated", data: item });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// // ───────────────────────────────
// // Rent Item
// // ───────────────────────────────
// exports.rentItem = async (req, res) => {
//   const itemId = req.params.id;
//   const userId = req.user.id;
//   const { returnDate } = req.body;

//   try {
//     const item = await RentItem.findById(itemId);

//     if (!item) {
//       return res.status(404).json({
//         success: false,
//         message: "Item not found",
//       });
//     }

//     if (item.owner.toString() === userId) {
//       return res.status(400).json({
//         success: false,
//         message: "You can't rent your own item",
//       });
//     }

//     if (item.isRented) {
//       return res.status(400).json({
//         success: false,
//         message: "Item is already rented",
//       });
//     }

//     if (returnDate && new Date(returnDate) <= Date.now()) {
//       return res.status(400).json({
//         success: false,
//         message: "returnDate must be in the future",
//       });
//     }

//     const transaction = await RentalTransaction.create({
//       item: item._id,
//       renter: userId,
//       returnDate,
//     });

//     item.isRented = true;
//     await item.save();

//     res.status(200).json({
//       success: true,
//       data: transaction,
//       message: "Item rented successfully!",
//     });
//   } catch (err) {
//     console.error("rentItem error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to rent item",
//       error: err.message,
//     });
//   }
// };
