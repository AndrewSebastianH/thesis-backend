const { DataTypes } = require("sequelize");
const sequelize = require("../config/databaseConfig");

const AssignedTasksPerRole = sequelize.define("AssignedTasksPerRole", {
  role: {
    type: DataTypes.ENUM("parent", "child"),
    allowNull: false,
  },
  systemTaskId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  recurrenceInterval: {
    type: DataTypes.ENUM("daily", "weekly", "monthly"),
    allowNull: false,
  },
  assignedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

module.exports = AssignedTasksPerRole;
