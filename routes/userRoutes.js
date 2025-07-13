const express = require("express");
const router = express.Router();
const {
  registeruser,
  loginuser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
router.post("/register", registeruser);
router.post("/login", loginuser);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:token", resetPassword);
module.exports = router;
