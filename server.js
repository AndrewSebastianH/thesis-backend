const express = require("express");
const session = require("express-session");
const routes = require("./routes");
const cors = require("cors");
const db = require("./config/databaseConfig");
const { SECRET_KEY } = require("./constants/constants");
const { sessionMiddleware, sessionStore } = require("./config/sessionConfig");
const app = express();
const port = 3077;

app.use(cors());
app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", routes);

// Load models and associations
const {
  User,
  CustomTask,
  SystemTask,
  UserProgress,
  UserCustomProgress,
  EmotionLog,
  Mail,
  AssignedTasksPerRole,
} = require("./model");

// Base Route
app.get("/", (req, res) => {
  res.send("API is running! :)");
});

// Sync in FK-safe order
const startServer = async () => {
  try {
    await db.authenticate();
    console.log("Database Connected! :)");

    await User.sync();
    await SystemTask.sync();
    await CustomTask.sync();
    await UserProgress.sync();
    await UserCustomProgress.sync();
    await EmotionLog.sync();
    await Mail.sync();
    await AssignedTasksPerRole.sync();

    console.log("All models synced!");

    await sessionStore.sync();

    // 🔥 Start server only after sync
    app.listen(port, () => {
      console.log(
        "Holy Shit! it fucking works!\nServer is running on port:",
        port
      );
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

startServer();
