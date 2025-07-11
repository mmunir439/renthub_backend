const express = require("express");
const bcrypt = require("bcrypt");
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
