import React, { useState } from 'react';
import Snake from './games/Snake';
import Tetris from './games/Tetris';
import BrickBreaker from './games/BrickBreaker';

const GAMES = [
  {
    id: 'snake', name: '지렁이 게임', icon: '🐍',
    desc: '꼬리를 끊지 말고 사과를 먹어요',
    color: '#2ECC71',
    component: Snake,
  },
  {
    id: 'tetris', name: '테트리스', icon: '🟦',
    desc: '블록을 쌓아서 줄을 지워요',
    color: '#9C27B0',
    component: Tetris,
  },
  {
    id: 'brick', name: '벽돌깨기', icon: '🧱',
    desc: '공으로 모든 벽돌을 부숴요',
    color: '#E91E63',
    component: BrickBreaker,
  },
];

export default function GameCenter({ onClose, onScoreShare }) {
  const [selected, setSelected] = useState(null);

  const handleShare = (text) => {
    onScoreShare(text);
    onClose();
  };

  if (selected) {
    const Game = selected.component;
    return (
      <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={styles.gameContainer}>
          <Game onClose={() => setSelected(null)} onScoreShare={handleShare} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.titleRow}>
            <span style={styles.titleIcon}>🎮</span>
            <h2 style={styles.title}>게임 센터</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <p style={styles.subtitle}>친구들과 함께 즐기는 추억의 미니게임</p>
        <div style={styles.gameList}>
          {GAMES.map(g => (
            <GameCard key={g.id} game={g} onClick={() => setSelected(g)} />
          ))}
        </div>
        <div style={styles.footer}>
          💡 게임이 끝나면 점수를 채팅방에 공유할 수 있어요!
        </div>
      </div>
    </div>
  );
}

function GameCard({ game, onClick }) {
  const [hovered, setHovered] = useState(false);
  const high = parseInt(localStorage.getItem(
    game.id === 'snake' ? 'snake_high' : game.id === 'tetris' ? 'tetris_high' : 'brick_high'
  ) || '0');

  return (
    <div
      style={{
        ...styles.card,
        background: hovered ? game.color : '#fff',
        transform: hovered ? 'translateY(-4px) scale(1.02)' : 'none',
        boxShadow: hovered ? `0 8px 24px ${game.color}80` : '0 2px 8px rgba(0,0,0,0.08)',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...styles.cardIcon, background: hovered ? 'rgba(255,255,255,0.25)' : `${game.color}20` }}>
        <span style={{ fontSize: 36 }}>{game.icon}</span>
      </div>
      <div style={styles.cardContent}>
        <div style={{ ...styles.cardName, color: hovered ? '#fff' : '#222' }}>{game.name}</div>
        <div style={{ ...styles.cardDesc, color: hovered ? 'rgba(255,255,255,0.85)' : '#888' }}>{game.desc}</div>
        {high > 0 && (
          <div style={{ ...styles.cardHigh, color: hovered ? '#FFEB3B' : '#F39C12' }}>
            🏆 최고점: {high}
          </div>
        )}
      </div>
      <span style={{ ...styles.arrow, color: hovered ? '#fff' : game.color }}>▶</span>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal: { background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  gameContainer: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 540, height: '95vh', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 8px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  titleIcon: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: 800, color: '#222' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#666' },
  subtitle: { fontSize: 13, color: '#888', padding: '0 24px 16px' },
  gameList: { display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px 16px', flex: 1, overflowY: 'auto' },
  card: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', border: '1.5px solid #f0f0f0' },
  cardIcon: { width: 54, height: 54, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' },
  cardContent: { flex: 1, minWidth: 0 },
  cardName: { fontSize: 16, fontWeight: 800, marginBottom: 2, transition: 'color 0.2s' },
  cardDesc: { fontSize: 12, marginBottom: 4, transition: 'color 0.2s' },
  cardHigh: { fontSize: 11, fontWeight: 700, transition: 'color 0.2s' },
  arrow: { fontSize: 16, flexShrink: 0, transition: 'color 0.2s' },
  footer: { padding: '12px 24px 18px', fontSize: 12, color: '#aaa', textAlign: 'center', borderTop: '1px solid #f5f5f5', background: '#FAFAFA' },
};
