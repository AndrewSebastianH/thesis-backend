const { DataTypes } = require("sequelize");
const sequelize = require("../config/databaseConfig");

const UserProgress = sequelize.define("UserProgress", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
  systemTaskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: "SystemTasks", key: "id" },
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = UserProgress;
