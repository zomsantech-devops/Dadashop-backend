const { Preset } = require("../models/Setting");
const fs = require("fs");
const path = require("path");

const cacheDir = path.join("/tmp", "cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

const isValidHex = (color) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

const prepareColor = (color) => {
  color = color.toUpperCase();
  if (!isValidHex(color)) {
    return `#5A5A5A`;
  }
  return `${color}`;
};

const createPreset = async (req, res) => {
  try {
    const existingPreset = await Preset.findOne({
      preset_id: req.body.preset_id,
    });
    if (existingPreset) {
      return res
        .status(400)
        .json({ success: false, message: "Preset ID already exists." });
    }

    const listWithCorrectColors = req.body.list.map((item) => ({
      content: item.content,
      color: prepareColor(item.color),
    }));

    const buttonColors = req.body.button.color;
    const preparedButtonColors = {
      from: prepareColor(buttonColors.from),
      to: prepareColor(buttonColors.to),
      via: prepareColor(buttonColors.via),
    };

    const newPreset = new Preset({
      image: req.body.image,
      title: req.body.title,
      list: listWithCorrectColors,
      button: {
        name: req.body.button.name,
        link: req.body.button.link,
        color: preparedButtonColors,
      },
      preset_id: req.body.preset_id,
    });

    const savedPreset = await newPreset.save();

    return res.status(201).json({
      success: true,
      data: savedPreset,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePreset = async (req, res) => {
  const { id } = req.params;

  try {
    const preset = await Preset.findOne({ preset_id: id });
    if (!preset) {
      return res.status(404).json({
        success: false,
        message: "Preset not found with the given ID.",
      });
    }

    const listWithCorrectColors = req.body.list.map((item) => ({
      content: item.content,
      color: prepareColor(item.color),
    }));

    const buttonColors = req.body.button.color;
    const preparedButtonColors = {
      from: prepareColor(buttonColors.from),
      to: prepareColor(buttonColors.to),
    };
    if (buttonColors.via) {
      preparedButtonColors.via = prepareColor(buttonColors.via);
    }

    preset.image = req.body.image;
    preset.title = req.body.title;
    preset.list = listWithCorrectColors;
    preset.button = {
      name: req.body.button.name,
      link: req.body.button.link,
      color: preparedButtonColors,
    };

    console.log(preset);

    const updatedPreset = await preset.save();

    fs.writeFileSync(cachePath, JSON.stringify(updatedPreset), "utf8");

    return res.status(200).json({
      success: true,
      data: updatedPreset,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllPreset = async (req, res) => {
  try {
    const presets = await Preset.find({});
    if (!presets) {
      return res
        .status(400)
        .json({ success: false, message: "Can't find any preset" });
    }
    return res.status(200).json({
      success: true,
      data: presets,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getPresetById = async (req, res) => {
  try {
    const { id } = req.params;
    const cachePath = path.join(cacheDir, `preset-${id}.json`);

    if (fs.existsSync(cachePath)) {
      const cacheData = fs.readFileSync(cachePath, "utf8");
      return res
        .status(200)
        .json({ success: true, data: JSON.parse(cacheData), source: "cache" });
    }

    const preset = await Preset.findOne({ preset_id: id });

    if (!preset) {
      return res.status(404).json({
        success: false,
        message: "Preset not found with the given ID.",
      });
    }

    fs.writeFileSync(cachePath, JSON.stringify(preset), "utf8");

    return res.status(200).json({
      success: true,
      data: preset,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deletePreset = async (req, res) => {
  const { id } = req.params;

  const preset = await Preset.findOne({ preset_id: id });
  if (!preset) {
    return res.status(404).json({
      success: false,
      message: "Preset not found",
    });
  }

  const filePath = path.join(cacheDir, `preset-${id}.json`);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await Preset.deleteOne({ preset_id: id });

  return res
    .status(200)
    .json({ success: true, message: "Preset deleted successfully" });
};

module.exports = {
  createPreset,
  updatePreset,
  getAllPreset,
  getPresetById,
  deletePreset,
};
