const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { User } = require("../model/index");

const authController = require("../controller/authController");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post(
  "/signup",
  [
    body("username").notEmpty().withMessage("Username field is required"),
    body("email")
      .trim()
      .notEmpty()
      .isEmail()
      .withMessage("Email field is not a valid email")
      .custom(async (value) => {
        const isEmailExist = await User.findOne({ where: { email: value } });
        if (isEmailExist) throw new Error("This email already has an account");
      }),
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
      .notEmpty()
      .isEmail()
      .withMessage("Email field is not a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.login
);

router.post(
  "/role",
  isAuthenticated,
  [body("role").trim().notEmpty().withMessage("Role field is required")],
  authController.chooseRole
);

router.post(
  "/connect-user",
  [
    body("connectionCode")
      .trim()
      .notEmpty()
      .withMessage("Connection code field is required"),
  ],
  isAuthenticated,
  authController.connectUsers
);

router.get(
  "/user/full-info",
  isAuthenticated,
  authController.getFullUserInformation
);

module.exports = router;
