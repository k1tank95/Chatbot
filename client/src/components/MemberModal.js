import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MemberModal({ room, currentUser, onClose, onUpdated }) {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`/api/rooms/${room.id}/members`);
        setMembers(res.data);
      } catch {}
    };
    fetchMembers();
  }, [room.id]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/auth/users/search?q=${encodeURIComponent(searchQuery)}`);
        const memberIds = new Set(members.map(m => m.id));
        setSearchResults(res.data.filter(u => !memberIds.has(u.id)));
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, members]);

  const handleAddMembers = async (userIds) => {
    setLoading(true);
    try {
      await axios.post(`/api/rooms/${room.id}/members`, { userIds });
      const res = await axios.get(`/api/rooms/${room.id}/members`);
      setMembers(res.data);
      const updatedRoom = { ...room, type: 'group', members: res.data };
      onUpdated(updatedRoom);
      setShowAddUser(false);
      setSearchQuery('');
    } catch { alert('멤버 추가에 실패했습니다.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>대화 참여자 {members.length}명</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.memberList}>
          {members.map(member => (
            <div key={member.id} style={styles.memberItem}>
              <div style={{ ...styles.avatar, background: member.avatar || '#ccc' }}>{member.nickname[0]}</div>
              <div>
                <div style={styles.memberName}>{member.nickname}{member.id === currentUser.id && <span style={styles.meTag}> (나)</span>}</div>
                <div style={styles.memberStatus}>{member.status === 'online' ? '🟢 온라인' : '⚫ 오프라인'}</div>
              </div>
            </div>
          ))}
        </div>

        {!showAddUser ? (
          <button style={styles.addBtn} onClick={() => setShowAddUser(true)}>+ 대화 상대 추가</button>
        ) : (
          <div style={styles.addSection}>
            <input
              style={styles.search}
              placeholder="🔍 사용자 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchResults.map(u => (
              <div key={u.id} style={styles.searchItem} onClick={() => handleAddMembers([u.id])}>
                <div style={{ ...styles.avatar, background: u.avatar || '#ccc' }}>{u.nickname[0]}</div>
                <div>
                  <div style={styles.memberName}>{u.nickname}</div>
                  <div style={styles.memberStatus}>@{u.username}</div>
                </div>
                <button style={styles.addUserBtn} disabled={loading}>추가</button>
              </div>
            ))}
            {searchQuery && searchResults.length === 0 && <div style={styles.noResult}>검색 결과가 없습니다</div>}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 12 },
  modal: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, maxHeight: 'min(70vh, 560px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #eee' },
  title: { fontSize: 16, fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#666' },
  memberList: { flex: 1, overflowY: 'auto', padding: '8px' },
  memberItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10 },
  avatar: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#333', flexShrink: 0 },
  memberName: { fontWeight: 600, fontSize: 14 },
  meTag: { color: '#aaa', fontWeight: 400 },
  memberStatus: { fontSize: 12, color: '#888', marginTop: 2 },
  addBtn: { margin: '8px 16px 16px', padding: '11px', background: '#f5f5f5', border: 'none', borderRadius: 10, fontSize: 14, cursor: 'pointer', color: '#3A1D96', fontWeight: 600 },
  addSection: { padding: '8px 12px 12px' },
  search: { width: '100%', padding: '10px 14px', background: '#f5f5f5', border: 'none', borderRadius: 20, fontSize: 14, outline: 'none', marginBottom: 8 },
  searchItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', cursor: 'pointer' },
  addUserBtn: { marginLeft: 'auto', background: '#FEE500', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#3A1D96' },
  noResult: { textAlign: 'center', padding: 16, color: '#aaa', fontSize: 14 },
};
