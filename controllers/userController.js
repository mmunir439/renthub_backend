const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const { sendEmail } = require("../utils/email"); // ← import our util function
//  REGISTER ROUTE
exports.registeruser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const html = `
  <div style="font-family: sans-serif; line-height: 1.6;">
    <h2>Hello, ${savedUser.name}!</h2>
    <p>Welcome to <strong>RentHub</strong> — the marketplace for renting and listing items safely and quickly.</p>
    <p>Here’s what you can do:</p>
    <ul>
      <li> List your items and earn money.</li>
      <li> Browse thousands of items to rent at affordable prices.</li>
      <li> Connect safely with other users.</li>
    </ul>
    <p>We’re excited to have you join the RentHub community.</p>
    <p>Click below to get started:</p>
    <p>
      <a 
        href="https://www.renthub.com" // here replace with website name
        style="
          display: inline-block;
          background-color: #007bff;
          color: #fff;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
        ">
        Visit RentHub
      </a>
    </p>
    <p>Happy Renting!</p>
    <p>- The RentHub Team</p>
  </div>
`;

    // send the email
    await sendEmail(savedUser.email, "Welcome to My App!", html);

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
exports.loginuser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email); // debug

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// ─────────────────────────────────────────
// 1) “Forgot password” – generate + email link
// ─────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always reply the same: avoids email enumeration
  if (!user) {
    return res
      .status(200)
      .json({ message: "If the email exists, a reset link has been sent." });
  }

  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Link that your React / Next.js page will handle
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const html = `
    <p>You requested a password reset for RentHub.</p>
    <p>Click the button below within 15&nbsp;minutes:</p>
    <a href="${resetURL}" style="padding:10px 18px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;">Reset Password</a>
    <p>If you didn’t request this, just ignore this email.</p>
  `;

  try {
    await sendEmail(user.email, "Reset your RentHub password", html);

    // Show reset link directly in Postman if not in production
    if (process.env.NODE_ENV !== "production") {
      return res.json({
        message: "Reset link (dev only)",
        resetURL, // ← you'll see the token here
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
// 2) “Reset password” – verify link + save new password
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

  // (optional) Log them in immediately
  const jwtToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ message: "Password updated successfully.", token: jwtToken });
};
