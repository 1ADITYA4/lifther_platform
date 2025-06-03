const express = require('express');
const router = express.Router();
const multer = require('multer');
const storyController = require('../controllers/storyController');

// Multer setup (store file in /tmp, Cloudinary will handle actual storage)
const upload = multer({ dest: '/tmp' });

// GET all stories
router.get('/', storyController.getStories);

// POST new story (with image upload)
router.post('/', upload.single('image'), storyController.addStory);

// PUT edit story (with image upload)
router.put('/:id', upload.single('image'), storyController.editStory);

// DELETE story
router.delete('/:id', storyController.deleteStory);

module.exports = router; 