require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');
const { JWT_SECRET } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// /uploads — Range 요청 지원 (비디오 스트리밍/대용량 파일 부분 다운로드)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  acceptRanges: true,
  setHeaders: (res) => {
    res.setHeader('Accept-Ranges', 'bytes');
  }
}));

// 서버 타임아웃: 대용량 업로드 도중 끊기지 않도록 30분
server.timeout = 30 * 60 * 1000;
server.keepAliveTimeout = 30 * 60 * 1000;
server.headersTimeout = 30 * 60 * 1000;

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/upload', require('./routes/upload'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));
}

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('인증 필요'));
  try {
    const user = jwt.verify(token, JWT_SECRET);
    socket.user = user;
    next();
  } catch {
    next(new Error('유효하지 않은 토큰'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  onlineUsers.set(userId, socket.id);
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run('online', userId);
  io.emit('user_status', { userId, status: 'online' });

  const userRooms = db.prepare('SELECT room_id FROM room_members WHERE user_id = ?').all(userId);
  userRooms.forEach(({ room_id }) => socket.join(room_id));

  socket.on('send_message', (data, callback) => {
    const { roomId, content, type = 'text', fileUrl, fileName, fileSize } = data;

    const member = db.prepare('SELECT * FROM room_members WHERE room_id = ? AND user_id = ?').get(roomId, userId);
    if (!member) return callback?.({ error: '권한 없음' });

    const msgId = uuidv4();
    db.prepare(`
      INSERT INTO messages (id, room_id, sender_id, type, content, file_url, file_name, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(msgId, roomId, userId, type, content || null, fileUrl || null, fileName || null, fileSize || null);

    const sender = db.prepare('SELECT nickname, avatar FROM users WHERE id = ?').get(userId);
    const message = {
      id: msgId,
      room_id: roomId,
      sender_id: userId,
      sender_nickname: sender.nickname,
      sender_avatar: sender.avatar,
      type,
      content,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      created_at: new Date().toISOString()
    };

    io.to(roomId).emit('new_message', message);
    callback?.({ success: true, message });
  });

  socket.on('typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('typing', { userId, nickname: socket.user.nickname, isTyping });
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    db.prepare('UPDATE room_members SET last_read_at = CURRENT_TIMESTAMP WHERE room_id = ? AND user_id = ?').run(roomId, userId);
    io.to(roomId).emit('room_read', { roomId, userId });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run('offline', userId);
    io.emit('user_status', { userId, status: 'offline' });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
