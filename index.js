const path = require("path");
const express = require("express");
const cors = require("cors"); // ✅ Add this
const connectDB = require("./config/db.js");
const app = express();
require("dotenv").config();

connectDB();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
// Routes
const adminRoutes = require("./routes/adminRoutes.js");
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
app.get("/test", (req, res) => {
  res.send("User route working!");
});

// node web server
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});
