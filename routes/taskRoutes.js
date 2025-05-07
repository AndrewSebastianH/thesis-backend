const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const taskController = require("../controller/tasksController");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post(
  "/admin/create",
  isAuthenticated,
  [
    body("title").trim().notEmpty().withMessage("Title field is required"),
    body("description").trim(),
    body("recurrenceInterval").trim(), // Daily, Weekly, Monthly
    body("targetRole").trim(), // all, parent, child
  ],
  taskController.createSystemTask
);

router.post(
  "/user/create",
  isAuthenticated,
  [
    body("title").trim().notEmpty().withMessage("Title field is required"),
    body("description").trim(),
    body("dueDate").trim(),
    body("isRecurring").trim(), // true, false
    body("recurrenceInterval").trim(), // Daily, Weekly, Monthly
  ],
  taskController.createCustomTask
);

router.get("/user", isAuthenticated, taskController.getUserTasks);

router.patch(
  "/complete/custom/:taskId",
  isAuthenticated,
  taskController.completeCustomTask
);

router.patch(
  "/complete/system/:taskId",
  isAuthenticated,
  taskController.completeSystemTask
);

module.exports = router;
