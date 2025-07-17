const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/authorize");
const { protect } = require("../middleware/authMiddleware");
// Protect all routes: only authenticated admins can access
router.use(protect, restrictTo("admin"));
router.get("/users", adminController.getAllUsers);
// router.delete("/users/:id", adminController.deleteUser);
// router.put("/users/:id/role", adminController.updateUserRole);

module.exports = router;
