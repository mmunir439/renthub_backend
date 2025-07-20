// const express = require("express");
// const router = express.Router();
// const adminController = require("../controllers/adminController");
// router.get("/", adminController.getAllUsers);
// module.exports = router;
// adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/isAdmin");
const adminController = require("../controllers/adminController");

// Only admins can access this route
router.get(
  "/getalluser",
  protect,
  restrictTo("admin"),
  adminController.getAllUsers
);

module.exports = router;
