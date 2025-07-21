const express = require("express");
const router = express.Router();

// ✅ Removed multer middleware import (no photo now)
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/isAdmin");
const userController = require("../controllers/userController");

// REGISTER (no photo now)
router.post("/register", userController.registeruser);

// // CREATE ADMIN
// router.post("/create-admin", userController.createAdmin);

// LOGIN
router.post("/login", userController.loginuser);

// GET CURRENT USER (requires JWT)
router.get("/me", protect, userController.me);

// FORGOT PASSWORD
router.post("/forgotPassword", userController.forgotPassword);
// Update user profile
router.put("/update-profile", protect, userController.updateUserProfile);

// RESET PASSWORD
router.post("/resetPassword/:token", userController.resetPassword);
// only admin ca acces this route
router.get("/", protect, restrictTo("admin"), userController.getAllUsers);

module.exports = router;
