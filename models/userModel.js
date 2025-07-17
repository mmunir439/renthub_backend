const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  // ✅ Add photo field
  photo: { type: String, default: "" },

  // ↓ NEW fields for password recovery
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

/**
 * Generates a secure token, stores its SHA‑256 hash + 15‑min expiry,
 * and returns the plain token so you can email it.
 */
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex"); // 64 chars
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min TTL
  return rawToken;
};

module.exports = mongoose.model("User", userSchema);
