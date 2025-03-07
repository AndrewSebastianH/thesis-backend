const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const taskRoutes = require("./taskRoutes");
const emotionLogRoutes = require("./emotionLogRoutes");
const mailRoutes = require("./mailRoutes");

router.use("/auth", authRoutes);
router.use("/task", taskRoutes);
router.use("/emotion-log", emotionLogRoutes);
router.use("/mail", mailRoutes);

module.exports = router;
