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
      location: req.body.location,
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
  const cachePath = path.join(cacheDir, `preset-${id}.json`);
  const cachePathAll = path.join(cacheDir, `preset.json`);

  try {
    const preset = await Preset.findOne({ preset_id: id });
    if (!preset) {
      return res.status(404).json({
        success: false,
        message: "Preset not found with the given ID.",
      });
    }

    const validLocations = ["price-fortnite", "price-other"];
    const location = req.body.location;
    if (location !== null && !validLocations.includes(location)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid location value. Must be 'price-fortnite' or 'price-other'.",
      });
    }

    preset.location = location !== null ? location : preset.location;
    preset.image = req.body.image !== null ? req.body.image : preset.image;
    preset.title = req.body.title !== null ? req.body.title : preset.title;
    preset.preset_id =
      req.body.preset_id !== null ? req.body.preset_id : preset.preset_id;

    if (req.body.list !== null) {
      const listWithCorrectColors = req.body.list.map((item) => ({
        content: item.content,
        color: prepareColor(item.color),
      }));
      preset.list = listWithCorrectColors;
    }

    if (req.body.button !== null) {
      const buttonColors = req.body.button.color;
      const preparedButtonColors = {
        from: buttonColors.from
          ? prepareColor(buttonColors.from)
          : preset.button.color.from,
        to: buttonColors.to
          ? prepareColor(buttonColors.to)
          : preset.button.color.to,
      };
      if (buttonColors.via) {
        preparedButtonColors.via = prepareColor(buttonColors.via);
      }
      preset.button = {
        name:
          req.body.button.name !== null
            ? req.body.button.name
            : preset.button.name,
        link:
          req.body.button.link !== null
            ? req.body.button.link
            : preset.button.link,
        color: preparedButtonColors,
      };
    }

    const updatedPreset = await preset.save();

    res.status(200).json({
      success: true,
      data: updatedPreset,
    });

    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
      fs.unlinkSync(cachePathAll);
    }

    if (updatePreset.preset_id) {
      const newCachePath = updatePreset.preset_id;
      fs.writeFileSync(newCachePath, JSON.stringify(updatedPreset), "utf8");
    } else {
      fs.writeFileSync(cachePath, JSON.stringify(updatedPreset), "utf8");
    }
    return;
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllPreset = async (req, res) => {
  try {
    const cachePath = path.join(cacheDir, `preset.json`);

    if (fs.existsSync(cachePath)) {
      const cacheData = fs.readFileSync(cachePath, "utf8");
      res
        .status(200)
        .json({ success: true, data: JSON.parse(cacheData), source: "cache" });
      const presets = await Preset.find({});
      if (presets) {
        fs.unlinkSync(cachePath);
        fs.writeFileSync(cachePath, JSON.stringify(presets), "utf8");
      }
      return;
    }

    const presets = await Preset.find({});
    if (!presets) {
      return res
        .status(400)
        .json({ success: false, message: "Can't find any preset" });
    }
    res.status(200).json({
      success: true,
      data: presets,
    });
    fs.writeFileSync(cachePath, JSON.stringify(presets), "utf8");
    return;
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

    res.status(200).json({
      success: true,
      data: preset,
    });

    fs.writeFileSync(cachePath, JSON.stringify(preset), "utf8");
    return;
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deletePreset = async (req, res) => {
  const { id } = req.params;
  const cachePath = path.join(cacheDir, `preset-${id}.json`);
  const cachePathAll = path.join(cacheDir, `preset.json`);

  const preset = await Preset.findOne({ preset_id: id });
  if (!preset) {
    return res.status(404).json({
      success: false,
      message: "Preset not found",
    });
  }

  await Preset.deleteOne({ preset_id: id });

  res
    .status(200)
    .json({ success: true, message: "Preset deleted successfully" });

  if (fs.existsSync(cachePath)) {
    fs.unlinkSync(cachePath);
    fs.unlinkSync(cachePathAll);
  }
  return;
};

module.exports = {
  createPreset,
  updatePreset,
  getAllPreset,
  getPresetById,
  deletePreset,
};
