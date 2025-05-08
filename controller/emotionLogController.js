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
    // const relatedUserId = req.user.relatedUserId;

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const relatedUserId = user?.relatedUserId;

    const userLogs = await EmotionLog.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    let relativeLogs = [];
    let relative = null;

    if (relatedUserId) {
      relative = await User.findByPk(relatedUserId);
      if (relative) {
        relativeLogs = await EmotionLog.findAll({
          where: {
            userId: relatedUserId,
            date: {
              [Op.between]: [startDate, endDate],
            },
          },
        });
      }
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        logs: userLogs,
      },
      relative: relative
        ? {
            id: relative.id,
            username: relative.username,
            logs: relativeLogs,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching emotion logs" });
  }
};
