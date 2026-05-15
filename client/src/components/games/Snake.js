import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID = 20;
const CELL = 18;
const SIZE = GRID * CELL;

const DIRS = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
};

export default function Snake({ onScoreShare, onClose }) {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([[10, 10], [9, 10], [8, 10]]);
  const [food, setFood] = useState([15, 10]);
  const [dir, setDir] = useState([1, 0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snake_high') || '0'));
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(140);
  const dirRef = useRef(dir);
  const queuedDirRef = useRef(null);

  const randomFood = useCallback((snakeArr) => {
    while (true) {
      const pos = [Math.floor(Math.random() * GRID), Math.floor(Math.random() * GRID)];
      const occupied = snakeArr.some(([x, y]) => x === pos[0] && y === pos[1]);
      if (!occupied) return pos;
    }
  }, []);

  const reset = useCallback(() => {
    setSnake([[10, 10], [9, 10], [8, 10]]);
    setFood([15, 10]);
    setDir([1, 0]);
    dirRef.current = [1, 0];
    queuedDirRef.current = null;
    setScore(0);
    setGameOver(false);
    setSpeed(140);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (gameOver) {
        if (e.key === 'Enter' || e.key === ' ') reset();
        return;
      }
      if (e.key === 'p' || e.key === 'P') { setPaused(p => !p); return; }
      const newDir = DIRS[e.key];
      if (!newDir) return;
      const [cdx, cdy] = dirRef.current;
      if (newDir[0] === -cdx && newDir[1] === -cdy) return;
      queuedDirRef.current = newDir;
      e.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameOver, reset]);

  useEffect(() => {
    if (gameOver || paused) return;
    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const currentDir = queuedDirRef.current || dirRef.current;
        dirRef.current = currentDir;
        queuedDirRef.current = null;
        const head = prevSnake[0];
        const newHead = [head[0] + currentDir[0], head[1] + currentDir[1]];

        if (newHead[0] < 0 || newHead[0] >= GRID || newHead[1] < 0 || newHead[1] >= GRID) {
          setGameOver(true);
          return prevSnake;
        }
        if (prevSnake.some(([x, y]) => x === newHead[0] && y === newHead[1])) {
          setGameOver(true);
          return prevSnake;
        }

        const ate = newHead[0] === food[0] && newHead[1] === food[1];
        const newSnake = ate ? [newHead, ...prevSnake] : [newHead, ...prevSnake.slice(0, -1)];
        if (ate) {
          setScore(s => {
            const ns = s + 10;
            if (ns > highScore) { setHighScore(ns); localStorage.setItem('snake_high', ns); }
            return ns;
          });
          setFood(randomFood(newSnake));
          setSpeed(s => Math.max(60, s - 2));
        }
        return newSnake;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [food, paused, gameOver, speed, highScore, randomFood]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    grad.addColorStop(0, '#E8F5E9');
    grad.addColorStop(1, '#C8E6C9');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }

    // 먹이 (사과)
    const [fx, fy] = food;
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.arc(fx * CELL + CELL / 2, fy * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2ECC71';
    ctx.fillRect(fx * CELL + CELL / 2 - 1, fy * CELL + 1, 2, 4);

    // 뱀
    snake.forEach(([x, y], i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? '#1B5E20' : `hsl(${120 + i * 2}, 60%, ${40 - Math.min(i, 20) * 0.5}%)`;
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
      if (isHead) {
        ctx.fillStyle = '#fff';
        const [dx, dy] = dirRef.current;
        const ex1 = x * CELL + CELL / 2 + dx * 3 - 3;
        const ey1 = y * CELL + CELL / 2 + dy * 3 - 3;
        ctx.fillRect(ex1, ey1, 2, 2);
        ctx.fillRect(ex1 + (dy === 0 ? 0 : 4), ey1 + (dx === 0 ? 0 : 4), 2, 2);
      }
    });

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = '#FEE500';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', SIZE / 2, SIZE / 2 - 10);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`점수: ${score}`, SIZE / 2, SIZE / 2 + 20);
      ctx.font = '13px sans-serif';
      ctx.fillText('스페이스/엔터: 다시하기', SIZE / 2, SIZE / 2 + 50);
    }
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', SIZE / 2, SIZE / 2);
    }
  }, [snake, food, gameOver, paused, score]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onClose}>← 게임센터</button>
        <div style={styles.title}>🐍 지렁이 게임</div>
        <div style={{ width: 80 }} />
      </div>
      <div style={styles.scoreBar}>
        <div style={styles.scoreBox}><span style={styles.label}>점수</span><span style={styles.score}>{score}</span></div>
        <div style={styles.scoreBox}><span style={styles.label}>최고</span><span style={styles.highScore}>🏆 {highScore}</span></div>
        <div style={styles.scoreBox}><span style={styles.label}>속도</span><span style={styles.speedVal}>{Math.round((140 - speed) / 2) + 1}</span></div>
      </div>
      <canvas ref={canvasRef} width={SIZE} height={SIZE} style={styles.canvas} />
      <div style={styles.controls}>
        <p style={styles.help}>방향키/WASD로 이동 · P로 일시정지</p>
        {gameOver && (
          <div style={styles.btnGroup}>
            <button style={styles.actionBtn} onClick={reset}>🔄 다시하기</button>
            <button style={styles.shareBtn} onClick={() => onScoreShare(`🐍 지렁이게임 점수: ${score}점!`)}>📤 점수 공유</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, background: '#FAFAFA', height: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#3A1D96', fontWeight: 700 },
  title: { fontSize: 16, fontWeight: 700 },
  scoreBar: { display: 'flex', gap: 10, marginBottom: 10 },
  scoreBox: { background: '#fff', padding: '6px 14px', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
  label: { fontSize: 10, color: '#888' },
  score: { fontWeight: 700, fontSize: 18, color: '#2ECC71' },
  highScore: { fontWeight: 700, fontSize: 14, color: '#F39C12' },
  speedVal: { fontWeight: 700, fontSize: 16, color: '#E91E63' },
  canvas: { border: '3px solid #1B5E20', borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.15)', background: '#E8F5E9' },
  controls: { marginTop: 10, textAlign: 'center' },
  help: { fontSize: 12, color: '#666', marginBottom: 8 },
  btnGroup: { display: 'flex', gap: 8, justifyContent: 'center' },
  actionBtn: { padding: '8px 18px', background: '#FEE500', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#3A1D96', cursor: 'pointer' },
  shareBtn: { padding: '8px 18px', background: '#3A1D96', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#FEE500', cursor: 'pointer' },
};
