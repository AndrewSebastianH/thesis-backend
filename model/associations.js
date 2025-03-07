const { User, SystemTask, CustomTask, UserProgress } = require("./index");

exports.taskAssociations = () => {
  // Custom tasks are assigned to users
  CustomTask.belongsTo(User, { foreignKey: "assignedBy", as: "creator" });
  CustomTask.belongsTo(User, { foreignKey: "assignedTo", as: "assignee" });

  // System tasks can be "completed" by users
  UserProgress.belongsTo(User, { foreignKey: "userId" });
  UserProgress.belongsTo(SystemTask, { foreignKey: "systemTaskId" });
};
