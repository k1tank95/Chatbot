import React from 'react';

export default function ImageViewer({ url, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <button style={styles.closeBtn} onClick={onClose}>✕</button>
      <img
        src={url}
        alt="이미지 보기"
        style={styles.image}
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, cursor: 'pointer' },
  closeBtn: { position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  image: { maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8, cursor: 'default' },
};
