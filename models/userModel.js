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
  password: {
    type: String,
    required: true,
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

/**
 * ✅ Instance method: Create a secure token for password reset
 * - Generates a random 32-byte token (hex string)
 * - Hashes it using SHA-256
 * - Stores hash in DB (not raw token!)
 * - Sets expiration time (15 mins from now)
 * - Returns raw token (you can email this to the user)
 */
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

// ✅ Export model
module.exports = mongoose.model("User", userSchema);
