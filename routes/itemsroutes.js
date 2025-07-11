const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const {
  addnewitem,
  getallitems,
  updateItem,
  deleteitem,
} = require("../controllers/itemControllers");
router.post("/upload", upload.single("file"), addnewitem);
router.get("/getall", getallitems);
router.patch("/updateItem/:id", updateItem);
router.delete("/deleteitem/:id", deleteitem);
module.exports = router;
