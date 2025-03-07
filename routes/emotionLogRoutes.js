const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const emotionLogController = require("../controller/emotionLogController");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post(
  "/",
  isAuthenticated,
  [
    body("date").trim().notEmpty().withMessage("Date field is required"),
    body("emotion")
      .trim()
      .notEmpty()
      .withMessage("Emotion field is required")
      .isIn(["happy", "neutral", "sad"])
      .withMessage("Invalid emotion"),
    body("detail").trim(),
  ],
  emotionLogController.createEmotionLog
);

router.get("/", isAuthenticated, emotionLogController.getEmotionLogs);

module.exports = router;
