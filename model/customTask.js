const { DataTypes } = require("sequelize");
const sequelize = require("../config/databaseConfig");

const CustomTask = sequelize.define("CustomTask", {
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
  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "Users", key: "id" },
    onDelete: "SET NULL",
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
    onDelete: "CASCADE",
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurrenceInterval: {
    type: DataTypes.ENUM("daily", "weekly", "monthly"),
    allowNull: true, // only used if isRecurring = true
  },
});

module.exports = CustomTask;
