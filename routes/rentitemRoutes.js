const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // or configure storage if needed

const {
  addnewitem,
  getallitems,
  updateItem,
  deleteitem,
  rentItem,
} = require("../controllers/rentitemsController");
const { protect } = require("../middleware/authMiddleware");
//  Public route to get all the items
router.get("/", getallitems);
// Protected routes
router.post("/additem", protect, upload.single("image"), addnewitem);
router.put("/updateitems/:id", protect, updateItem);
router.delete("/deleteitem/:id", protect, deleteitem);
router.post("/rent/:id", protect, rentItem);
module.exports = router;
