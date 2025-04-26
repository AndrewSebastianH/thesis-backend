const {
  CustomTask,
  SystemTask,
  UserCustomProgress,
  UserProgress,
  EmotionLog,
} = require("../model");

exports.fetchUserInsight = async (req, res) => {
  try {
    const type = req.query.type || "self";

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

    // Fetch task progress
    const customTaskData = await UserCustomProgress.findAll({
      where: { userId },
    });
    const systemTaskData = await UserProgress.findAll({ where: { userId } });

    // Fetch tasks metadata (id + title)
    const customTasks = await CustomTask.findAll({
      where: { assignedTo: userId },
      attributes: ["id", "title"],
    });
    const systemTasks = await SystemTask.findAll({
      attributes: ["id", "title"],
    });

    // Fetch emotion logs
    const emotionLogs = await EmotionLog.findAll({ where: { userId } });

    // --- Prepare Task Insights ---

    // Map for ID ➔ Title
    const customTaskIdToTitle = {};
    customTasks.forEach((task) => {
      customTaskIdToTitle[task.id] = task.title;
    });

    const systemTaskIdToTitle = {};
    systemTasks.forEach((task) => {
      systemTaskIdToTitle[task.id] = task.title;
    });

    // Count completions
    const customTaskCounts = {}; // { taskId: count }
    customTaskData.forEach((progress) => {
      customTaskCounts[progress.customTaskId] =
        (customTaskCounts[progress.customTaskId] || 0) + 1;
    });

    const systemTaskCounts = {}; // { taskId: count }
    systemTaskData.forEach((progress) => {
      systemTaskCounts[progress.systemTaskId] =
        (systemTaskCounts[progress.systemTaskId] || 0) + 1;
    });

    // Prepare final custom/system task lists
    const customTaskInsight = Object.entries(customTaskCounts)
      .filter(([_, count]) => count > 1)
      .map(([taskId, count]) => ({
        taskId,
        title: customTaskIdToTitle[taskId] || "Unknown Task",
        completedTimes: count,
      }))
      .sort((a, b) => b.completedTimes - a.completedTimes); // 🔥 Sort descending

    const systemTaskInsight = Object.entries(systemTaskCounts)
      .filter(([_, count]) => count > 1)
      .map(([taskId, count]) => ({
        taskId,
        title: systemTaskIdToTitle[taskId] || "Unknown Task",
        completedTimes: count,
      }))
      .sort((a, b) => b.completedTimes - a.completedTimes); // 🔥 Sort descending

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

    // --- Respond ---

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
