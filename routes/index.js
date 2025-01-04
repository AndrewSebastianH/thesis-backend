const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");

router.use("/auth", pageRoutes);

module.exports = router;
