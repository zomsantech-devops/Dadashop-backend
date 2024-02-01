const imageSchema = new mongoose.Schema({
  sku: String,
  filename: String,
  path: String,
  uploadedAt: Date,
});
module.exports = mongoose.model("Image", imageSchema);
