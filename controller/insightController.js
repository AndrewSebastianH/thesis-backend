const {
  CustomTask,
  SystemTask,
  UserCustomProgress,
  UserProgress,
  EmotionLog,
} = require("../model");

const { Op } = require("sequelize");
const moment = require("moment");

exports.fetchUserInsight = async (req, res) => {
  try {
    const type = req.query.type || "self";
    const range = req.query.range || "month";

    let startDate;
    if (range === "week") {
      startDate = moment().subtract(7, "days").toDate();
    } else if (range === "2weeks") {
      startDate = moment().subtract(14, "days").toDate();
    } else {
      startDate = moment().subtract(30, "days").toDate();
    }

    console.log("getting data for range:", range);

    let userId;
    if (type === "self") {
      userId = req.user.id;
    } else if (type === "related") {
      userId = req.user.relatedUserId;
      if (!userId) {
        return res.status(400).json({ message: "No related user connected." });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Invalid type. Use 'self' or 'related'." });
    }

    const customTaskData = await UserCustomProgress.findAll({
      where: {
        userId,
        createdAt: { [Op.gte]: startDate },
      },
    });

    const systemTaskData = await UserProgress.findAll({
      where: {
        userId,
        createdAt: { [Op.gte]: startDate },
      },
    });

    const emotionLogs = await EmotionLog.findAll({
      where: {
        userId,
        date: { [Op.gte]: startDate },
      },
    });

    // Fetch tasks metadata
    const customTasks = await CustomTask.findAll({
      where: { assignedTo: userId },
      attributes: ["id", "title"],
    });
    const systemTasks = await SystemTask.findAll({
      attributes: ["id", "title"],
    });

    // --- Prepare Task Insights ---

    // ID ➔ Title maps
    const customTaskIdToTitle = {};
    customTasks.forEach((task) => {
      customTaskIdToTitle[Number(task.id)] = task.title;
    });

    const systemTaskIdToTitle = {};
    systemTasks.forEach((task) => {
      systemTaskIdToTitle[Number(task.id)] = task.title;
    });

    // Count completions
    const customTaskCounts = {};
    customTaskData.forEach((progress) => {
      const id = Number(progress.customTaskId);
      customTaskCounts[id] = (customTaskCounts[id] || 0) + 1;
    });

    const systemTaskCounts = {};
    systemTaskData.forEach((progress) => {
      const id = Number(progress.systemTaskId);
      systemTaskCounts[id] = (systemTaskCounts[id] || 0) + 1;
    });

    // Prepare final insights
    const customTaskInsight = Object.entries(customTaskCounts)
      .filter(([_, count]) => count > 1)
      .map(([taskId, count]) => ({
        taskId: Number(taskId),
        title: customTaskIdToTitle[Number(taskId)] || "Unknown Task",
        completedTimes: count,
      }))
      .sort((a, b) => b.completedTimes - a.completedTimes);

    const systemTaskInsight = Object.entries(systemTaskCounts)
      .filter(([_, count]) => count > 1)
      .map(([taskId, count]) => ({
        taskId: Number(taskId),
        title: systemTaskIdToTitle[Number(taskId)] || "Unknown Task",
        completedTimes: count,
      }))
      .sort((a, b) => b.completedTimes - a.completedTimes);

    // --- Prepare Emotion Insights ---

    const emotionCounts = { happy: 0, neutral: 0, sad: 0 };
    emotionLogs.forEach((log) => {
      emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
    });

    const mostCommonEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    const lastEmotionDate =
      emotionLogs.length > 0
        ? emotionLogs.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
            .date
        : null;

    // console.log("Custom Task Insight:", customTaskInsight);
    // console.log("System Task Insight:", systemTaskInsight);
    // console.log("Emotion Counts:", emotionCounts);
    // console.log("Most Common Emotion:", mostCommonEmotion);
    // console.log("Last Emotion Date:", lastEmotionDate);

    res.status(200).json({
      tasks: {
        custom: customTaskInsight,
        system: systemTaskInsight,
      },
      emotions: {
        ...emotionCounts,
        mostCommonEmotion,
        lastEmotionDate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user insights" });
  }
};
