const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const insightController = require("../controller/insightController");
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/", isAuthenticated, insightController.getInsights);
// /insight?type=self or /insight?type=related
