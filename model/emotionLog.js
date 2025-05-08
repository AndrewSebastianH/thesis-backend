const { DataTypes } = require("sequelize");
const sequelize = require("../config/databaseConfig");

const EmotionLog = sequelize.define(
  "EmotionLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE",
    },
    date: {
      type: DataTypes.DATEONLY, // (YYYY-MM-DD)
      allowNull: false,
    },
    emotion: {
      type: DataTypes.ENUM("happy", "neutral", "sad"),
      allowNull: false,
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["userId", "date"], // Ensure one entry per user per day
      },
    ],
  }
);

module.exports = EmotionLog;
