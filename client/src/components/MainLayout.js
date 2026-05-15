import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { useViewport } from '../hooks/useViewport';
import Sidebar from './Sidebar';
import ChatRoom from './ChatRoom';
import CreateRoomModal from './CreateRoomModal';
import NotificationToast from './NotificationToast';
import { useNotificationSound } from '../hooks/useNotificationSound';

export default function MainLayout() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const { isMobile } = useViewport();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userStatuses, setUserStatuses] = useState({});
  const [notifications, setNotifications] = useState([]);
  const activeRoomRef = useRef(null);
  const roomsRef = useRef([]);
  const playSound = useNotificationSound();

  useEffect(() => { roomsRef.current = rooms; }, [rooms]);

  // 브라우저 알림 권한 요청 (1회)
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await axios.get('/api/rooms');
      setRooms(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const isActive = activeRoomRef.current?.id === message.room_id;
      const isOwn = message.sender_id === user?.id;
      const isVisible = !document.hidden;

      setRooms(prev => {
        const updated = prev.map(room => {
          if (room.id !== message.room_id) return room;
          return {
            ...room,
            last_message: message.type === 'text' ? message.content : message.type === 'image' ? '[이미지]' : '[파일]',
            last_message_at: message.created_at,
            unread_count: isActive ? 0 : (room.unread_count || 0) + 1
          };
        });
        return [...updated].sort((a, b) => new Date(b.last_message_at || b.created_at) - new Date(a.last_message_at || a.created_at));
      });

      // 알림: 내 메시지가 아니고, 현재 그 방을 보고 있지 않을 때
      if (!isOwn && !isActive) {
        const room = roomsRef.current.find(r => r.id === message.room_id);
        const roomName = room?.name || message.sender_nickname || '새 메시지';

        setNotifications(prev => [
          ...prev,
          {
            id: `${message.id}-${Date.now()}`,
            messageId: message.id,
            roomId: message.room_id,
            roomName,
            senderNickname: message.sender_nickname,
            avatar: message.sender_avatar,
            type: message.type,
            content: message.content,
          },
        ]);

        playSound();

        if ('Notification' in window && Notification.permission === 'granted' && !isVisible) {
          try {
            const preview = message.type === 'text'
              ? message.content
              : message.type === 'image' ? '📷 사진'
              : message.type === 'emoticon' ? '🐹 이모티콘'
              : '📎 파일';
            const n = new Notification(`${message.sender_nickname} · ${roomName}`, {
              body: preview,
              icon: '/logo192.png',
              tag: message.room_id,
            });
            n.onclick = () => { window.focus(); n.close(); };
          } catch {}
        }
      }
    };

    const handleUserStatus = ({ userId, status }) => {
      setUserStatuses(prev => ({ ...prev, [userId]: status }));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_status', handleUserStatus);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_status', handleUserStatus);
    };
  }, [socket, user, playSound]);

  const handleNotificationClick = useCallback((n) => {
    const room = roomsRef.current.find(r => r.id === n.roomId);
    if (room) {
      activeRoomRef.current = room;
      setActiveRoom(room);
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r));
      if (socket) socket.emit('join_room', room.id);
    }
  }, [socket]);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleRoomSelect = useCallback((room) => {
    activeRoomRef.current = room;
    setActiveRoom(room);
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r));
    if (socket) socket.emit('join_room', room.id);
  }, [socket]);

  const handleRoomCreated = useCallback((room) => {
    setRooms(prev => {
      const exists = prev.find(r => r.id === room.id);
      if (exists) return prev;
      return [room, ...prev];
    });
    handleRoomSelect(room);
    setShowCreateModal(false);
  }, [handleRoomSelect]);

  const handleBackToList = useCallback(() => {
    activeRoomRef.current = null;
    setActiveRoom(null);
  }, []);

  // 모바일: 채팅방 진입 시 사이드바 숨김 / 데스크톱: 항상 표시
  const showSidebar = !isMobile || !activeRoom;
  const showMain = !isMobile || !!activeRoom;

  return (
    <div style={styles.container}>
      {showSidebar && (
        <Sidebar
          rooms={rooms}
          activeRoom={activeRoom}
          onRoomSelect={handleRoomSelect}
          onCreateRoom={() => setShowCreateModal(true)}
          userStatuses={userStatuses}
          currentUser={user}
          isMobile={isMobile}
        />
      )}
      {showMain && (
        <div style={styles.main}>
          {activeRoom ? (
            <ChatRoom
              key={activeRoom.id}
              room={activeRoom}
              currentUser={user}
              userStatuses={userStatuses}
              onRoomUpdated={fetchRooms}
              onBack={isMobile ? handleBackToList : null}
            />
          ) : (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>💬</div>
              <p style={styles.emptyText}>대화를 선택하거나 새로운 대화를 시작하세요</p>
              <button style={styles.emptyBtn} onClick={() => setShowCreateModal(true)}>새 대화 시작</button>
            </div>
          )}
        </div>
      )}
      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} onCreated={handleRoomCreated} />
      )}
      <NotificationToast
        notifications={notifications}
        onClick={handleNotificationClick}
        onDismiss={dismissNotification}
      />
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100dvh', width: '100%', overflow: 'hidden' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f5f5', minWidth: 0 },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999', padding: 20, textAlign: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 15, marginBottom: 20 },
  emptyBtn: { padding: '12px 26px', background: '#FEE500', border: 'none', borderRadius: 22, fontSize: 14, fontWeight: 700, color: '#3A1D96', cursor: 'pointer', minHeight: 44 },
};
