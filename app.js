const express = require("express");
const connectDB = require("./config/db.js"); // import data base file
const app = express();
require("dotenv").config(); // for reading from env file
// Connect to MongoDB
connectDB();
//global middle ware to parse json that will run on every request
app.use(express.json());
//importing all routes here
const userRoutes = require("./routes/userRoutes.js");
const rentitemRoutes = require("./routes/rentitemRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes");
//routes
app.use("/user", userRoutes);
app.use("/rentitem", rentitemRoutes);
app.use("/bookings", bookingRoutes); // booking actions
app.get("/", (req, res) => {
  res.send("welcome to renthub portal");
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server is  runing on port:${port}`);
});
