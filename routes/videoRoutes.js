const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadVideo, getUserVideos, deleteVideo } = require('../controllers/videoController');

router.post('/upload', auth, uploadVideo);
router.get('/', auth, getUserVideos);
router.delete('/:id', auth, deleteVideo);

module.exports = router;
