const Content = require("../models/Content");
const fs = require("fs");
const path = require("path");

const cacheDir = path.join("/tmp", "cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

const updateContent = async (req, res) => {
  try {
    const { name } = req.params;
    const { content } = req.body;
    const cachePath = path.join(cacheDir, `content-${id}.json`);

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

    fs.writeFileSync(cachePath, JSON.stringify(newContent), "utf8");

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
    const cachePath = path.join(cacheDir, `content-${id}.json`);

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Input can't be empty" });
    }

    if (fs.existsSync(cachePath)) {
      const cacheData = fs.readFileSync(cachePath, "utf8");
      return res
        .status(200)
        .json({ success: true, data: JSON.parse(cacheData), source: "cache" });
    }

    const existingContent = await Content.findOne({ name: name });
    if (!existingContent) {
      return res.status(400).json({
        success: false,
        message: "Content not found",
      });
    }

    fs.writeFileSync(cachePath, JSON.stringify(existingContent), "utf8");

    return res.status(200).json({
      success: true,
      data: existingContent,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteContent = async (req, res) => {
  try {
    const { name } = req.params;
    const cachePath = path.join(cacheDir, `content-${id}.json`);

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

    await Content.deleteOne({ name: name });

    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
    }

    return res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllContent = async (req, res) => {
  try {
    const existingContent = await Content.find({});
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
  getAllContent,
  deleteContent,
};
