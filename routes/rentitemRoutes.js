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
  munir,
} = require("../controllers/rentitemsController");
const { protect } = require("../middleware/authMiddleware");
//  Public route to get all the items
router.get("/", getallitems);
router.get("/:id", getallitems);
router.get("/check", munir);
// Protected routes
router.post("/additem", protect, upload.single("image"), addnewitem);
router.put("/updateItem/:id", protect, updateItem);
router.delete("/deleteitem/:id", protect, deleteitem);
// router.post("/rent/:id", protect, rentItem);
module.exports = router;
