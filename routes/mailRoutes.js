const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const mailController = require("../controller/mailController");
const isAuthenticated = require("../middleware/isAuthenticated");

// Send mail
router.post(
  "/",
  isAuthenticated,
  [
    body("receiverId")
      .trim()
      .notEmpty()
      .withMessage("Receiver ID field is required"),
    body("message").trim().notEmpty().withMessage("Message field is required"),
  ],
  mailController.sendMail
);

// Get received mails
router.get("/received", isAuthenticated, mailController.getReceivedMails); // Example frontend: GET /received?page=1&limit=10, example fe code in discord

// Get sent mails
router.get("/sent", isAuthenticated, mailController.getSentMails); // Example frontend: GET /sent?page=2&limit=5

// Read mail
router.patch("/:mailId/read", isAuthenticated, mailController.readMail);

// Delete read mail
router.delete("/:mailId", isAuthenticated, mailController.deleteMail);

// Delete all read mails
router.delete("/all", isAuthenticated, mailController.deleteAllMails);

module.exports = router;
