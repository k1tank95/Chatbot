const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 * 1024; // 기본 5GB

const BLOCKED_EXTENSIONS = /\.(exe|bat|cmd|com|scr|msi|dll|sh|app|deb|rpm)$/i;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (BLOCKED_EXTENSIONS.test(file.originalname))
      return cb(new Error('보안상 실행 파일은 업로드할 수 없습니다.'));
    cb(null, true);
  }
});

router.post('/', authenticateToken, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const limitGB = (MAX_FILE_SIZE / 1024 / 1024 / 1024).toFixed(1);
        return res.status(413).json({ error: `파일 크기는 ${limitGB}GB 이하여야 합니다.` });
      }
      return res.status(400).json({ error: err.message || '파일 업로드 실패' });
    }
    if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });

    const fileUrl = `/uploads/${req.file.filename}`;
    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i.test(req.file.originalname);
    const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(req.file.originalname);
    const isAudio = /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(req.file.originalname);

    let type = 'file';
    if (isImage) type = 'image';
    else if (isVideo) type = 'video';
    else if (isAudio) type = 'audio';

    res.json({
      url: fileUrl,
      name: req.file.originalname,
      size: req.file.size,
      type,
      mime: req.file.mimetype
    });
  });
});

router.get('/limits', authenticateToken, (req, res) => {
  res.json({ maxFileSize: MAX_FILE_SIZE });
});

module.exports = router;
