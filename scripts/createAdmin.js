const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
require("dotenv").config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" Connected to MongoDB.");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log(" Missing ADMIN_EMAIL or ADMIN_PASSWORD in env.");
      process.exit(1);
    }

    const existingAdmin = await User.findOne({
      email: adminEmail,
      role: "admin",
    });

    if (existingAdmin) {
      console.log(" Admin already exists. Skipping creation.");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await User.create({
      name: "Muhammad Munir",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log(" Admin created successfully:");
    console.log({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    process.exit();
  } catch (err) {
    console.error(" Error creating admin:", err.message);
    process.exit(1);
  }
}

createAdmin();
