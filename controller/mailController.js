const { Mail } = require("../model");
const { Op } = require("sequelize");
const { encryptContent, decryptContent } = require("../services/encrypter");

// Create mail
exports.sendMail = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.user.relatedUserId;
    const { message } = req.body;

    const hashedMessage = encryptContent(message);

    const mail = await Mail.create({
      senderId,
      receiverId,
      message: hashedMessage,
    });

    res.status(201).json({ message: "Mail successfully created", mail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating mail" });
  }
};

// Get received mails
exports.getReceivedMails = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const limit = parseInt(req.query.limit) || 10; // Default 10 mails per request, cek discord private for example code
    const offset = parseInt(req.query.offset) || 0; // Default start from 0

    const { count, rows: mails } = await Mail.findAndCountAll({
      where: { receiverId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({ total: count, mails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching received mails" });
  }
};

// Get sent mails
exports.getSentMails = async (req, res) => {
  try {
    const senderId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { count, rows: mails } = await Mail.findAndCountAll({
      where: { senderId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const decryptedMails = mails.map((mail) => {
      const plainMail = mail.get({ plain: true }); // Convert to plain object
      plainMail.message = decryptContent(plainMail.message); // Decrypt message
      return plainMail;
    });

    res.status(200).json({ total: count, mails: decryptedMails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sent mails" });
  }
};

// Read mail
exports.readMail = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const mailId = req.params.mailId;

    const mail = await Mail.findOne({
      where: {
        id: mailId,
        receiverId,
      },
    });

    if (!mail) {
      return res.status(404).json({ message: "Mail not found" });
    }

    mail.isRead = true;
    await mail.save();

    res.status(200).json({ message: "Mail successfully read", mail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reading mail" });
  }
};

// Delete read mail
exports.deleteMail = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const mailId = req.params.mailId;

    const mail = await Mail.findOne({
      where: {
        id: mailId,
        receiverId,
      },
    });

    if (!mail) {
      return res.status(404).json({ message: "Mail not found" });
    }

    await mail.destroy();

    res.status(200).json({ message: "Mail successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting mail" });
  }
};

// Delete all mails
exports.deleteAllMails = async (req, res) => {
  try {
    const receiverId = req.user.id;

    await Mail.destroy({
      where: {
        receiverId,
      },
    });

    res.status(200).json({ message: "All mails successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting all mails" });
  }
}; // add confirmation in FE if there are unread mails
