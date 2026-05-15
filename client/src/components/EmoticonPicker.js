import React, { useRef, useEffect, useState } from 'react';
import { EMOTICONS } from './Emoticons';

export default function EmoticonPicker({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>🐹 햄스터 스티커</span>
        <span style={styles.headerSub}>{EMOTICONS.length}종</span>
      </div>
      <div style={styles.grid}>
        {EMOTICONS.map(e => (
          <StickerButton key={e.id} emoticon={e} onSelect={onSelect} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

function StickerButton({ emoticon, onSelect, onClose }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      style={{
        ...styles.item,
        ...(hovered ? styles.itemHovered : {}),
      }}
      onClick={() => { onSelect(emoticon.id); onClose(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        ...styles.stickerWrap,
        transform: hovered ? 'scale(1.18) rotate(-4deg)' : 'scale(1)',
        transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {emoticon.svg}
      </div>
      <span style={{ ...styles.label, color: hovered ? '#8B6914' : '#aaa' }}>
        {emoticon.label}
      </span>
    </button>
  );
}

const styles = {
  container: {
    position: 'absolute',
    bottom: '64px',
    left: '0px',
    width: 300,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
    zIndex: 100,
    overflow: 'hidden',
    border: '1.5px solid #f0e0a0',
    animation: 'fadeUp 0.18s cubic-bezier(0.34,1.56,0.64,1)',
  },
  header: {
    padding: '10px 16px',
    borderBottom: '1px solid #f5e8c0',
    background: 'linear-gradient(135deg, #FFFDE7, #FFF9C4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#8B6914',
  },
  headerSub: {
    fontSize: 11,
    color: '#bba040',
    background: '#FFF0A0',
    borderRadius: 8,
    padding: '2px 8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 2,
    padding: 8,
    maxHeight: 310,
    overflowY: 'auto',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    background: 'none',
    border: '1.5px solid transparent',
    borderRadius: 10,
    padding: '6px 4px',
    cursor: 'pointer',
  },
  itemHovered: {
    background: '#FFFDE7',
    border: '1.5px solid #FEE500',
  },
  stickerWrap: {
    width: 58,
    height: 54,
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    transition: 'color 0.15s',
  },
};
