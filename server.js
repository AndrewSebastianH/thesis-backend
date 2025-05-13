const express = require("express");
const session = require("express-session");
const routes = require("./routes");
const cors = require("cors");
const db = require("./config/databaseConfig");
const { SECRET_KEY } = require("./constants/constants");
const app = express();
const port = 3077;

app.use(cors());
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
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
  res.send("API is runninggggg! :)");
});

// Sync in FK-safe order
const startServer = async () => {
  try {
    await db.authenticate();
    console.log("Database Connected! :)");

    await User.sync({ alter: true });
    await SystemTask.sync({ alter: true });
    await CustomTask.sync({ alter: true });
    await UserProgress.sync({ alter: true });
    await UserCustomProgress.sync({ alter: true });
    await EmotionLog.sync({ alter: true });
    await Mail.sync({ alter: true });
    await AssignedTasksPerRole.sync({ alter: true });

    console.log("All models synced!");

    // 🔥 Start server only after sync
    app.listen(port, () => {
      console.log("Server is running on port:", port);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

startServer();
