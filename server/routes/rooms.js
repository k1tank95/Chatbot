const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  const rooms = db.prepare(`
    SELECT r.id, r.name, r.type, r.created_at,
      (SELECT content FROM messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT type FROM messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message_type,
      (SELECT created_at FROM messages WHERE room_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
      (SELECT COUNT(*) FROM messages m WHERE m.room_id = r.id AND m.created_at > COALESCE((SELECT last_read_at FROM room_members WHERE room_id = r.id AND user_id = ?), '1970-01-01')) as unread_count,
      (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as member_count
    FROM rooms r
    INNER JOIN room_members rm ON r.id = rm.room_id
    WHERE rm.user_id = ?
    ORDER BY COALESCE(last_message_at, r.created_at) DESC
  `).all(req.user.id, req.user.id);

  const roomsWithMembers = rooms.map(room => {
    const members = db.prepare(`
      SELECT u.id, u.nickname, u.avatar FROM users u
      INNER JOIN room_members rm ON u.id = rm.user_id
      WHERE rm.room_id = ?
    `).all(room.id);
    return { ...room, members };
  });

  res.json(roomsWithMembers);
});

router.post('/', (req, res) => {
  const { name, type, memberIds } = req.body;
  if (!memberIds || memberIds.length === 0)
    return res.status(400).json({ error: '대화 상대를 선택해주세요.' });

  const allMembers = [req.user.id, ...memberIds.filter(id => id !== req.user.id)];

  if (type === 'direct' && allMembers.length === 2) {
    const existing = db.prepare(`
      SELECT r.id FROM rooms r
      WHERE r.type = 'direct'
      AND (SELECT COUNT(*) FROM room_members WHERE room_id = r.id AND user_id = ?) = 1
      AND (SELECT COUNT(*) FROM room_members WHERE room_id = r.id AND user_id = ?) = 1
      AND (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) = 2
    `).get(allMembers[0], allMembers[1]);

    if (existing) {
      const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(existing.id);
      const members = db.prepare(`
        SELECT u.id, u.nickname, u.avatar FROM users u
        INNER JOIN room_members rm ON u.id = rm.user_id WHERE rm.room_id = ?
      `).all(existing.id);
      return res.json({ ...room, members });
    }
  }

  const id = uuidv4();
  const roomName = name || null;
  db.prepare('INSERT INTO rooms (id, name, type, created_by) VALUES (?, ?, ?, ?)').run(id, roomName, type || 'direct', req.user.id);

  const insertMember = db.prepare('INSERT INTO room_members (room_id, user_id) VALUES (?, ?)');
  allMembers.forEach(userId => insertMember.run(id, userId));

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  const members = db.prepare(`
    SELECT u.id, u.nickname, u.avatar FROM users u
    INNER JOIN room_members rm ON u.id = rm.user_id WHERE rm.room_id = ?
  `).all(id);

  res.json({ ...room, members });
});

router.get('/:id/messages', (req, res) => {
  const member = db.prepare('SELECT * FROM room_members WHERE room_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!member) return res.status(403).json({ error: '접근 권한이 없습니다.' });

  const { before, limit = 50 } = req.query;
  let messages;
  if (before) {
    messages = db.prepare(`
      SELECT m.*, u.nickname as sender_nickname, u.avatar as sender_avatar
      FROM messages m INNER JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ? AND m.created_at < ?
      ORDER BY m.created_at DESC LIMIT ?
    `).all(req.params.id, before, parseInt(limit));
  } else {
    messages = db.prepare(`
      SELECT m.*, u.nickname as sender_nickname, u.avatar as sender_avatar
      FROM messages m INNER JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC LIMIT ?
    `).all(req.params.id, parseInt(limit));
  }

  db.prepare('UPDATE room_members SET last_read_at = CURRENT_TIMESTAMP WHERE room_id = ? AND user_id = ?').run(req.params.id, req.user.id);

  res.json(messages.reverse());
});

router.put('/:id/read', (req, res) => {
  db.prepare('UPDATE room_members SET last_read_at = CURRENT_TIMESTAMP WHERE room_id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

router.get('/:id/members', (req, res) => {
  const member = db.prepare('SELECT * FROM room_members WHERE room_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!member) return res.status(403).json({ error: '접근 권한이 없습니다.' });

  const members = db.prepare(`
    SELECT u.id, u.nickname, u.avatar, u.status FROM users u
    INNER JOIN room_members rm ON u.id = rm.user_id WHERE rm.room_id = ?
  `).all(req.params.id);
  res.json(members);
});

router.post('/:id/members', (req, res) => {
  const { userIds } = req.body;
  if (!userIds || userIds.length === 0) return res.status(400).json({ error: '추가할 사용자를 선택해주세요.' });

  const member = db.prepare('SELECT * FROM room_members WHERE room_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!member) return res.status(403).json({ error: '접근 권한이 없습니다.' });

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (room.type === 'direct') {
    db.prepare('UPDATE rooms SET type = ? WHERE id = ?').run('group', req.params.id);
  }

  const insertMember = db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)');
  userIds.forEach(userId => insertMember.run(req.params.id, userId));

  res.json({ success: true });
});

module.exports = router;
