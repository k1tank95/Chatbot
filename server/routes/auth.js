const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, nickname } = req.body;
  if (!username || !password || !nickname)
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(409).json({ error: '이미 사용 중인 아이디입니다.' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const avatarColors = ['#FEE500', '#3A1D96', '#00B493', '#FF6B6B', '#4A90D9', '#FF8C42'];
  const avatar = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  db.prepare('INSERT INTO users (id, username, password, nickname, avatar) VALUES (?, ?, ?, ?, ?)').run(id, username, hashedPassword, nickname, avatar);

  const token = jwt.sign({ id, username, nickname }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id, username, nickname, avatar } });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(401).json({ error: '아이디 또는 비밀번호가 틀렸습니다.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: '아이디 또는 비밀번호가 틀렸습니다.' });

  const token = jwt.sign({ id: user.id, username: user.username, nickname: user.nickname }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar } });
});

router.get('/users/search', require('../middleware/auth').authenticateToken, (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const users = db.prepare(
    'SELECT id, username, nickname, avatar FROM users WHERE (username LIKE ? OR nickname LIKE ?) AND id != ? LIMIT 20'
  ).all(`%${q}%`, `%${q}%`, req.user.id);
  res.json(users);
});

module.exports = router;
