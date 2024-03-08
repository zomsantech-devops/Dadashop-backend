const Content = require("../models/Content");
const fs = require("fs");
const path = require("path");

const cacheDir = path.join("/tmp", "cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

// const getTitle = async (req, res) => {
//   try {
//     const existingContent = await Content.findOne({ name: "title" });
//     if (!existingContent) {
//       return res.status(400).json({
//         success: false,
//         message: "Content not found",
//       });
//     }
//     return res.status(200).send(existingContent.content);
//   } catch (error) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

const updateContent = async (req, res) => {
  try {
    const { name } = req.params;
    const { content } = req.body;
    const cachePath = path.join(cacheDir, `content-${name}.json`);

    if (!name || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Input can't be empty" });
    }

    const existingContent = await Content.findOne({ name: name });
    if (existingContent) {
      existingContent.content = content;
      await existingContent.save();

      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }
      fs.writeFileSync(cachePath, JSON.stringify(existingContent), "utf8");
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

    res.status(200).json({
      success: true,
      data: newContent,
      message: "Create new content successfully",
    });

    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
    }
    fs.writeFileSync(cachePath, JSON.stringify(newContent), "utf8");
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getContent = async (req, res) => {
  try {
    const { name } = req.params;
    const cachePath = path.join(cacheDir, `content-${name}.json`);

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Input can't be empty" });
    }

    if (fs.existsSync(cachePath)) {
      const cacheData = fs.readFileSync(cachePath, "utf8");
      const contentData = JSON.parse(cacheData);

      return res
        .status(200)
        .json({ success: true, data: contentData, source: "cache" });
    }

    const existingContent = await Content.findOne({ name: name });
    if (!existingContent) {
      return res.status(400).json({
        success: false,
        message: "Content not found",
      });
    }

    res.status(200).json({
      success: true,
      data: existingContent,
    });
    fs.writeFileSync(cachePath, JSON.stringify(existingContent), "utf8");
    return;
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteContent = async (req, res) => {
  try {
    const { name } = req.params;
    const cachePath = path.join(cacheDir, `content-${name}.json`);

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
