const Image = require("../models/Image");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const cacheDir = path.join(__dirname, "cache");

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

const getImage = async (req, res) => {
  try {
    const { banner } = req.params;
    const cachePath = path.join(cacheDir, `${banner}.webp`);

    if (fs.existsSync(cachePath)) {
      return res.sendFile(cachePath);
    }

    const image = await Image.findOne({ name: banner });
    if (!image) {
      return res.status(404).send("Image not found");
    }

    sharp(image.data.buffer)
      .resize({ width: 1080 })
      .webp({ quality: 85 })
      .toBuffer()
      .then((data) => {
        fs.writeFileSync(cachePath, data);
        res.contentType("image/webp");
        res.send(data);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error processing image");
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

const getAllImage = async (req, res) => {
  try {
    const images = await Image.find({});
    if (!images.length) {
      return res.status(404).send("No images found");
    }

    const imagesDataUrls = await Promise.all(
      images.map((image) =>
        sharp(image.data)
          .resize(1080)
          .webp({ quality: 35 })
          .toBuffer()
          .then((webpData) => {
            const base64Data = webpData.toString("base64");
            const dataUrl = `data:image/webp;base64,${base64Data}`;
            return {
              _id: image._id,
              name: image.name,
              dataUrl: dataUrl,
            };
          })
      )
    );

    res.status(200).json({
      success: true,
      data: imagesDataUrls,
      message: "Fetch all images successfully",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "There was an error processing the images" });
  }
};

const uploadImage = async (req, res) => {
  try {
    const { banner } = req.params;
    let image = await Image.findOne({ name: banner });
    if (!image) {
      image = new Image({ name: banner });
    }

    sharp(req.file.buffer)
      .resize(1080)
      .webp({ quality: 100 })
      .toBuffer()
      .then((webpData) => {
        image.data = webpData;
        image.contentType = "image/webp";
        return image.save();
      })
      .then(() => {
        res.json({
          success: true,
          message: "Image uploaded successfully!",
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send({ message: error.message });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  getImage,
  uploadImage,
  getAllImage,
};
