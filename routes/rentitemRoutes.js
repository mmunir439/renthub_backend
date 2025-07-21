const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // or configure storage if needed

const {
  munir,
  addnewitem,
  getallitems,
  updateItem,
  getitem,
  deleteitem,
  getRentedItems,
  toggleRentStatus,
  getMyPostedItems,
  rentItem,
} = require("../controllers/rentitemsController");
const { protect } = require("../middleware/authMiddleware");
//  Public route to get all the items
router.get("/check", munir);
router.get("/", getallitems);
router.get("/getbyid/:id", getitem);
// Protected routes
router.post("/additem", protect, upload.single("image"), addnewitem);
router.put("/updateItem/:id", protect, updateItem);
router.delete("/deleteitem/:id", protect, deleteitem);
router.get("/myrented", protect, getRentedItems);
router.get("/myposteditem", protect, getMyPostedItems);

// router.post("/rent/:id", protect, rentItem);
module.exports = router;
