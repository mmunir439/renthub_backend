const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { sendEmail } = require("../utils/email"); // Email utility function

// ─────────────────────────────────────────
// Get currently logged-in user info (via token)
// ─────────────────────────────────────────
exports.me = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────
// Register a new user
// ─────────────────────────────────────────
exports.registeruser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone, // ✅
      address,
    });

    const savedUser = await newUser.save();

    // ✅ Welcome email content
    const html = `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Hello, ${savedUser.name}!</h2>
        <p>Welcome to <strong>RentHub</strong> — the marketplace for renting and listing items safely and quickly.</p>
        <ul>
          <li>List your items and earn money.</li>
          <li>Browse thousands of items to rent at affordable prices.</li>
          <li>Connect safely with other users.</li>
        </ul>
        <p>We’re excited to have you join the RentHub community.</p>
        <a href="https://www.renthub.com" style="display:inline-block;background-color:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Visit RentHub</a>
        <p>Happy Renting!</p>
        <p>- The RentHub Team</p>
      </div>
    `;

    // Send welcome email
    await sendEmail(savedUser.email, "Welcome to RentHub!", html);

    res.status(201).json({
      success: true,
      data: savedUser,
      message: "User registered and email sent!",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────
// Login user
// ─────────────────────────────────────────
exports.loginuser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      phone: user.phone,
    },
  });
};

// ─────────────────────────────────────────
// Forgot password – send reset link
// ─────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always reply the same to prevent email enumeration
  if (!user) {
    return res.status(200).json({
      message: "If the email exists, a reset link has been sent.",
    });
  }

  // Create secure token
  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const html = `
    <p>You requested a password reset for RentHub.</p>
    <p>Click the button below within 15&nbsp;minutes:</p>
    <a href="${resetURL}" style="padding:10px 18px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;">Reset Password</a>
    <p>If you didn’t request this, just ignore this email.</p>
  `;

  try {
    await sendEmail(user.email, "Reset your RentHub password", html);

    if (process.env.NODE_ENV !== "production") {
      return res.json({
        message: "Reset link (dev only)",
        resetURL,
      });
    }

    res.json({ message: "Check your email for the reset link." });
  } catch (err) {
    user.resetPasswordToken = user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: "Email could not be sent." });
  }
};

// ─────────────────────────────────────────
// Reset password – validate token and save new password
// ─────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Link is invalid or has expired." });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = user.resetPasswordExpire = undefined;
  await user.save();

  const jwtToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ message: "Password updated successfully.", token: jwtToken });
};

// ─────────────────────────────────────────
// Admin creation – manually create an admin user
// ─────────────────────────────────────────
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      phone, // Optional
      address, // Optional
    });

    console.log("Admin user created.");

    res.status(201).json({
      message: "Admin user created successfully.",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create admin user.",
      error: error.message,
    });
  }
};
