require("dotenv").config();
const { SystemTask } = require("../model");
const db = require("../config/databaseConfig");

const taskList = [
  {
    title: "Say Good Morning!",
    description:
      "Start the day with a simple greeting to your parent or child.",
    recurrenceInterval: "daily",
    targetRole: "all",
  },
  {
    title: "Compliment Them",
    description: "Give a genuine compliment to your parent or child today.",
    recurrenceInterval: "daily",
    targetRole: "all",
  },
  {
    title: "Ask About Their Day",
    description: "Show interest in what your relative did today.",
    recurrenceInterval: "daily",
    targetRole: "all",
  },
  {
    title: "Drink Water Together",
    description:
      "Remind each other to stay hydrated by drinking water at the same time.",
    recurrenceInterval: "daily",
    targetRole: "all",
  },
  {
    title: "Watch Something Together",
    description: "Pick a short video or film and enjoy it together.",
    recurrenceInterval: "weekly",
    targetRole: "all",
  },
  {
    title: "Do a Small Chore Together",
    description:
      "Team up to do a small task like folding laundry or tidying a space.",
    recurrenceInterval: "weekly",
    targetRole: "all",
  },
  {
    title: "Share a Memory",
    description: "Recall a fun or meaningful moment you've shared.",
    recurrenceInterval: "monthly",
    targetRole: "all",
  },
  {
    title: "Create a Goal for This Month",
    description: "Set a small goal and encourage each other.",
    recurrenceInterval: "monthly",
    targetRole: "all",
  },
  {
    title: "Tell a Joke",
    description: "Lighten the mood with something funny.",
    recurrenceInterval: "daily",
    targetRole: "child",
  },
  {
    title: "Offer a Helping Hand",
    description:
      "Help your parent with a small task like washing dishes, folding clothes, etc.",
    recurrenceInterval: "daily",
    targetRole: "child",
  },
  {
    title: "Teach Something New",
    description: "Teach your child something practical or fun.",
    recurrenceInterval: "weekly",
    targetRole: "parent",
  },
  {
    title: "Say Thank You",
    description: "Appreciate something they've done, no matter how small.",
    recurrenceInterval: "monthly",
    targetRole: "all",
  },
  {
    title: "Give a Hug",
    description: "Physical affection helps build bonds.",
    recurrenceInterval: "weekly",
    targetRole: "all",
  },
  {
    title: "Ask for Help",
    description: "Let your relative assist you with something minor.",
    recurrenceInterval: "weekly",
    targetRole: "all",
  },
];

async function seedTasks() {
  try {
    await db.authenticate();
    await db.sync();

    for (const task of taskList) {
      await SystemTask.findOrCreate({
        where: { title: task.title },
        defaults: task,
      });
    }

    console.log("✅ Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedTasks();
