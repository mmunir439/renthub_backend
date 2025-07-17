const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer"); // ✅ Make sure this path is correct
const { protect } = require("../middleware/authMiddleware"); // ✅ JWT auth middleware

const userController = require("../controllers/userController"); // ✅ FIXED: you were destructuring but also using userController.registeruser

// REGISTER with photo upload
router.post("/register", upload.single("photo"), userController.registeruser);
router.post("/create-admin", userController.createAdmin);

// LOGIN
router.post("/login", userController.loginuser);

// GET CURRENT USER
router.get("/me", protect, userController.me);

// FORGOT PASSWORD
router.post("/forgotPassword", userController.forgotPassword);

// RESET PASSWORD
router.post("/resetPassword/:token", userController.resetPassword);

module.exports = router;
