const { EmotionLog } = require("../model");
const { Op } = require("sequelize");

// Create log entry
exports.createEmotionLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, emotion, detail } = req.body;

    const log = await EmotionLog.create({
      userId,
      date,
      emotion,
      detail: detail || null,
    });

    res.status(201).json({ message: "Emotion log successfully created", log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating emotion log" });
  }
};

// Get log entries
exports.getEmotionLogs = async (req, res) => {
  try {
    const userId = req.user.id;

    const logs = await EmotionLog.findAll({
      where: {
        userId,
      },
    });

    res.status(200).json({ logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching emotion logs" });
  }
};
