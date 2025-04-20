const { SECRET_KEY } = require("../constants/constants");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    relatedUserId: user?.relatedUserId,
    expPoints: user.expPoints,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
  return token;
};

module.exports = { generateToken };
