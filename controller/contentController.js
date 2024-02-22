const Content = require("../models/Content");

const updateContent = async (req, res) => {
  try {
    const { name } = req.params;
    const { content } = req.body;
    if (!name || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Input can't be empty" });
    }

    const existingContent = await Content.findOne({ name: name });
    if (existingContent) {
      existingContent.content = content;
      await existingContent.save();

      return res.status(200).json({
        success: true,
        data: existingContent,
        message: "Update existing content successfully",
      });
    }

    const newContent = new Content({
      name,
      content,
    });

    await newContent.save();

    return res.status(200).json({
      success: true,
      data: newContent,
      message: "Create new content successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getContent = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Input can't be empty" });
    }

    const existingContent = await Content.findOne({ name: name });
    if (!existingContent) {
      return res.status(400).json({
        success: false,
        message: "Content not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: existingContent,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  updateContent,
  getContent,
};
