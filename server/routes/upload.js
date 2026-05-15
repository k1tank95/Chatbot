const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|mp4|mp3/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) return cb(null, true);
    cb(new Error('지원하지 않는 파일 형식입니다.'));
  }
});

router.post('/', authenticateToken, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE')
        return res.status(413).json({ error: '파일 크기는 50MB 이하여야 합니다.' });
      return res.status(400).json({ error: err.message || '파일 업로드 실패' });
    }
    if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });

    const fileUrl = `/uploads/${req.file.filename}`;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(req.file.originalname);

    res.json({
      url: fileUrl,
      name: req.file.originalname,
      size: req.file.size,
      type: isImage ? 'image' : 'file'
    });
  });
});

module.exports = router;
