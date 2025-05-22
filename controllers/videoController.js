const cloudinary = require('../config/cloudinary');
const Video = require('../models/Video');
const streamifier = require('streamifier');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadVideo = async (req, res) => {
  try {
    const userId = req.user.id;

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: 'screen-recordings'
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    // Read raw data into a buffer
    let data = [];
    req.on('data', chunk => data.push(chunk));
    req.on('end', async () => {
      req.file = {
        buffer: Buffer.concat(data)
      };

      const result = await streamUpload(req);

      const video = await Video.create({
        userId,
        url: result.secure_url,
        public_id: result.public_id,
        createdAt: new Date()
      });

      res.status(201).json({ video });
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};


const getUserVideos = async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch videos', err });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    //console.log(video);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    await cloudinary.uploader.destroy(video._id, {
      resource_type: 'video',
    });

    await video.deleteOne();
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', err });
  }
};


module.exports = { uploadVideo, getUserVideos, deleteVideo };
