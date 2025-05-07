const { DataTypes } = require("sequelize");
const sequelize = require("../config/databaseConfig");

const SystemTask = sequelize.define("SystemTask", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recurrenceInterval: {
    type: DataTypes.ENUM("daily", "weekly", "monthly"),
    allowNull: false,
  },
  targetRole: {
    type: DataTypes.ENUM("parent", "child", "all"),
    defaultValue: "all",
    allowNull: false,
  },
});

module.exports = SystemTask;
