const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/isAdmin");
const router = express.Router();
const adminController = require("../controllers/adminController");
router.get("/getalluser", adminController.getAllUsers);
module.exports = router;
