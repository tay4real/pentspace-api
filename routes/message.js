const router = require("express").Router();
const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

const { authorize } = require("../middlewares/auth");

router.post("/", authorize, async (req, res, next) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    // res.json(message);
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    // res.status(400);
    // throw new Error(error.message);
    res.status(400).json({ error: true, message: error.message });
  }
});

router.get("/:chatId", authorize, async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    // res.status(400);
    // throw new Error(error.message);
    res.status(400).json({ error: true, message: error.message });
  }
});

module.exports = router;
