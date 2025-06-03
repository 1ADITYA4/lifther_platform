const Story = require('../models/Story');
const cloudinary = require('cloudinary').v2;

// GET /stories
exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /stories
exports.addStory = async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'maakagullak_stories',
        width: 400,
        height: 400,
        crop: 'fill',
      });
      imageUrl = result.secure_url;
    }
    const { name, category, date, story, userId } = req.body;
    const newStory = new Story({
      name,
      category,
      date,
      story,
      image: imageUrl,
      userId,
    });
    await newStory.save();
    res.status(201).json(newStory);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /stories/:id
exports.editStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, story } = req.body;
    let update = { name, category, story };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'maakagullak_stories',
        width: 400,
        height: 400,
        crop: 'fill',
      });
      update.image = result.secure_url;
    }
    const updated = await Story.findByIdAndUpdate(id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /stories/:id
exports.deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    await Story.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}; 