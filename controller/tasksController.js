const {
  CustomTask,
  SystemTask,
  UserProgress,
  User,
  UserCustomProgress,
  AssignedTasksPerRole,
} = require("../model");
const { Op } = require("sequelize");
const moment = require("moment");
const { decryptContent, encryptContent } = require("../services/encrypter");

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

    const {
      title,
      description,
      dueDate,
      isRecurring,
      recurrenceInterval,
      assignToSelf,
    } = req.body;

    // Validate mutual exclusivity between dueDate and isRecurring
    if (dueDate != null && isRecurring == true) {
      return res.status(400).json({
        message:
          "Task cannot be both recurring and have a due date. Choose one.",
      });
    }

    const encryptedTitle = encryptContent(title);
    const encryptedDescription = description
      ? encryptContent(description)
      : null;

    const task = await CustomTask.create({
      title: encryptedTitle,
      description: encryptedDescription || null,
      assignedBy: user.id,
      assignedTo: assignToSelf ? user.id : user.relatedUserId,
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

    const allSystemTasks = await SystemTask.findAll({
      where: {
        [Op.or]: [{ targetRole: "all" }, { targetRole: userRole }],
      },
    });

    const getAssignedTasks = async (interval, dateBase) => {
      const assignedTasks = await AssignedTasksPerRole.findAll({
        where: {
          role: userRole,
          recurrenceInterval: interval,
          assignedDate: dateBase,
        },
      });

      if (assignedTasks.length > 0) return assignedTasks;

      const availableTasks = allSystemTasks.filter(
        (t) => t.recurrenceInterval === interval
      );
      const shuffled = [...availableTasks].sort(() => 0.5 - Math.random());

      const sliceSize = interval === "daily" ? 5 : 1;
      const selected = shuffled.slice(0, sliceSize);

      await Promise.all(
        selected.map((task) =>
          AssignedTasksPerRole.create({
            role: userRole,
            systemTaskId: task.id,
            recurrenceInterval: interval,
            assignedDate: dateBase,
          })
        )
      );

      return selected.map((task) => ({
        systemTaskId: task.id,
        recurrenceInterval: interval,
        assignedDate: dateBase,
      }));
    };

    const assignedDaily = await getAssignedTasks("daily", today);
    const assignedWeekly = await getAssignedTasks("weekly", startOfWeek);
    const assignedMonthly = await getAssignedTasks("monthly", startOfMonth);

    const allAssignedTaskIds = [
      ...assignedDaily,
      ...assignedWeekly,
      ...assignedMonthly,
    ].map((a) => Number(a.systemTaskId));

    const assignedTaskMap = new Map();
    for (const a of [...assignedDaily, ...assignedWeekly, ...assignedMonthly]) {
      assignedTaskMap.set(Number(a.systemTaskId), a.recurrenceInterval);
    }

    const completedSystemTasks = await UserProgress.findAll({
      where: {
        userId,
        systemTaskId: allAssignedTaskIds,
      },
    });

    const systemTaskProgressMap = new Map();
    completedSystemTasks.forEach((p) => {
      systemTaskProgressMap.set(Number(p.systemTaskId), p.completedAt);
    });

    const isTaskCompleted = (taskId, interval) => {
      const completedAt = systemTaskProgressMap.get(Number(taskId));
      if (!completedAt) return false;

      const date = moment(completedAt);
      if (interval === "daily") return date.isSame(today, "day");
      if (interval === "weekly") return date.isSameOrAfter(startOfWeek);
      if (interval === "monthly") return date.isSameOrAfter(startOfMonth);
      return false;
    };

    const assignedSystemTasks = await Promise.all(
      allAssignedTaskIds.map(async (id) => {
        const task = await SystemTask.findByPk(id);
        const interval = assignedTaskMap.get(Number(id));
        return {
          type: "system",
          ...task.toJSON(),
          recurrenceInterval: interval,
          completed: isTaskCompleted(id, interval),
        };
      })
    );

    const systemTasksToShow = assignedSystemTasks.filter((t) => !t.completed);

    const customTasks = await CustomTask.findAll({
      where: { assignedTo: userId },
    });

    const completedCustomTasks = await UserCustomProgress.findAll({
      where: { userId },
      attributes: ["customTaskId"],
    });

    const completedCustomIds = new Set(
      completedCustomTasks.map((p) => Number(p.customTaskId))
    );

    const customTasksWithStatus = customTasks.map((task) => ({
      type: "custom",
      id: task.id,
      title: decryptContent(task.title),
      description: task.description ? decryptContent(task.description) : null,
      dueDate: task.dueDate,
      assignedBy: task.assignedBy,
      isRecurring: task.isRecurring,
      recurrenceInterval: task.recurrenceInterval,
      completed: completedCustomIds.has(Number(task.id)),
    }));

    res.status(200).json({
      message: "Success fetching task data",
      customTasks: customTasksWithStatus,
      systemTasks: systemTasksToShow,
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

    await UserProgress.create({
      userId,
      systemTaskId: taskId,
      completedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    const totalCompletions = await UserProgress.count({
      where: { userId, systemTaskId: taskId },
    });

    res.status(201).json({
      message: "System task successfully completed",
      totalCompletions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing system task" });
  }
};
