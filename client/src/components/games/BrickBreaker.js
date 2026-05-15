import React, { useState, useEffect, useRef, useCallback } from 'react';

const W = 400, H = 480;
const PADDLE_W = 80, PADDLE_H = 12;
const BALL_R = 7;
const BRICK_ROWS = 6, BRICK_COLS = 9;
const BRICK_W = 38, BRICK_H = 16, BRICK_GAP = 4;
const BRICK_TOP = 50, BRICK_LEFT = (W - (BRICK_COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP)) / 2;
const COLORS = ['#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#3498DB', '#9B59B6'];

const createBricks = () => {
  const arr = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      arr.push({
        x: BRICK_LEFT + c * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        color: COLORS[r],
        points: (BRICK_ROWS - r) * 10,
        alive: true,
      });
    }
  }
  return arr;
};

export default function BrickBreaker({ onScoreShare, onClose }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    paddleX: W / 2 - PADDLE_W / 2,
    ballX: W / 2, ballY: H - 50,
    ballVX: 3, ballVY: -3,
    bricks: createBricks(),
    keys: {},
    launched: false,
  });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('brick_high') || '0'));
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [paused, setPaused] = useState(false);

  const reset = useCallback(() => {
    stateRef.current = {
      paddleX: W / 2 - PADDLE_W / 2,
      ballX: W / 2, ballY: H - 50,
      ballVX: 3, ballVY: -3,
      bricks: createBricks(),
      keys: {},
      launched: false,
    };
    setScore(0); setLives(3); setLevel(1); setGameOver(false); setWon(false);
  }, []);

  const nextLevel = useCallback(() => {
    setLevel(l => l + 1);
    stateRef.current.bricks = createBricks();
    stateRef.current.ballX = W / 2;
    stateRef.current.ballY = H - 50;
    const speed = 3 + Math.min(level, 5) * 0.5;
    stateRef.current.ballVX = speed * (Math.random() > 0.5 ? 1 : -1);
    stateRef.current.ballVY = -speed;
    stateRef.current.launched = false;
  }, [level]);

  useEffect(() => {
    const dn = (e) => {
      if (gameOver || won) { if (e.key === 'Enter') reset(); return; }
      if (e.key === 'p' || e.key === 'P') { setPaused(p => !p); return; }
      if (e.key === ' ' && !stateRef.current.launched) stateRef.current.launched = true;
      stateRef.current.keys[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    };
    const up = (e) => { stateRef.current.keys[e.key] = false; };
    const mm = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      stateRef.current.paddleX = Math.max(0, Math.min(W - PADDLE_W, mx - PADDLE_W / 2));
    };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    canvasRef.current.addEventListener('mousemove', mm);
    return () => {
      window.removeEventListener('keydown', dn);
      window.removeEventListener('keyup', up);
    };
  }, [gameOver, won, reset]);

  useEffect(() => {
    let rafId;
    const ctx = canvasRef.current.getContext('2d');

    const draw = () => {
      const s = stateRef.current;
      if (!gameOver && !won && !paused) {
        // 패들 이동
        if (s.keys['ArrowLeft']) s.paddleX = Math.max(0, s.paddleX - 6);
        if (s.keys['ArrowRight']) s.paddleX = Math.min(W - PADDLE_W, s.paddleX + 6);

        if (s.launched) {
          s.ballX += s.ballVX;
          s.ballY += s.ballVY;

          if (s.ballX - BALL_R < 0) { s.ballX = BALL_R; s.ballVX = -s.ballVX; }
          if (s.ballX + BALL_R > W) { s.ballX = W - BALL_R; s.ballVX = -s.ballVX; }
          if (s.ballY - BALL_R < 0) { s.ballY = BALL_R; s.ballVY = -s.ballVY; }

          // 패들 충돌
          if (s.ballY + BALL_R >= H - 30 && s.ballY + BALL_R <= H - 30 + PADDLE_H &&
              s.ballX >= s.paddleX && s.ballX <= s.paddleX + PADDLE_W && s.ballVY > 0) {
            const hit = (s.ballX - s.paddleX) / PADDLE_W - 0.5;
            const speed = Math.hypot(s.ballVX, s.ballVY);
            s.ballVX = speed * hit * 2;
            s.ballVY = -Math.abs(speed * Math.cos(hit * Math.PI / 3));
          }

          // 벽돌 충돌
          for (const b of s.bricks) {
            if (!b.alive) continue;
            if (s.ballX + BALL_R > b.x && s.ballX - BALL_R < b.x + BRICK_W &&
                s.ballY + BALL_R > b.y && s.ballY - BALL_R < b.y + BRICK_H) {
              b.alive = false;
              setScore(sc => {
                const ns = sc + b.points;
                if (ns > highScore) { setHighScore(ns); localStorage.setItem('brick_high', ns); }
                return ns;
              });
              const ox = Math.min(s.ballX + BALL_R - b.x, b.x + BRICK_W - (s.ballX - BALL_R));
              const oy = Math.min(s.ballY + BALL_R - b.y, b.y + BRICK_H - (s.ballY - BALL_R));
              if (ox < oy) s.ballVX = -s.ballVX;
              else s.ballVY = -s.ballVY;
              break;
            }
          }

          // 모든 벽돌 깸
          if (s.bricks.every(b => !b.alive)) {
            if (level >= 5) setWon(true);
            else setTimeout(nextLevel, 100);
          }

          // 떨어짐
          if (s.ballY > H) {
            setLives(l => {
              const nl = l - 1;
              if (nl <= 0) { setGameOver(true); return 0; }
              s.ballX = W / 2; s.ballY = H - 50;
              s.ballVX = 3 * (Math.random() > 0.5 ? 1 : -1);
              s.ballVY = -3;
              s.launched = false;
              return nl;
            });
          }
        } else {
          s.ballX = s.paddleX + PADDLE_W / 2;
          s.ballY = H - 50;
        }
      }

      // 렌더링
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1a1a2e');
      grad.addColorStop(1, '#0f0f1e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // 별 배경
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let i = 0; i < 30; i++) {
        const sx = (i * 137.5) % W, sy = (i * 233.7) % H;
        ctx.fillRect(sx, sy, 1, 1);
      }

      // 벽돌
      s.bricks.forEach(b => {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(b.x, b.y, BRICK_W, 3);
        ctx.fillRect(b.x, b.y, 3, BRICK_H);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(b.x, b.y + BRICK_H - 3, BRICK_W, 3);
      });

      // 패들
      const pgrad = ctx.createLinearGradient(0, H - 30, 0, H - 30 + PADDLE_H);
      pgrad.addColorStop(0, '#FEE500');
      pgrad.addColorStop(1, '#FFB300');
      ctx.fillStyle = pgrad;
      ctx.fillRect(s.paddleX, H - 30, PADDLE_W, PADDLE_H);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(s.paddleX, H - 30, PADDLE_W, 3);

      // 공
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
      const bgrad = ctx.createRadialGradient(s.ballX - 2, s.ballY - 2, 1, s.ballX, s.ballY, BALL_R);
      bgrad.addColorStop(0, '#fff');
      bgrad.addColorStop(1, '#E91E63');
      ctx.fillStyle = bgrad;
      ctx.fill();

      if (!s.launched && !gameOver && !won) {
        ctx.fillStyle = '#FEE500';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('스페이스로 시작!', W / 2, H / 2);
      }

      if (gameOver) overlay(ctx, 'GAME OVER', `점수: ${score}`, 'Enter: 다시하기');
      if (won) overlay(ctx, 'CLEAR!', `점수: ${score}`, 'Enter: 다시하기');
      if (paused && !gameOver && !won) overlay(ctx, 'PAUSED', '', 'P: 계속하기');

      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [gameOver, won, paused, level, score, highScore, nextLevel]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onClose}>← 게임센터</button>
        <div style={styles.title}>🧱 벽돌깨기</div>
        <div style={{ width: 80 }} />
      </div>
      <div style={styles.scoreBar}>
        <div style={styles.box}><span style={styles.label}>점수</span><span style={{ ...styles.val, color: '#E91E63' }}>{score}</span></div>
        <div style={styles.box}><span style={styles.label}>레벨</span><span style={{ ...styles.val, color: '#3498DB' }}>{level}/5</span></div>
        <div style={styles.box}><span style={styles.label}>생명</span><span style={{ ...styles.val, color: '#E74C3C' }}>{'❤️'.repeat(lives)}</span></div>
        <div style={styles.box}><span style={styles.label}>최고</span><span style={{ ...styles.val, color: '#F39C12', fontSize: 13 }}>🏆 {highScore}</span></div>
      </div>
      <canvas ref={canvasRef} width={W} height={H} style={styles.canvas} />
      <p style={styles.help}>← → 또는 마우스로 패들 조작 · Space 발사 · P 일시정지</p>
      {(gameOver || won) && (
        <div style={styles.btnGroup}>
          <button style={styles.actionBtn} onClick={reset}>🔄 다시하기</button>
          <button style={styles.shareBtn} onClick={() => onScoreShare(`🧱 벽돌깨기 ${won ? '클리어!' : '점수'}: ${score}점 (Lv.${level})`)}>📤 점수 공유</button>
        </div>
      )}
    </div>
  );
}

function overlay(ctx, title, sub, hint) {
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FEE500';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(title, W / 2, H / 2 - 20);
  if (sub) { ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.fillText(sub, W / 2, H / 2 + 14); }
  ctx.fillStyle = '#ccc';
  ctx.font = '13px sans-serif';
  ctx.fillText(hint, W / 2, H / 2 + 50);
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, background: '#FAFAFA', height: '100%', overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#3A1D96', fontWeight: 700 },
  title: { fontSize: 16, fontWeight: 700 },
  scoreBar: { display: 'flex', gap: 8, marginBottom: 10 },
  box: { background: '#fff', padding: '6px 12px', borderRadius: 8, textAlign: 'center', minWidth: 65, boxShadow: '0 2px 4px rgba(0,0,0,0.06)' },
  label: { display: 'block', fontSize: 10, color: '#888' },
  val: { fontSize: 16, fontWeight: 700 },
  canvas: { border: '3px solid #0a0a1a', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.2)', cursor: 'none' },
  help: { fontSize: 11, color: '#666', marginTop: 8 },
  btnGroup: { display: 'flex', gap: 8, marginTop: 8 },
  actionBtn: { padding: '8px 18px', background: '#FEE500', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#3A1D96', cursor: 'pointer' },
  shareBtn: { padding: '8px 18px', background: '#3A1D96', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#FEE500', cursor: 'pointer' },
};
