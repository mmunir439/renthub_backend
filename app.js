const express = require("express");
const connectDB = require("./config/db.js"); // import data base file
const app = express();
require("dotenv").config(); // for reading from env file
// Connect to MongoDB
connectDB();
// middle ware to parse json
app.use(express.json());
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server is  runing on port:${port}`);
});
