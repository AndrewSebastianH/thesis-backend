const { DataTypes } = require("sequelize");
const sequelize = require("../config/databaseConfig");

const UserCustomProgress = sequelize.define("UserCustomProgress", {
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
  customTaskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: "CustomTasks", key: "id" },
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = UserCustomProgress;
