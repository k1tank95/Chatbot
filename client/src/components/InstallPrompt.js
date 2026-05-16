import React, { useEffect, useState } from 'react';

const DISMISS_KEY = 'hamtalk_install_dismissed';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    setIsIOS(iOS);

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    if (iOS) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => { clearTimeout(timer); window.removeEventListener('beforeinstallprompt', onPrompt); };
    }
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const install = async () => {
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, '1');
    }
    setDeferred(null);
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  if (!visible) return null;

  if (showIOSGuide) {
    return (
      <div style={styles.overlay} onClick={() => setShowIOSGuide(false)}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h3 style={styles.title}>🍎 아이폰에 앱 설치하기</h3>
          <ol style={styles.steps}>
            <li>하단의 <b>공유 버튼 <span style={styles.icon}>⬆️</span></b>을 누르세요</li>
            <li><b>"홈 화면에 추가"</b>를 선택하세요</li>
            <li>우측 상단 <b>"추가"</b>를 누르면 완료!</li>
          </ol>
          <button style={styles.closeBtn} onClick={() => { setShowIOSGuide(false); dismiss(); }}>확인</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.banner}>
      <div style={styles.iconWrap}>🐹</div>
      <div style={styles.text}>
        <div style={styles.titleSm}>홈 화면에 앱으로 설치</div>
        <div style={styles.subtitle}>{isIOS ? '아이폰 홈 화면에 추가하세요' : '한 번의 탭으로 앱처럼 사용하세요'}</div>
      </div>
      <button style={styles.installBtn} onClick={install}>설치</button>
      <button style={styles.x} onClick={dismiss} aria-label="닫기">✕</button>
    </div>
  );
}

const styles = {
  banner: {
    position: 'fixed', bottom: 16, left: 16, right: 16,
    maxWidth: 420, margin: '0 auto',
    background: '#fff', borderRadius: 14,
    padding: '12px 14px',
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: '0 10px 32px rgba(0,0,0,0.18)',
    border: '1.5px solid #FEE500',
    zIndex: 1500,
    animation: 'toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    background: '#FFF9C4',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 26, flexShrink: 0,
  },
  text: { flex: 1, minWidth: 0 },
  titleSm: { fontSize: 14, fontWeight: 700, color: '#222' },
  subtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  installBtn: {
    background: '#FEE500', border: 'none', borderRadius: 20,
    padding: '8px 18px', fontSize: 13, fontWeight: 700,
    color: '#3A1D96', cursor: 'pointer', minHeight: 36,
  },
  x: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 14, color: '#aaa', padding: 4,
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: 16,
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: 24,
    width: '100%', maxWidth: 360,
  },
  title: { fontSize: 17, fontWeight: 700, marginBottom: 14, textAlign: 'center' },
  steps: { paddingLeft: 20, lineHeight: 1.9, fontSize: 14, color: '#444' },
  icon: { fontSize: 16 },
  closeBtn: {
    marginTop: 16, width: '100%',
    background: '#FEE500', border: 'none', borderRadius: 10,
    padding: '12px', fontSize: 14, fontWeight: 700,
    color: '#3A1D96', cursor: 'pointer',
  },
};
