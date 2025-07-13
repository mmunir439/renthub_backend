const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // or configure storage if needed

const {
  getallitems,
  addnewitem,
  updateItem,
  deleteitem,
  rentItem,
} = require("../controllers/itemControllers");
const { verifyToken } = require("../middleware/authMiddleware");
//  Public route to get all the items
router.get("/", getallitems);
// Protected routes
router.post("/additem", verifyToken, upload.single("image"), addnewitem);
router.put("/updateitems/:id", verifyToken, updateItem);
router.delete("/deleteitem/:id", verifyToken, deleteitem);
router.post("/rent/:id", verifyToken, rentItem);
module.exports = router;
