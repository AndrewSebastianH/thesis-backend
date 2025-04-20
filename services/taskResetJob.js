const cron = require("node-cron");
const { UserProgress, SystemTask } = require("../model");
const { Op } = require("sequelize");
const moment = require("moment");

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Checking for tasks to reset...");

  try {
    const today = moment().format("YYYY-MM-DD");
    const startOfWeek = moment().startOf("week").format("YYYY-MM-DD");
    const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");

    // Find all weekly tasks
    const weeklyTasks = await SystemTask.findAll({
      where: { recurrenceInterval: "weekly" },
    });

    // Find all monthly tasks
    const monthlyTasks = await SystemTask.findAll({
      where: { recurrenceInterval: "monthly" },
    });

    // Reset weekly tasks if a new week has started
    if (moment().day() === 0) {
      // sunday
      const weeklyTaskIds = weeklyTasks.map((task) => task.id);
      await UserProgress.destroy({
        where: {
          systemTaskId: { [Op.in]: weeklyTaskIds },
          date: { [Op.lt]: startOfWeek }, // Delete progress before this week
        },
      });
      console.log("Weekly tasks reset.");
    }

    // Reset monthly tasks if a new month has started
    if (moment().date() === 1) {
      // First day of the month
      const monthlyTaskIds = monthlyTasks.map((task) => task.id);
      await UserProgress.destroy({
        where: {
          systemTaskId: { [Op.in]: monthlyTaskIds },
          date: { [Op.lt]: startOfMonth }, // Delete progress before this month
        },
      });
      console.log("Monthly tasks reset.");
    }
  } catch (error) {
    console.error("Error resetting tasks:", error);
  }
});

module.exports = cron;
