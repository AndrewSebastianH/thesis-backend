const { DataTypes } = require("sequelize");
const sequelize = require("../config/databaseConfig");

const Mail = sequelize.define("Mail", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
    onDelete: "CASCADE",
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
    onDelete: "CASCADE",
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "No Subject",
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isReceiverDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isSenderDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },

  //   mailDesignId: {
  //     type: DataTypes.INTEGER,
  //     allowNull: false,
  //   },
});

module.exports = Mail;
