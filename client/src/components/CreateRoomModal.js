import React, { useState, useEffect } from 'react';
import axios from 'axios';
export default function CreateRoomModal({ onClose, onCreated }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search.trim()) { setUsers([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/auth/users/search?q=${encodeURIComponent(search)}`);
        setUsers(res.data);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleUser = (u) => {
    setSelected(prev => prev.find(s => s.id === u.id) ? prev.filter(s => s.id !== u.id) : [...prev, u]);
  };

  const handleCreate = async () => {
    if (selected.length === 0) return alert('대화 상대를 선택해주세요.');
    setLoading(true);
    try {
      const type = selected.length > 1 ? 'group' : 'direct';
      const res = await axios.post('/api/rooms', {
        type,
        memberIds: selected.map(u => u.id),
        name: selected.length > 1 ? (roomName || null) : null
      });
      onCreated({ ...res.data, members: res.data.members, unread_count: 0 });
    } catch { alert('대화방 생성에 실패했습니다.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>새 대화 시작</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {selected.length > 1 && (
          <input
            style={styles.nameInput}
            placeholder="그룹 대화방 이름 (선택사항)"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
          />
        )}

        {selected.length > 0 && (
          <div style={styles.selected}>
            {selected.map(u => (
              <div key={u.id} style={styles.chip}>
                <span>{u.nickname}</span>
                <button style={styles.chipRemove} onClick={() => toggleUser(u)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <input
          style={styles.search}
          placeholder="🔍 이름 또는 아이디 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />

        <div style={styles.results}>
          {users.length === 0 && search && <div style={styles.noResult}>검색 결과가 없습니다</div>}
          {users.map(u => {
            const isSelected = selected.find(s => s.id === u.id);
            return (
              <div key={u.id} style={{ ...styles.userItem, ...(isSelected ? styles.userItemSelected : {}) }} onClick={() => toggleUser(u)}>
                <div style={{ ...styles.avatar, background: u.avatar || '#ccc' }}>{u.nickname[0]}</div>
                <div>
                  <div style={styles.userName}>{u.nickname}</div>
                  <div style={styles.userId}>@{u.username}</div>
                </div>
                {isSelected && <span style={styles.checkmark}>✓</span>}
              </div>
            );
          })}
        </div>

        <button style={styles.createBtn} onClick={handleCreate} disabled={selected.length === 0 || loading}>
          {loading ? '생성 중...' : `대화 시작 ${selected.length > 0 ? `(${selected.length}명)` : ''}`}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #eee' },
  title: { fontSize: 17, fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#666' },
  nameInput: { margin: '12px 16px 0', padding: '10px 14px', border: '1.5px solid #eee', borderRadius: 8, fontSize: 14, outline: 'none' },
  selected: { display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px 16px 0' },
  chip: { display: 'flex', alignItems: 'center', gap: 6, background: '#FEE500', borderRadius: 16, padding: '4px 10px', fontSize: 13 },
  chipRemove: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#666' },
  search: { margin: '12px 16px', padding: '10px 14px', background: '#f5f5f5', border: 'none', borderRadius: 20, fontSize: 14, outline: 'none' },
  results: { flex: 1, overflowY: 'auto', padding: '0 8px' },
  noResult: { textAlign: 'center', padding: 24, color: '#aaa', fontSize: 14 },
  userItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' },
  userItemSelected: { background: '#FEF9E0' },
  avatar: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#333', flexShrink: 0 },
  userName: { fontWeight: 600, fontSize: 14 },
  userId: { fontSize: 12, color: '#aaa' },
  checkmark: { marginLeft: 'auto', color: '#FEE500', fontWeight: 700, fontSize: 18 },
  createBtn: { margin: '12px 16px 16px', padding: '13px', background: '#FEE500', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, color: '#3A1D96', cursor: 'pointer' },
};
