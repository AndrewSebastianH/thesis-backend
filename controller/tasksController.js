const {
  CustomTask,
  SystemTask,
  UserProgress,
  User,
  UserCustomProgress,
} = require("../model");
const { Op } = require("sequelize");
const moment = require("moment");

// Create System Task
exports.createSystemTask = async (req, res) => {
  try {
    const { title, description, recurrenceInterval, targetRole } = req.body;

    const task = await SystemTask.create({
      title,
      description,
      recurrenceInterval: recurrenceInterval || "daily",
      targetRole: targetRole || "all",
    });

    res.status(201).json({ message: "System task successfully created", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating system task" });
  }
};

// Create Custom Task
exports.createCustomTask = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { title, description, dueDate, isRecurring, recurrenceInterval } =
      req.body;

    // Validate mutual exclusivity between dueDate and isRecurring
    if (dueDate && isRecurring) {
      return res.status(400).json({
        message:
          "Task cannot be both recurring and have a due date. Choose one.",
      });
    }

    const task = await CustomTask.create({
      title,
      description: description || null,
      assignedBy: user.id,
      assignedTo: user.relatedUserId,
      dueDate: dueDate || null,
      isRecurring: isRecurring || false,
      recurrenceInterval: isRecurring ? recurrenceInterval || "daily" : null,
    });

    res.status(201).json({ message: "Custom task successfully created", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating custom task" });
  }
};

// Get User Tasks (both custom and system)
exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const today = moment().format("YYYY-MM-DD");
    const startOfWeek = moment().startOf("week").format("YYYY-MM-DD");
    const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");

    // Fetch all custom tasks assigned to the user
    const customTasks = await CustomTask.findAll({
      where: { assignedTo: userId },
    });

    // Fetch all system tasks
    const systemTasks = await SystemTask.findAll({
      where: {
        [Op.or]: [{ targetRole: "all" }, { targetRole: userRole }],
      },
    });

    // Fetch completed system tasks
    const completedSystemTasks = await UserProgress.findAll({
      where: {
        userId,
        completedAt: { [Op.gte]: startOfMonth },
      },
      attributes: ["systemTaskId", "completedAt"],
    });

    const completedCustomTasks = await UserCustomProgress.findAll({
      where: { userId },
      attributes: ["customTaskId", "completedAt"],
    });

    const systemTaskProgressMap = new Map();
    completedSystemTasks.forEach((progress) => {
      systemTaskProgressMap.set(progress.systemTaskId, progress.completedAt);
    });

    const customTaskProgressMap = new Map();
    completedCustomTasks.forEach((progress) => {
      customTaskProgressMap.set(progress.customTaskId, progress.completedAt);
    });

    // Attach completed status for system tasks
    const systemTasksWithStatus = systemTasks.map((task) => {
      const lastCompletedAt = systemTaskProgressMap.get(task.id);
      let completed = false;

      if (lastCompletedAt) {
        if (task.recurrenceInterval === "daily") {
          completed = moment(lastCompletedAt).isSame(today, "day");
        } else if (task.recurrenceInterval === "weekly") {
          completed = moment(lastCompletedAt).isSameOrAfter(startOfWeek);
        } else if (task.recurrenceInterval === "monthly") {
          completed = moment(lastCompletedAt).isSameOrAfter(startOfMonth);
        }
      }

      return {
        type: "system",
        ...task.toJSON(),
        completed,
      };
    });

    // Attach completed status for custom tasks
    const customTasksWithStatus = customTasks.map((task) => ({
      type: "custom",
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      assignedBy: task.assignedBy,
      isRecurring: task.isRecurring,
      recurrenceInterval: task.recurrenceInterval,
      completed: customTaskProgressMap.has(task.id), // mark as completed if any progress
    }));

    res.status(200).json({
      message: "Success fetching task data",
      customTasks: customTasksWithStatus,
      systemTasks: systemTasksWithStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching tasks" });
  }
};

// Complete Custom Task
exports.completeCustomTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await CustomTask.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.assignedTo !== userId) {
      return res
        .status(403)
        .json({ message: "You are not allowed to complete this task" });
    }

    await UserCustomProgress.create({
      userId,
      customTaskId: taskId,
      completedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    res.status(201).json({ message: "Custom task successfully completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing custom task" });
  }
};

// Complete System Task
exports.completeSystemTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await SystemTask.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is eligible for system task
    if (task.targetRole !== "all" && task.targetRole !== req.user.role) {
      return res
        .status(403)
        .json({ message: "You are not allowed to complete this task" });
    }

    const existingProgress = await UserProgress.findOne({
      where: { userId, systemTaskId: taskId },
    });

    if (existingProgress) {
      return res.status(400).json({ message: "System task already completed" });
    }

    await UserProgress.create({
      userId,
      systemTaskId: taskId,
      completedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    res.status(201).json({ message: "System task successfully completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing system task" });
  }
};
// Complete System Task
exports.completeSystemTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await SystemTask.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is eligible for system task
    if (task.targetRole !== "all" && task.targetRole !== req.user.role) {
      return res
        .status(403)
        .json({ message: "You are not allowed to complete this task" });
    }

    // Find latest completion of this task
    const latestProgress = await UserProgress.findOne({
      where: { userId, systemTaskId: taskId },
      order: [["completedAt", "DESC"]],
    });

    let alreadyCompleted = false;

    if (latestProgress) {
      const lastCompletedAt = moment(latestProgress.completedAt);
      const now = moment();

      if (task.recurrenceInterval === "daily") {
        alreadyCompleted = lastCompletedAt.isSame(now, "day");
      } else if (task.recurrenceInterval === "weekly") {
        alreadyCompleted = lastCompletedAt.isSame(now, "isoWeek"); // Week resets Monday
      } else if (task.recurrenceInterval === "monthly") {
        alreadyCompleted = lastCompletedAt.isSame(now, "month");
      }
    }

    if (alreadyCompleted) {
      return res
        .status(400)
        .json({ message: "System task already completed for this period." });
    }

    // ✅ Task is allowed to complete
    await UserProgress.create({
      userId,
      systemTaskId: taskId,
      completedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    res.status(201).json({ message: "System task successfully completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing system task" });
  }
};
