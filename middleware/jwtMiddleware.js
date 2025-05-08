const { SECRET_KEY } = require("../constants/constants");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (user) => {
  const payload = {
    id: user.id,
    role: user?.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
  return token;
};

module.exports = { generateToken };
