const { Sequelize } = require("sequelize");
require("dotenv").config();

const database = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    dialect: "mysql",
    port: process.env.MYSQLPORT,
    logging: false,
  }
);

module.exports = database;
