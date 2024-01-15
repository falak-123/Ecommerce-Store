const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const router = require("./routes/authRoute");
const cors = require("cors");
const path = require("path");

dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "./client/build")));

app.use("/api/v1/auth", router);
app.use("/api/v1/category", require("./routes/categoryRoute"));
app.use("/api/v1/product", require("./routes/productRoute"));

app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

PORT = process.env.PORT;

app.listen(PORT, (req, res) => {
  console.log(`server is running on port ${PORT}`);
});
