require("dotenv").config();
const db = require("./databaseConfig");

module.exports = {
  development: {
    username: db.config.username,
    password: db.config.password,
    database: db.config.database,
    host: db.config.host,
    dialect: db.getDialect ? db.getDialect() : "mysql",
  },
  // Optional for prod or test
  production: {
    username: db.config.username,
    password: db.config.password,
    database: db.config.database,
    host: db.config.host,
    dialect: db.getDialect ? db.getDialect() : "mysql",
  },
};
