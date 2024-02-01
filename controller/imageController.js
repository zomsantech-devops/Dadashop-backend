const Image = require("../models/Image");

const getImage = async (req, res) => {
  try {
    const { banner } = req.params;
    const image = await Image.findOne({ name: banner });
    if (!image) {
      return res.status(404).send("Image not found");
    }
    const imgBase64 = image.data;
    console.log(image.contentType);
    res.status(200).json({
      success: true,
      contentType: image.contentType,
      imageUrl: `data:${image.contentType};base64,${imgBase64}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("This is error happening");
  }
};

const uploadImage = async (req, res) => {
  try {
    const { banner } = req.params;
    let image = await Image.findOne({ name: banner });
    if (!image) {
      image = new Image({ name: banner });
    }
    // const imgBase64 = req.file.buffer.toString("base64");
    image.data = req.file.buffer;
    image.contentType = req.file.mimetype;
    await image.save();
    res.json({
      success: true,
      message: "Image uploaded successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("This is error happening");
  }
};

module.exports = {
  getImage,
  uploadImage,
};
