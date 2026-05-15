import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Sidebar({ rooms, activeRoom, onRoomSelect, onCreateRoom, userStatuses, currentUser, isMobile }) {
  const { logout } = useAuth();
  const [search, setSearch] = useState('');

  const filtered = rooms.filter(room => {
    const name = getRoomName(room, currentUser);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ ...styles.sidebar, width: isMobile ? '100%' : 320, borderRight: isMobile ? 'none' : '1px solid #eee' }}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.myProfile}>
            <Avatar nickname={currentUser?.nickname} color="#FEE500" size={36} />
            <span style={styles.myName}>{currentUser?.nickname}</span>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.iconBtn} onClick={onCreateRoom} title="새 대화">✏️</button>
            <button style={styles.iconBtn} onClick={logout} title="로그아웃">🚪</button>
          </div>
        </div>
        <input
          style={styles.search}
          placeholder="🔍 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.empty}>
            {search ? '검색 결과가 없습니다' : '대화가 없습니다\n새 대화를 시작해보세요!'}
          </div>
        )}
        {filtered.map(room => (
          <RoomItem
            key={room.id}
            room={room}
            currentUser={currentUser}
            isActive={activeRoom?.id === room.id}
            onClick={() => onRoomSelect(room)}
            userStatuses={userStatuses}
          />
        ))}
      </div>
    </div>
  );
}

function RoomItem({ room, currentUser, isActive, onClick, userStatuses }) {
  const name = getRoomName(room, currentUser);
  const otherMember = room.type === 'direct' ? room.members?.find(m => m.id !== currentUser.id) : null;
  const isOnline = otherMember && userStatuses[otherMember.id] === 'online';
  const memberCount = room.members?.length || 0;

  return (
    <div style={{ ...styles.roomItem, ...(isActive ? styles.roomItemActive : {}) }} onClick={onClick}>
      <div style={styles.avatarWrap}>
        {room.type === 'group' ? (
          <div style={styles.groupAvatar}>
            {room.members?.slice(0, 2).map((m, i) => (
              <Avatar key={m.id} nickname={m.nickname} color={m.avatar} size={22} style={{ position: 'absolute', top: i * 10, left: i * 10 }} />
            ))}
          </div>
        ) : (
          <div style={styles.singleAvatar}>
            <Avatar nickname={otherMember?.nickname || name} color={otherMember?.avatar || '#ccc'} size={44} />
            {isOnline && <div style={styles.onlineDot} />}
          </div>
        )}
      </div>
      <div style={styles.roomInfo}>
        <div style={styles.roomTop}>
          <span style={styles.roomName}>{name}{room.type === 'group' && memberCount > 0 && <span style={styles.memberCount}> {memberCount}</span>}</span>
          <span style={styles.time}>{room.last_message_at ? formatTime(room.last_message_at) : ''}</span>
        </div>
        <div style={styles.roomBottom}>
          <span style={styles.lastMsg}>{room.last_message_type === 'image' ? '📷 이미지' : room.last_message_type === 'file' ? '📎 파일' : room.last_message || ''}</span>
          {room.unread_count > 0 && <span style={styles.badge}>{room.unread_count > 99 ? '99+' : room.unread_count}</span>}
        </div>
      </div>
    </div>
  );
}

function Avatar({ nickname, color, size, style }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color || '#ccc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color: '#333', flexShrink: 0, ...style
    }}>
      {nickname ? nickname[0].toUpperCase() : '?'}
    </div>
  );
}

function getRoomName(room, currentUser) {
  if (room.name) return room.name;
  if (room.type === 'direct') {
    const other = room.members?.find(m => m.id !== currentUser.id);
    return other?.nickname || '알 수 없음';
  }
  return room.members?.map(m => m.nickname).join(', ') || '그룹 채팅';
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  if (diff < 86400000) return format(date, 'a h:mm', { locale: ko });
  if (diff < 604800000) return format(date, 'EEEE', { locale: ko });
  return format(date, 'M/d', { locale: ko });
}

const styles = {
  sidebar: { background: '#fff', display: 'flex', flexDirection: 'column', height: '100dvh', flexShrink: 0 },
  header: { padding: '16px 16px 8px', borderBottom: '1px solid #eee' },
  headerTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  myProfile: { display: 'flex', alignItems: 'center', gap: 10 },
  myName: { fontWeight: 700, fontSize: 15 },
  headerActions: { display: 'flex', gap: 4 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: '8px 10px', borderRadius: 8, transition: 'background 0.2s', minWidth: 40, minHeight: 40 },
  search: { width: '100%', padding: '8px 12px', background: '#f5f5f5', border: 'none', borderRadius: 20, fontSize: 14, outline: 'none' },
  list: { flex: 1, overflowY: 'auto' },
  empty: { textAlign: 'center', padding: '40px 20px', color: '#aaa', fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.6 },
  roomItem: { display: 'flex', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', gap: 12, transition: 'background 0.15s' },
  roomItemActive: { background: '#FEF9E0' },
  avatarWrap: { flexShrink: 0 },
  groupAvatar: { width: 44, height: 44, position: 'relative', flexShrink: 0 },
  singleAvatar: { position: 'relative' },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#2ecc71', border: '2px solid #fff' },
  roomInfo: { flex: 1, minWidth: 0 },
  roomTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  roomName: { fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  memberCount: { color: '#aaa', fontWeight: 400 },
  time: { fontSize: 11, color: '#aaa', flexShrink: 0, marginLeft: 8 },
  roomBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  lastMsg: { fontSize: 13, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  badge: { background: '#FEE500', color: '#3A1D96', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700, marginLeft: 8, flexShrink: 0 },
};
