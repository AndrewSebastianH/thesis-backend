const { User } = require("../model");
const { generateToken } = require("../middleware/jwtMiddleware");
const { validationResult } = require("express-validator");

const generateConnectionCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 characters
};

exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const connectionCode = generateConnectionCode();

    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      connectionCode,
    });

    const { salt, password, ...trimmedUser } = user.toJSON();

    const token = generateToken(user);
    return res.status(200).json({ token, trimmedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user && user.validatePassword(password)) {
      const token = generateToken(user);
      res.status(200).json({ token, user });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(201).json({ user, protected: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user data" });
  }
};

exports.chooseRole = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const { role } = req.body;
    user.role = role;
    await user.save();
    res.status(201).json({ message: "User role set", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user data" });
  }
};

exports.connectUsers = async (req, res) => {
  try {
    const { connectionCode } = req.body;
    const requestingUser = await User.findByPk(req.user.id);

    if (!requestingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const targetUser = await User.findOne({
      where: { connectionCode },
    });

    if (!targetUser) {
      return res
        .status(400)
        .json({ message: "Target user not found, check code again" });
    }

    if (requestingUser.role === targetUser.role) {
      return res
        .status(403)
        .json({ message: "This code belongs to a person with the same role." });
    }

    requestingUser.relatedUserId = targetUser.id;
    targetUser.relatedUserId = requestingUser.id;

    targetUser.connectionCode = null;
    requestingUser.connectionCode = null;

    await requestingUser.save();
    await targetUser.save();

    res.status(200).json({
      message: "Users connected successfully",
      connectedWith: targetUser.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error connecting users" });
  }
};

exports.getFullUserInformation = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const relatedUser = user.relatedUserId
      ? await User.findByPk(user.relatedUserId)
      : null;

    const response = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        connectionCode: user.connectionCode,
      },
    };

    if (relatedUser) {
      response.relatedUser = {
        id: relatedUser.id,
        username: relatedUser.username,
        email: relatedUser.email,
        role: relatedUser.role,
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user information" });
  }
};
