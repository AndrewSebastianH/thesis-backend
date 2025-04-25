const { CustomTask, SystemTask, UserProgress, User } = require("../model");
const { Op } = require("sequelize");
const moment = require("moment");

// Create System Tasks
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
    res.status(500).json({ message: "Error creating task" });
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

    const task = await CustomTask.create({
      title,
      description: description || null,
      assignedBy: user.id,
      assignedTo: user.relatedUserId,
      dueDate: dueDate || null,
      isRecurring: isRecurring || false,
      recurrenceInterval: recurrenceInterval || null,
    });
    res.status(201).json({ message: "Custom task successfully created", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating task" });
  }
};

// Get user tasks (both custom and system)
exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const today = moment().format("YYYY-MM-DD");
    const startOfWeek = moment().startOf("week").format("YYYY-MM-DD");
    const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");

    // Fetch all custom tasks assigned to the user
    const customTasks = await CustomTask.findAll({
      where: {
        assignedTo: userId,
      },
    });

    // Fetch all system tasks
    const systemTasks = await SystemTask.findAll({
      where: {
        targetRole: userRole || "all",
      },
    });

    // Fetch completed system tasks for today, this week, and this month
    const completedTasks = await UserProgress.findAll({
      where: {
        userId: userId,
        completedAt: {
          [Op.gte]: startOfMonth, // Fetch all completed tasks in the current month
        },
      },
      attributes: ["systemTaskId", "date"],
    });

    const completedTaskMap = new Map();
    completedTasks.forEach((task) => {
      completedTaskMap.set(task.systemTaskId, task.date);
    });

    // Attach "completed" status based on recurrence interval
    const systemTasksWithStatus = systemTasks.map((task) => {
      const lastCompletedDate = completedTaskMap.get(task.id);
      let completed = false;

      if (lastCompletedDate) {
        if (task.recurrenceInterval === "daily") {
          completed = lastCompletedDate === today;
        } else if (task.recurrenceInterval === "weekly") {
          completed = moment(lastCompletedDate).isSameOrAfter(startOfWeek);
        } else if (task.recurrenceInterval === "monthly") {
          completed = moment(lastCompletedDate).isSameOrAfter(startOfMonth);
        }
      }

      // System tasks Output
      return {
        type: "system",
        ...task.toJSON(),
        completed,
      };
    });

    // Custom tasks map
    const customTasksWithStatus = customTasks.map((task) => ({
      type: "custom",
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      assignedBy: task.assignedBy,
      recurrenceInterval: task.recurrenceInterval,
      completed: task.isCompleted,
    }));

    res.status(201).json({
      message: "success fetching task data",
      customTasks: customTasksWithStatus,
      systemTasks: systemTasksWithStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

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

    task.isCompleted = true;
    await task.save();

    res.status(200).json({ message: "Task successfully completed", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing task" });
  }
};

exports.completeSystemTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await SystemTask.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is eligible for this system task
    if (task.targetRole !== "all" && task.targetRole !== req.user.role) {
      return res
        .status(403)
        .json({ message: "You are not allowed to complete this task" });
    }

    // Ensure the task is not already completed by the user
    const existingEntry = await UserProgress.findOne({
      where: { userId, systemTaskId: taskId },
    });

    if (existingEntry) {
      return res.status(400).json({ message: "Task already completed" });
    }

    // Mark task as completed  in UserProgress
    await UserProgress.create({
      userId,
      systemTaskId: taskId,
      completedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    res.status(201).json({ message: "System task successfully completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing task" });
  }
};
