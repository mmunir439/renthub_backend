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
    // Validate input
    if (!name || !email || !password || !phone || !address) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check for existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // Check for existing phone
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
    });
    const savedUser = await newUser.save();

    // Welcome email
    const html = `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Hello, ${savedUser.name}!</h2>
        <p>Welcome to <strong>RentHub</strong> — the marketplace for renting and listing items safely and quickly.</p>
        ...
      </div>
    `;

    try {
      await sendEmail(savedUser.email, "Welcome to RentHub!", html);
    } catch (emailError) {
      console.warn("Email failed to send:", emailError.message);
    }

    // Remove password before sending back
    const userToReturn = { ...savedUser._doc };
    delete userToReturn.password;

    res.status(201).json({
      success: true,
      data: userToReturn,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[duplicateField];
      return res.status(400).json({
        success: false,
        message: `${duplicateField} "${duplicateValue}" already exists`,
      });
    }

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
// ─────────────────────────────────────────
// Get all users (Admin only)
// ─────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Hide passwords
    res.status(200).json({
      message: "All users fetched successfully.",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};
// ─────────────────────────────────────────
// Update profile – only for logged-in user
// ─────────────────────────────────────────
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    // Handle password update
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};
