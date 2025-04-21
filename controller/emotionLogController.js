const { EmotionLog, User } = require("../model");

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
    const relatedUserId = req.user.relatedUserId;

    const [user, relative] = await Promise.all([
      User.findByPk(userId),
      User.findByPk(relatedUserId),
    ]);

    const [userLogs, relativeLogs] = await Promise.all([
      EmotionLog.findAll({ where: { userId } }),
      EmotionLog.findAll({ where: { userId: relatedUserId } }),
    ]);

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        logs: userLogs,
      },
      relative: {
        id: relative.id,
        username: relative.username,
        logs: relativeLogs,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching emotion logs" });
  }
};
