const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { addnewitem } = require("../controllers/itemControllers");
router.post("/upload", upload.single("file"), addnewitem);
module.exports = router;
