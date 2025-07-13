// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.protect = async (req, res, next) => {
  try {
    /* ─────────── 1. Get token ─────────── */
    let token;

    // 1️⃣  Check Authorization header
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // 2️⃣  Fallback: cookie named "token"
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    /* ─────────── 2. Verify token ─────────── */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded should look like: { id: "64b0b…", iat: ..., exp: ... }

    /* ─────────── 3. Attach fresh user ─────────── */
    const user = await User.findById(decoded.id || decoded._id).select(
      "-password"
    );
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user; // 🚀 available in every controller
    next(); // continue
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
