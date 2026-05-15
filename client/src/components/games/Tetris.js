import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useViewport } from '../../hooks/useViewport';

const COLS = 10, ROWS = 20, CELL = 22;
const W = COLS * CELL, H = ROWS * CELL;

const PIECES = {
  I: { shape: [[1, 1, 1, 1]], color: '#00BCD4' },
  O: { shape: [[1, 1], [1, 1]], color: '#FFEB3B' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#9C27B0' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#4CAF50' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#F44336' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#FF9800' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3F51B5' },
};
const TYPES = Object.keys(PIECES);

const newPiece = () => {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  return { type, shape: PIECES[type].shape, color: PIECES[type].color, x: 3, y: 0 };
};

const rotate = (shape) => shape[0].map((_, i) => shape.map(row => row[i]).reverse());

const collides = (board, piece, dx = 0, dy = 0, shape = piece.shape) => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const nx = piece.x + x + dx, ny = piece.y + y + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
};

const merge = (board, piece) => {
  const nb = board.map(r => [...r]);
  piece.shape.forEach((row, y) => row.forEach((v, x) => {
    if (v && piece.y + y >= 0) nb[piece.y + y][piece.x + x] = piece.color;
  }));
  return nb;
};

const clearLines = (board) => {
  const remaining = board.filter(row => row.some(c => !c));
  const cleared = ROWS - remaining.length;
  const empty = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { board: [...empty, ...remaining], cleared };
};

export default function Tetris({ onScoreShare, onClose }) {
  const canvasRef = useRef(null);
  const { width: vw, isMobile } = useViewport();
  // 게임 영역 + 사이드바(100px)이 들어가야 하므로 가용폭 계산
  const maxW = Math.min(W, vw - 140);
  const displayW = maxW;
  const displayH = (displayW / W) * H;
  const [board, setBoard] = useState(() => Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
  const [piece, setPiece] = useState(newPiece);
  const [next, setNext] = useState(newPiece);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('tetris_high') || '0'));
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const boardRef = useRef(board);
  const pieceRef = useRef(piece);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { pieceRef.current = piece; }, [piece]);

  const tryMove = useCallback((dx, dy, newShape) => {
    const p = pieceRef.current;
    const shape = newShape || p.shape;
    if (!collides(boardRef.current, p, dx, dy, shape)) {
      setPiece(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy, shape }));
      return true;
    }
    return false;
  }, []);

  const lockAndNext = useCallback(() => {
    const p = pieceRef.current;
    const merged = merge(boardRef.current, p);
    const { board: cleared, cleared: n } = clearLines(merged);
    if (n > 0) {
      const points = [0, 100, 300, 500, 800][n] * level;
      setScore(s => {
        const ns = s + points;
        if (ns > highScore) { setHighScore(ns); localStorage.setItem('tetris_high', ns); }
        return ns;
      });
      setLines(l => {
        const nl = l + n;
        setLevel(Math.floor(nl / 10) + 1);
        return nl;
      });
    }
    setBoard(cleared);
    const np = next;
    if (collides(cleared, np)) { setGameOver(true); return; }
    setPiece(np);
    setNext(newPiece());
  }, [next, highScore, level]);

  const reset = useCallback(() => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setPiece(newPiece());
    setNext(newPiece());
    setScore(0); setLines(0); setLevel(1);
    setGameOver(false);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (gameOver) { if (e.key === 'Enter') reset(); return; }
      if (e.key === 'p' || e.key === 'P') { setPaused(p => !p); return; }
      if (paused) return;
      if (e.key === 'ArrowLeft') tryMove(-1, 0);
      else if (e.key === 'ArrowRight') tryMove(1, 0);
      else if (e.key === 'ArrowDown') tryMove(0, 1) || lockAndNext();
      else if (e.key === 'ArrowUp') tryMove(0, 0, rotate(pieceRef.current.shape));
      else if (e.key === ' ') {
        let dy = 0;
        while (!collides(boardRef.current, pieceRef.current, 0, dy + 1)) dy++;
        setPiece(prev => ({ ...prev, y: prev.y + dy }));
        setTimeout(lockAndNext, 0);
      } else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameOver, paused, tryMove, lockAndNext, reset]);

  useEffect(() => {
    if (gameOver || paused) return;
    const speed = Math.max(80, 800 - (level - 1) * 60);
    const t = setInterval(() => { if (!tryMove(0, 1)) lockAndNext(); }, speed);
    return () => clearInterval(t);
  }, [gameOver, paused, level, tryMove, lockAndNext]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    // 격자
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let i = 1; i < COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke();
    }
    for (let i = 1; i < ROWS; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
    }

    // 보드 셀
    board.forEach((row, y) => row.forEach((c, x) => {
      if (!c) return;
      drawCell(ctx, x, y, c);
    }));

    // 현재 조각 + 그림자
    let shadowY = piece.y;
    while (!collides(board, piece, 0, shadowY - piece.y + 1)) shadowY++;
    piece.shape.forEach((row, y) => row.forEach((v, x) => {
      if (!v) return;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect((piece.x + x) * CELL + 1, (shadowY + y) * CELL + 1, CELL - 2, CELL - 2);
    }));
    piece.shape.forEach((row, y) => row.forEach((v, x) => {
      if (v && piece.y + y >= 0) drawCell(ctx, piece.x + x, piece.y + y, piece.color);
    }));

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FEE500';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W / 2, H / 2 - 10);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`점수: ${score}`, W / 2, H / 2 + 20);
      ctx.font = '12px sans-serif';
      ctx.fillText('Enter: 다시하기', W / 2, H / 2 + 50);
    }
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', W / 2, H / 2);
    }
  }, [board, piece, gameOver, paused, score]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onClose}>← 게임센터</button>
        <div style={styles.title}>🟦 테트리스</div>
        <div style={{ width: 80 }} />
      </div>
      <div style={styles.body}>
        <canvas ref={canvasRef} width={W} height={H} style={{ ...styles.canvas, width: displayW, height: displayH }} />
        <div style={styles.sidebar}>
          <ScoreBox label="점수" value={score} color="#00BCD4" />
          <ScoreBox label="레벨" value={level} color="#E91E63" />
          <ScoreBox label="줄" value={lines} color="#4CAF50" />
          <ScoreBox label="최고" value={`🏆 ${highScore}`} color="#F39C12" small />
          <div style={styles.nextBox}>
            <div style={styles.nextLabel}>NEXT</div>
            <NextPreview piece={next} />
          </div>
        </div>
      </div>
      {!isMobile && <p style={styles.help}>← → 이동 · ↑ 회전 · ↓ 빠르게 · Space 즉시낙하 · P 일시정지</p>}
      {isMobile && !gameOver && (
        <TetrisTouchPad
          onLeft={() => tryMove(-1, 0)}
          onRight={() => tryMove(1, 0)}
          onDown={() => tryMove(0, 1) || lockAndNext()}
          onRotate={() => tryMove(0, 0, rotate(pieceRef.current.shape))}
          onDrop={() => {
            let dy = 0;
            while (!collides(boardRef.current, pieceRef.current, 0, dy + 1)) dy++;
            setPiece(prev => ({ ...prev, y: prev.y + dy }));
            setTimeout(lockAndNext, 0);
          }}
          onPause={() => setPaused(p => !p)}
        />
      )}
      {gameOver && (
        <div style={styles.btnGroup}>
          <button style={styles.actionBtn} onClick={reset}>🔄 다시하기</button>
          <button style={styles.shareBtn} onClick={() => onScoreShare(`🟦 테트리스 점수: ${score}점! (Lv.${level}, ${lines}줄)`)}>📤 점수 공유</button>
        </div>
      )}
    </div>
  );
}

function drawCell(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, 3);
  ctx.fillRect(x * CELL + 1, y * CELL + 1, 3, CELL - 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x * CELL + 1, y * CELL + CELL - 4, CELL - 2, 3);
  ctx.fillRect(x * CELL + CELL - 4, y * CELL + 1, 3, CELL - 2);
}

function TetrisTouchPad({ onLeft, onRight, onDown, onRotate, onDrop, onPause }) {
  const handle = (fn) => (e) => { e.preventDefault(); fn(); };
  return (
    <div style={tpStyle.wrap}>
      <button style={tpStyle.btn} onTouchStart={handle(onLeft)} onClick={onLeft}>◀</button>
      <button style={tpStyle.btn} onTouchStart={handle(onRotate)} onClick={onRotate}>🔄</button>
      <button style={tpStyle.btn} onTouchStart={handle(onRight)} onClick={onRight}>▶</button>
      <button style={tpStyle.btn} onTouchStart={handle(onDown)} onClick={onDown}>▼</button>
      <button style={{ ...tpStyle.btn, background: '#3A1D96', color: '#FEE500' }} onTouchStart={handle(onDrop)} onClick={onDrop}>⬇️</button>
      <button style={{ ...tpStyle.btn, fontSize: 14 }} onClick={onPause}>⏸</button>
    </div>
  );
}

const tpStyle = {
  wrap: { display: 'grid', gridTemplateColumns: 'repeat(3, 56px)', gap: 6, marginTop: 12 },
  btn: { background: '#FEE500', border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 700, color: '#3A1D96', cursor: 'pointer', minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', userSelect: 'none' },
};

function ScoreBox({ label, value, color, small }) {
  return (
    <div style={{ background: '#fff', padding: '6px 10px', borderRadius: 8, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 10, color: '#888' }}>{label}</div>
      <div style={{ fontSize: small ? 12 : 16, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function NextPreview({ piece }) {
  const size = 14;
  const w = piece.shape[0].length * size;
  const h = piece.shape.length * size;
  return (
    <svg width={w} height={h} style={{ margin: 'auto', display: 'block' }}>
      {piece.shape.map((row, y) => row.map((v, x) => v ? (
        <rect key={`${x}-${y}`} x={x * size + 1} y={y * size + 1} width={size - 2} height={size - 2} fill={piece.color} />
      ) : null))}
    </svg>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, background: '#FAFAFA', height: '100%', overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#3A1D96', fontWeight: 700 },
  title: { fontSize: 16, fontWeight: 700 },
  body: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  canvas: { border: '3px solid #0a0a1a', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.2)', maxWidth: '100%', touchAction: 'none' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 6, width: 90 },
  nextBox: { background: '#fff', padding: 8, borderRadius: 8, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' },
  nextLabel: { fontSize: 10, color: '#888', marginBottom: 4 },
  help: { fontSize: 11, color: '#666', marginTop: 10, textAlign: 'center', maxWidth: 360 },
  btnGroup: { display: 'flex', gap: 8, marginTop: 8 },
  actionBtn: { padding: '8px 18px', background: '#FEE500', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#3A1D96', cursor: 'pointer' },
  shareBtn: { padding: '8px 18px', background: '#3A1D96', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, color: '#FEE500', cursor: 'pointer' },
};
