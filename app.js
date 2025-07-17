const path = require("path");

const express = require("express");
const cors = require("cors"); // ✅ Add this
const connectDB = require("./config/db.js");

const app = express();
require("dotenv").config();

connectDB();
app.use(
  cors({
    origin: "http://10.140.2.124:3000", // frontend IP:port
    credentials: true,
  })
);

app.use(express.json());
app.get("/test", (req, res) => {
  res.send("User route working!");
});

// Routes
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes.js");
const rentitemRoutes = require("./routes/rentitemRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes");

app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/rentitem", rentitemRoutes);
app.use("/bookings", bookingRoutes);
// ✅ Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.send("welcome to renthub portal");
});

const port = process.env.PORT || 3001;
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
