const RentItem = require("../models/itemsModel");
const cloudinary = require("../config/cloudinary");
exports.addnewitem = async (req, res) => {
  const {
    title,
    description,
    category,
    images,
    pricePerHour,
    location,
    features,
  } = req.body;
  const owner = req.user.id; //get the owner from the token
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "renthub_items",
      resource_type: "auto",
    });
    const newitem = new RentItem({
      title,
      description,
      category,
      images: [
        {
          url: result.secure_url,
          public_id: result.public_id,
        },
      ],
      pricePerHour,
      location,
      owner,
      features,
    });
    // save to DB
    const savedItem = await newitem.save();
    res.status(201).json({
      success: true,
      data: savedItem,
      message: "Item created successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create item",
      error: error.message,
    });
  }
};
//get all items
exports.getallitems = async (req, res) => {
  try {
    const allitems = await RentItem.find(); // fetch all the items in data base
    if (!allitems) {
      return res
        .status(404)
        .json({ success: false, message: "Item not avaible" });
    }
    res.status(200).json({
      success: true,
      data: allitems,
      message: "Items fetched successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      success: false,
      message: "Failed to get items",
      error: error.message,
    });
  }
};
exports.updateItem = async (req, res) => {
  const itemId = req.params.id;

  try {
    const updatedItem = await RentItem.findByIdAndUpdate(itemId, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Ensure data validation is applied
    });

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedItem,
      message: "Item updated successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update item",
      error: error.message,
    });
  }
};

// delete item
exports.deleteitem = async (req, res) => {
  const itemId = req.params.id;
  try {
    const deletedItem = await RentItem.findByIdAndDelete(itemId);

    if (!deletedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    res.status(200).json({
      success: true,
      data: deletedItem,
      message: "Item deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
};
