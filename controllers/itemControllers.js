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
