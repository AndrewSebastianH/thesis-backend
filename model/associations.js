const {
  User,
  SystemTask,
  CustomTask,
  AssignedTasksPerRole,
  EmotionLog,
  Mail,
  UserProgress,
  UserCustomProgress,
} = require("./index");

exports.taskAssociations = () => {
  // --- CustomTask ---
  // A CustomTask is assigned by a User (parent) and to another User (child)
  CustomTask.belongsTo(User, { foreignKey: "assignedBy", as: "creator" });
  CustomTask.belongsTo(User, { foreignKey: "assignedTo", as: "assignee" });

  // --- SystemTask ---
  // A SystemTask can be tracked by many UserProgress records
  SystemTask.hasMany(UserProgress, { foreignKey: "systemTaskId" });

  // --- UserProgress ---
  UserProgress.belongsTo(User, { foreignKey: "userId" });
  UserProgress.belongsTo(SystemTask, { foreignKey: "systemTaskId" });

  // --- UserCustomProgress ---
  // A UserCustomProgress is also related to CustomTask and User
  UserCustomProgress.belongsTo(User, { foreignKey: "userId" });
  UserCustomProgress.belongsTo(CustomTask, { foreignKey: "customTaskId" });

  // --- EmotionLog ---
  EmotionLog.belongsTo(User, { foreignKey: "userId" });

  // --- Mail ---
  Mail.belongsTo(User, { foreignKey: "senderId", as: "sender" });
  Mail.belongsTo(User, { foreignKey: "recipientId", as: "recipient" });

  // --- AssignedTaskPerRole ---
  AssignedTasksPerRole.belongsTo(SystemTask, { foreignKey: "systemTaskId" });
};
