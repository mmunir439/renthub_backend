const path = require("path");
const express = require("express");
const cors = require("cors"); // ✅ Add this
const connectDB = require("./config/db.js");
const PORT = process.env.PORT || 8000;
const app = express();
require("dotenv").config();

connectDB();
app.use(
  cors({
    // origin: "http://localhost:3000",
    origin: process.env.FRONTEND_URL,
    credentials: true, // if using cookies/auth tokens
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
const tookonRent = require("./routes/tookonRent.js");

app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/rentitem", rentitemRoutes);
app.use("/tookonRent", tookonRent);
// ✅ Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.send("welcome to renthub portal");
});

app.listen(process.env.PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT} and data base ${process.env.MONGO_URI}`
  );
});
