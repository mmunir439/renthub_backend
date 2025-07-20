const mongoose = require("mongoose");
const crypto = require("crypto");

// ✅ Define user schema
const userSchema = new mongoose.Schema({
  // Basic user info
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Email must be unique
  },
  phone: {
    type: String,
    required: true,
    unique: true, // Email must be unique
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },

  // Role: "user" or "admin"
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  // 🔒 Fields for "forgot password" feature
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex"); // Unhashed token (to email)

  // Save hashed version in DB for security
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // Set expiry: 15 minutes from now
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return rawToken;
};
module.exports = mongoose.model("User", userSchema);
