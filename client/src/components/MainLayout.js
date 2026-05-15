import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import ChatRoom from './ChatRoom';
import CreateRoomModal from './CreateRoomModal';

export default function MainLayout() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userStatuses, setUserStatuses] = useState({});
  const activeRoomRef = useRef(null);

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
      setRooms(prev => {
        const updated = prev.map(room => {
          if (room.id !== message.room_id) return room;
          const isActive = activeRoomRef.current?.id === room.id;
          return {
            ...room,
            last_message: message.type === 'text' ? message.content : message.type === 'image' ? '[이미지]' : '[파일]',
            last_message_at: message.created_at,
            unread_count: isActive ? 0 : (room.unread_count || 0) + 1
          };
        });
        return [...updated].sort((a, b) => new Date(b.last_message_at || b.created_at) - new Date(a.last_message_at || a.created_at));
      });
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
  }, [socket]);

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

  return (
    <div style={styles.container}>
      <Sidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onRoomSelect={handleRoomSelect}
        onCreateRoom={() => setShowCreateModal(true)}
        userStatuses={userStatuses}
        currentUser={user}
      />
      <div style={styles.main}>
        {activeRoom ? (
          <ChatRoom
            key={activeRoom.id}
            room={activeRoom}
            currentUser={user}
            userStatuses={userStatuses}
            onRoomUpdated={fetchRooms}
          />
        ) : (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>💬</div>
            <p style={styles.emptyText}>대화를 선택하거나 새로운 대화를 시작하세요</p>
            <button style={styles.emptyBtn} onClick={() => setShowCreateModal(true)}>새 대화 시작</button>
          </div>
        )}
      </div>
      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} onCreated={handleRoomCreated} />
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', width: '100%' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f5f5' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 15, marginBottom: 20 },
  emptyBtn: { padding: '10px 24px', background: '#FEE500', border: 'none', borderRadius: 20, fontSize: 14, fontWeight: 700, color: '#3A1D96', cursor: 'pointer' },
};
