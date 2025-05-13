// config/sessionConfig.js
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const db = require("./databaseConfig");
const { SECRET_KEY } = require("../constants/constants");

const sessionStore = new SequelizeStore({
  db,
  tableName: "Sessions",
  checkExpirationInterval: 15 * 60 * 1000, // 15 minutes
  expiration: 7 * 24 * 60 * 60 * 1000, // 7 days
});

const sessionMiddleware = session({
  secret: SECRET_KEY,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});

module.exports = {
  sessionMiddleware,
  sessionStore,
};
