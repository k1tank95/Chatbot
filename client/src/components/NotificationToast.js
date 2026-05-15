import React, { useEffect, useState } from 'react';

export default function NotificationToast({ notifications, onClick, onDismiss }) {
  return (
    <div style={styles.wrap}>
      {notifications.map(n => (
        <ToastItem key={n.id} notification={n} onClick={onClick} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ notification, onClick, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 4000);
    const remove = setTimeout(() => onDismiss(notification.id), 4400);
    return () => { clearTimeout(timer); clearTimeout(remove); };
  }, [notification.id, onDismiss]);

  const preview = notification.type === 'text'
    ? notification.content
    : notification.type === 'image' ? '📷 사진'
    : notification.type === 'video' ? '🎬 동영상'
    : notification.type === 'audio' ? '🎵 음성'
    : notification.type === 'emoticon' ? '🐹 이모티콘'
    : '📎 파일';

  return (
    <div
      style={{
        ...styles.toast,
        animation: exiting ? 'toastOut 0.4s ease-in forwards' : 'toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}
      onClick={() => { onClick(notification); onDismiss(notification.id); }}
    >
      <div style={{ ...styles.avatar, background: notification.avatar || '#FEE500' }}>
        {notification.senderNickname?.[0] || '?'}
      </div>
      <div style={styles.content}>
        <div style={styles.row}>
          <span style={styles.sender}>{notification.senderNickname}</span>
          <span style={styles.room}>· {notification.roomName}</span>
        </div>
        <div style={styles.message}>{preview}</div>
      </div>
      <button
        style={styles.close}
        onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }}
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  );
}

const styles = {
  wrap: {
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxWidth: 360,
    width: 'calc(100% - 32px)',
    pointerEvents: 'none',
  },
  toast: {
    background: '#fff',
    borderRadius: 14,
    boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    border: '1.5px solid #FEE500',
    pointerEvents: 'auto',
    transform: 'translateX(120%)',
  },
  avatar: {
    width: 40, height: 40, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 700, color: '#3A1D96', flexShrink: 0,
  },
  content: { flex: 1, minWidth: 0 },
  row: { display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 },
  sender: { fontSize: 14, fontWeight: 700, color: '#222' },
  room: { fontSize: 11, color: '#888' },
  message: {
    fontSize: 13, color: '#555',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  close: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 14, color: '#aaa', padding: 4, flexShrink: 0,
  },
};
