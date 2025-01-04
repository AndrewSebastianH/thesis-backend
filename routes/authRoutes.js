const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const authController = require("../controller/authController");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post(
  "/signup",
  [
    body("username").required().withMessage("Username field is required"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Email field is not a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.signup
);
router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Email field is not a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.login
);

module.exports = router;
