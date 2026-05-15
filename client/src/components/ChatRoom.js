import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useSocket } from '../contexts/SocketContext';
import MemberModal from './MemberModal';
import ImageViewer from './ImageViewer';
import EmoticonPicker from './EmoticonPicker';
import EmoticonSticker from './Emoticons';

export default function ChatRoom({ room, currentUser, userStatuses, onRoomUpdated }) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [viewImage, setViewImage] = useState(null);
  const [showEmoticons, setShowEmoticons] = useState(false);
  const [roomInfo, setRoomInfo] = useState(room);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const getRoomName = () => {
    if (roomInfo.name) return roomInfo.name;
    if (roomInfo.type === 'direct') {
      const other = roomInfo.members?.find(m => m.id !== currentUser.id);
      return other?.nickname || '알 수 없음';
    }
    return roomInfo.members?.map(m => m.nickname).join(', ') || '그룹 채팅';
  };

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/rooms/${room.id}/messages`);
      setMessages(res.data);
    } catch {} finally {
      setLoading(false);
    }
  }, [room.id]);

  useEffect(() => {
    fetchMessages();
    setRoomInfo(room);
  }, [room.id, fetchMessages, room]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.room_id !== room.id) return;
      setMessages(prev => {
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      socket.emit('join_room', room.id);
    };

    const handleTyping = ({ userId, nickname, isTyping }) => {
      if (userId === currentUser.id) return;
      setTyping(prev => isTyping ? [...new Set([...prev, nickname])] : prev.filter(n => n !== nickname));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
    };
  }, [socket, room.id, currentUser.id]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !socket) return;
    socket.emit('send_message', { roomId: room.id, content: input.trim(), type: 'text' });
    setInput('');
    socket.emit('typing', { roomId: room.id, isTyping: false });
  }, [input, socket, room.id]);

  const handleSendEmoticon = useCallback((emoticonId) => {
    if (!socket) return;
    socket.emit('send_message', {
      roomId: room.id,
      type: 'emoticon',
      content: emoticonId,
    });
  }, [socket, room.id]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit('typing', { roomId: room.id, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { roomId: room.id, isTyping: false });
    }, 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress({ fileName: file.name, fileSize: file.size, loaded: 0, percent: 0, speed: 0, eta: 0 });

    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30 * 60 * 1000,
        onUploadProgress: (progressEvent) => {
          const now = Date.now();
          const dt = (now - lastTime) / 1000;
          const dl = progressEvent.loaded - lastLoaded;
          const speed = dt > 0.3 ? dl / dt : (progressEvent.loaded - 0) / ((now - startTime) / 1000 || 1);
          if (dt > 0.3) { lastLoaded = progressEvent.loaded; lastTime = now; }
          const percent = progressEvent.total ? (progressEvent.loaded / progressEvent.total) * 100 : 0;
          const remaining = progressEvent.total ? (progressEvent.total - progressEvent.loaded) / Math.max(speed, 1) : 0;
          setUploadProgress({
            fileName: file.name,
            fileSize: file.size,
            loaded: progressEvent.loaded,
            percent,
            speed,
            eta: remaining,
          });
        }
      });
      const { url, name, size, type } = res.data;
      socket.emit('send_message', {
        roomId: room.id, type, fileUrl: url, fileName: name, fileSize: size,
        content: type === 'image' ? '[이미지]' : type === 'video' ? '[동영상]' : type === 'audio' ? '[음성]' : `[파일: ${name}]`
      });
    } catch (err) {
      const msg = err.response?.data?.error || (err.code === 'ECONNABORTED' ? '업로드 시간이 초과되었습니다.' : '파일 업로드에 실패했습니다.');
      alert(msg);
    } finally {
      setUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.roomName}>{getRoomName()}</div>
          {roomInfo.type === 'group' && <div style={styles.memberCount}>{roomInfo.members?.length}명</div>}
        </div>
        <div style={styles.headerActions}>
          <button style={styles.headerBtn} onClick={() => setShowMembers(true)}>👥</button>
        </div>
      </div>

      <div style={styles.messages}>
        {loading && <div style={styles.loadingText}>메시지 불러오는 중...</div>}
        {groupedMessages.map(({ date, messages: dayMsgs }) => (
          <div key={date}>
            <div style={styles.dateDivider}><span style={styles.dateDividerText}>{date}</span></div>
            {dayMsgs.map((msg, idx) => {
              const isMine = msg.sender_id === currentUser.id;
              const prevMsg = dayMsgs[idx - 1];
              const showAvatar = !isMine && (idx === 0 || prevMsg?.sender_id !== msg.sender_id);
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMine={isMine}
                  showAvatar={showAvatar}
                  onImageClick={setViewImage}
                />
              );
            })}
          </div>
        ))}
        {typing.length > 0 && (
          <div style={styles.typingIndicator}>
            <span style={styles.typingDots}>
              <span />
              <span />
              <span />
            </span>
            {typing.join(', ')}님이 입력 중
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {uploadProgress && <UploadProgressBar progress={uploadProgress} />}

      <div style={styles.inputArea}>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />

        <div style={{ position: 'relative' }}>
          <button
            style={{ ...styles.toolBtn, ...(showEmoticons ? styles.toolBtnActive : {}) }}
            onClick={() => setShowEmoticons(v => !v)}
            title="스티커"
          >
            🐹
          </button>
          {showEmoticons && (
            <EmoticonPicker
              onSelect={handleSendEmoticon}
              onClose={() => setShowEmoticons(false)}
            />
          )}
        </div>

        <button style={styles.toolBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading} title="파일 첨부">
          {uploading ? '⏳' : '📎'}
        </button>

        <textarea
          style={styles.input}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          rows={1}
        />
        <button style={{ ...styles.sendBtn, ...(input.trim() ? {} : styles.sendBtnDisabled) }} onClick={handleSend} disabled={!input.trim()}>
          ➤
        </button>
      </div>

      {showMembers && (
        <MemberModal
          room={roomInfo}
          currentUser={currentUser}
          onClose={() => setShowMembers(false)}
          onUpdated={(updatedRoom) => { setRoomInfo(updatedRoom); onRoomUpdated(); }}
        />
      )}
      {viewImage && <ImageViewer url={viewImage} onClose={() => setViewImage(null)} />}
    </div>
  );
}

function UploadProgressBar({ progress }) {
  const { fileName, fileSize, loaded, percent, speed, eta } = progress;
  const speedText = formatFileSize(speed) + '/s';
  const etaText = eta > 0 && eta < 86400 ? formatTime(eta) : '계산 중...';
  return (
    <div style={styles.uploadBar}>
      <div style={styles.uploadHeader}>
        <span style={styles.uploadIcon}>📤</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.uploadFileName}>{fileName}</div>
          <div style={styles.uploadMeta}>
            {formatFileSize(loaded)} / {formatFileSize(fileSize)} · {speedText} · 남은시간 {etaText}
          </div>
        </div>
        <span style={styles.uploadPercent}>{percent.toFixed(1)}%</span>
      </div>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${percent}%` }} />
      </div>
    </div>
  );
}

function formatTime(seconds) {
  if (seconds < 60) return `${Math.ceil(seconds)}초`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}분`;
  return `${Math.floor(seconds / 3600)}시간 ${Math.ceil((seconds % 3600) / 60)}분`;
}

function MessageBubble({ message, isMine, showAvatar, onImageClick }) {
  const timeStr = format(new Date(message.created_at), 'a h:mm', { locale: ko });
  const isEmoticon = message.type === 'emoticon';

  return (
    <div style={{ ...styles.msgRow, ...(isMine ? styles.msgRowMine : {}) }}>
      {!isMine && (
        <div style={styles.avatarCol}>
          {showAvatar && (
            <div style={{ ...styles.avatar, background: message.sender_avatar || '#ccc' }}>
              {message.sender_nickname?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      )}
      <div style={{ ...styles.msgContent, ...(isMine ? styles.msgContentMine : {}) }}>
        {!isMine && showAvatar && <div style={styles.senderName}>{message.sender_nickname}</div>}
        <div style={styles.bubbleRow}>
          {isMine && <span style={styles.msgTime}>{timeStr}</span>}

          {isEmoticon ? (
            <div style={styles.emoticonBubble}>
              <EmoticonSticker emoticonId={message.content} size={130} />
            </div>
          ) : (
            <div style={{ ...styles.bubble, ...(isMine ? styles.bubbleMine : styles.bubbleOther) }}>
              {message.type === 'image' ? (
                <img
                  src={message.file_url}
                  alt={message.file_name}
                  style={styles.imageMsg}
                  onClick={() => onImageClick(message.file_url)}
                />
              ) : message.type === 'video' ? (
                <div style={styles.mediaWrap}>
                  <video src={message.file_url} controls preload="metadata" style={styles.videoMsg} />
                  <div style={styles.mediaCaption}>
                    🎬 {message.file_name} · {formatFileSize(message.file_size)}
                  </div>
                </div>
              ) : message.type === 'audio' ? (
                <div style={styles.audioWrap}>
                  <span style={styles.fileIcon}>🎵</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.fileName}>{message.file_name}</div>
                    <audio src={message.file_url} controls style={styles.audioMsg} />
                    <div style={styles.fileSize}>{formatFileSize(message.file_size)}</div>
                  </div>
                </div>
              ) : message.type === 'file' ? (
                <a href={message.file_url} download={message.file_name} style={styles.fileMsg}>
                  <span style={styles.fileIcon}>{getFileIcon(message.file_name)}</span>
                  <div>
                    <div style={styles.fileName}>{message.file_name}</div>
                    <div style={styles.fileSize}>{formatFileSize(message.file_size)} · 클릭하여 다운로드</div>
                  </div>
                </a>
              ) : (
                <span style={styles.textMsg}>{message.content}</span>
              )}
            </div>
          )}

          {!isMine && <span style={styles.msgTime}>{timeStr}</span>}
        </div>
      </div>
    </div>
  );
}

function groupMessagesByDate(messages) {
  const groups = {};
  messages.forEach(msg => {
    const date = format(new Date(msg.created_at), 'yyyy년 M월 d일 EEEE', { locale: ko });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return Object.entries(groups).map(([date, messages]) => ({ date, messages }));
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)}GB`;
}

function getFileIcon(fileName) {
  if (!fileName) return '📎';
  const ext = fileName.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return '📕';
  if (['doc', 'docx', 'hwp'].includes(ext)) return '📘';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📗';
  if (['ppt', 'pptx'].includes(ext)) return '📙';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '🗜️';
  if (['txt', 'md'].includes(ext)) return '📝';
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'html', 'css', 'json'].includes(ext)) return '📜';
  if (['psd', 'ai', 'sketch', 'fig'].includes(ext)) return '🎨';
  return '📎';
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#b2c7d9' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#fff', borderBottom: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  roomName: { fontWeight: 700, fontSize: 16 },
  memberCount: { color: '#aaa', fontSize: 13 },
  headerActions: { display: 'flex', gap: 4 },
  headerBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: '4px 8px', borderRadius: 8 },
  messages: { flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2 },
  loadingText: { textAlign: 'center', color: '#888', fontSize: 13, padding: 20 },
  dateDivider: { display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0 8px' },
  dateDividerText: { background: 'rgba(0,0,0,0.18)', color: '#fff', borderRadius: 12, padding: '4px 14px', fontSize: 12 },
  typingIndicator: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666', padding: '6px 8px', fontStyle: 'italic' },
  typingDots: { display: 'inline-flex', gap: 3 },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 2 },
  msgRowMine: { flexDirection: 'row-reverse' },
  avatarCol: { width: 36, flexShrink: 0, display: 'flex', alignItems: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#333' },
  msgContent: { display: 'flex', flexDirection: 'column', maxWidth: '70%' },
  msgContentMine: { alignItems: 'flex-end' },
  senderName: { fontSize: 12, color: '#555', marginBottom: 3, marginLeft: 4 },
  bubbleRow: { display: 'flex', alignItems: 'flex-end', gap: 4 },
  bubble: { maxWidth: '100%', borderRadius: 16, padding: '8px 14px', wordBreak: 'break-word' },
  bubbleMine: { background: '#FEE500', borderBottomRightRadius: 4 },
  bubbleOther: { background: '#fff', borderBottomLeftRadius: 4, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' },
  emoticonBubble: { background: 'transparent', borderRadius: 12, padding: 4, display: 'inline-block' },
  textMsg: { fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' },
  imageMsg: { maxWidth: 240, maxHeight: 240, borderRadius: 8, cursor: 'pointer', display: 'block' },
  fileMsg: { display: 'flex', alignItems: 'center', gap: 10, color: 'inherit', textDecoration: 'none', padding: '2px 0' },
  fileIcon: { fontSize: 24, flexShrink: 0 },
  fileName: { fontSize: 13, fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileSize: { fontSize: 11, color: '#888', marginTop: 2 },
  msgTime: { fontSize: 10, color: '#888', flexShrink: 0, paddingBottom: 6 },
  uploadBar: { padding: '10px 16px', background: '#FFFDE7', borderTop: '1px solid #f5e8c0' },
  uploadHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
  uploadIcon: { fontSize: 20 },
  uploadFileName: { fontSize: 13, fontWeight: 600, color: '#3A1D96', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  uploadMeta: { fontSize: 11, color: '#888', marginTop: 2 },
  uploadPercent: { fontSize: 13, fontWeight: 700, color: '#3A1D96', flexShrink: 0 },
  progressTrack: { height: 6, background: '#FFF0A0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #FEE500 0%, #FFD700 100%)', borderRadius: 3, transition: 'width 0.2s ease' },
  videoMsg: { maxWidth: 280, maxHeight: 200, borderRadius: 8, background: '#000', display: 'block' },
  mediaWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  mediaCaption: { fontSize: 11, color: '#666', padding: '2px 0' },
  audioWrap: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 },
  audioMsg: { width: '100%', height: 32, marginTop: 4 },
  inputArea: { display: 'flex', alignItems: 'flex-end', gap: 6, padding: '10px 14px', background: '#fff', borderTop: '1px solid #eee' },
  toolBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: '6px', flexShrink: 0, borderRadius: 8, transition: 'background 0.15s' },
  toolBtnActive: { background: '#FFF9C4' },
  input: { flex: 1, border: '1.5px solid #eee', borderRadius: 20, padding: '8px 14px', fontSize: 14, outline: 'none', resize: 'none', maxHeight: 120, lineHeight: 1.5, background: '#f8f8f8' },
  sendBtn: { background: '#FEE500', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', fontSize: 16, color: '#3A1D96', fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' },
  sendBtnDisabled: { background: '#eee', color: '#bbb', cursor: 'default' },
};
