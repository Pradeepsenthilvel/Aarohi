const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadSong, createPlaylist, getPlaylist, getSongs, getUserPlaylists, deleteSong } = require('../controllers/musicController');
const { protect, admin } = require('../middleware/authMiddleware');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const checkFileType = (file, cb) => {
  const filetypes = /mp3|wav|audio\/mpeg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Audio files only (MP3, WAV)!');
  }
};

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

router.post('/upload', protect, admin, upload.single('audioFile'), uploadSong);
router.post('/playlists', protect, createPlaylist);
router.get('/playlists', protect, getUserPlaylists);
router.get('/playlists/:id', protect, getPlaylist);
router.get('/songs', getSongs);
router.delete('/songs/:id', protect, admin, deleteSong);

module.exports = router;
