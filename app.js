const path = require("path");

const express = require("express");
const cors = require("cors"); // ✅ Add this
const connectDB = require("./config/db.js");

const app = express();
require("dotenv").config();

connectDB();
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // use your .env value
    credentials: true, // if you are using cookies or auth headers
    methods: ["GET", "POST", "PUT", "DELETE"],
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

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
