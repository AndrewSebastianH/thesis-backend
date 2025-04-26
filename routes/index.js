const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const taskRoutes = require("./taskRoutes");
const emotionLogRoutes = require("./emotionLogRoutes");
const mailRoutes = require("./mailRoutes");
const insightRoutes = require("./insightRoutes");

router.use("/auth", authRoutes);
router.use("/task", taskRoutes);
router.use("/emotion-log", emotionLogRoutes);
router.use("/mail", mailRoutes);
router.use("/insight", insightRoutes);

module.exports = router;
