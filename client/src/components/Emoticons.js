import React from 'react';

/* ───────────────────────────────────────────────────────────────
   화려한 햄스터 스티커 컬렉션 (Premium SVG Sticker Pack)
   - 그라데이션, 글로우, 파티클, 애니메이션 효과 포함
   - 20종 캐릭터 표현
   ─────────────────────────────────────────────────────────────── */

// 공통 그라데이션/필터 정의
const Defs = ({ id }) => (
  <defs>
    <radialGradient id={`bodyG-${id}`} cx="50%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#FFE89A" />
      <stop offset="55%" stopColor="#F5C842" />
      <stop offset="100%" stopColor="#D49B1E" />
    </radialGradient>
    <radialGradient id={`bellyG-${id}`} cx="50%" cy="40%" r="60%">
      <stop offset="0%" stopColor="#FFFAEC" />
      <stop offset="100%" stopColor="#FDE8A0" />
    </radialGradient>
    <radialGradient id={`cheekG-${id}`} cx="50%" cy="50%" r="60%">
      <stop offset="0%" stopColor="#FF8FA3" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#FF6B8A" stopOpacity="0" />
    </radialGradient>
    <linearGradient id={`shineG-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
      <stop offset="100%" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
    <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id={`shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
      <feOffset dx="0" dy="2" />
      <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
      <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

// 햄스터 기본 몸체 (그라데이션 적용)
const Hamster = ({ id, color, headOnly = false, accessory }) => (
  <g filter={`url(#shadow-${id})`}>
    {/* 귀 외곽 */}
    {!headOnly && (
      <>
        <ellipse cx="30" cy="30" rx="13" ry="15" fill={color || `url(#bodyG-${id})`} />
        <ellipse cx="90" cy="30" rx="13" ry="15" fill={color || `url(#bodyG-${id})`} />
        <ellipse cx="30" cy="30" rx="7" ry="9" fill="#FF9AAB" />
        <ellipse cx="90" cy="30" rx="7" ry="9" fill="#FF9AAB" />
      </>
    )}
    {/* 몸통 */}
    {!headOnly && <ellipse cx="60" cy="76" rx="40" ry="32" fill={color || `url(#bodyG-${id})`} />}
    {/* 배 */}
    {!headOnly && <ellipse cx="60" cy="80" rx="24" ry="20" fill={`url(#bellyG-${id})`} />}
    {/* 머리 */}
    <ellipse cx="60" cy="50" rx="36" ry="32" fill={color || `url(#bodyG-${id})`} />
    {/* 머리 하이라이트 */}
    <ellipse cx="50" cy="36" rx="14" ry="8" fill={`url(#shineG-${id})`} />
    {/* 볼터치 */}
    <ellipse cx="32" cy="58" rx="11" ry="8" fill={`url(#cheekG-${id})`} />
    <ellipse cx="88" cy="58" rx="11" ry="8" fill={`url(#cheekG-${id})`} />
    {accessory}
  </g>
);

// 눈 다양화
const SparkleEye = ({ x, y, type = 'normal' }) => {
  if (type === 'heart')
    return (
      <g>
        <path d={`M${x},${y-3} C${x-5},${y-9} ${x-12},${y-3} ${x},${y+6} C${x+12},${y-3} ${x+5},${y-9} ${x},${y-3}Z`}
              fill="#ff3366" filter={`drop-shadow(0 0 2px #ff6b8a)`} />
        <circle cx={x-3} cy={y-3} r="1.5" fill="#fff" opacity="0.9" />
      </g>
    );
  if (type === 'star')
    return (
      <g>
        <path d={`M${x},${y-9} L${x+2.5},${y-3} L${x+9},${y-2} L${x+4},${y+2.5} L${x+5.5},${y+9} L${x},${y+5.5} L${x-5.5},${y+9} L${x-4},${y+2.5} L${x-9},${y-2} L${x-2.5},${y-3}Z`}
              fill="#FFD700" stroke="#FFA500" strokeWidth="0.5" />
        <circle cx={x} cy={y} r="2" fill="#fff" />
      </g>
    );
  if (type === 'closed' || type === 'happy')
    return <path d={`M${x-9},${y+1} Q${x},${y-9} ${x+9},${y+1}`} stroke="#3a2200" strokeWidth="3" fill="none" strokeLinecap="round" />;
  if (type === 'sad')
    return <path d={`M${x-9},${y-1} Q${x},${y+8} ${x+9},${y-1}`} stroke="#3a2200" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  if (type === 'wide')
    return (
      <g>
        <ellipse cx={x} cy={y} rx="9" ry="11" fill="#fff" />
        <circle cx={x} cy={y+1} r="7" fill="#1a0f00" />
        <circle cx={x+2.5} cy={y-2.5} r="2.5" fill="#fff" />
        <circle cx={x-2} cy={y+3} r="1.2" fill="#fff" opacity="0.7" />
      </g>
    );
  if (type === 'sparkle')
    return (
      <g>
        <circle cx={x} cy={y} r="9" fill="#fff" />
        <circle cx={x} cy={y} r="7" fill="#3a2200" />
        <circle cx={x+2} cy={y-2} r="3" fill="#fff" />
        <circle cx={x-3} cy={y+2} r="1.5" fill="#fff" opacity="0.8" />
        <path d={`M${x+5},${y-7} L${x+6},${y-5} L${x+8},${y-4} L${x+6},${y-3} L${x+5},${y-1} L${x+4},${y-3} L${x+2},${y-4} L${x+4},${y-5}Z`}
              fill="#fff" />
      </g>
    );
  if (type === 'dollar')
    return (
      <g>
        <circle cx={x} cy={y} r="9" fill="#fff" />
        <text x={x} y={y+5} textAnchor="middle" fontSize="13" fontWeight="900" fill="#2ecc71">$</text>
      </g>
    );
  if (type === 'spiral')
    return (
      <g>
        <circle cx={x} cy={y} r="9" fill="#fff" />
        <path d={`M${x-5},${y} Q${x},${y-5} ${x+5},${y} Q${x},${y+5} ${x-3},${y} Q${x},${y-2} ${x+2},${y}`}
              stroke="#3a2200" strokeWidth="1.8" fill="none" />
      </g>
    );
  // normal
  return (
    <g>
      <ellipse cx={x} cy={y} rx="7" ry="8.5" fill="#fff" />
      <circle cx={x} cy={y+1} r="5.5" fill="#1a0f00" />
      <circle cx={x+2} cy={y-2} r="2.2" fill="#fff" />
      <circle cx={x-2} cy={y+2.5} r="0.9" fill="#fff" opacity="0.7" />
    </g>
  );
};

const Nose = ({ y = 56 }) => (
  <g>
    <ellipse cx="60" cy={y} rx="5.5" ry="4" fill="#FF6B8A" />
    <ellipse cx="58" cy={y-1} rx="1.5" ry="1" fill="#FFB3C6" />
    <line x1="60" y1={y+4} x2="60" y2={y+9} stroke="#8B3A4F" strokeWidth="1.5" strokeLinecap="round" />
  </g>
);

const Sparkle = ({ x, y, size = 6, color = '#FFD700', delay = 0 }) => (
  <g style={{ animation: `sparkleTwinkle 1.5s infinite ease-in-out ${delay}s` }}>
    <path d={`M${x},${y-size} L${x+size*0.3},${y-size*0.3} L${x+size},${y} L${x+size*0.3},${y+size*0.3} L${x},${y+size} L${x-size*0.3},${y+size*0.3} L${x-size},${y} L${x-size*0.3},${y-size*0.3}Z`}
          fill={color} />
  </g>
);

const Heart = ({ x, y, size = 8, color = '#FF3366', delay = 0 }) => (
  <g style={{ animation: `heartFloat 2s infinite ease-in-out ${delay}s` }}>
    <path d={`M${x},${y+size*0.3} C${x-size},${y-size*0.5} ${x-size*1.4},${y+size*0.5} ${x},${y+size*1.2} C${x+size*1.4},${y+size*0.5} ${x+size},${y-size*0.5} ${x},${y+size*0.3}Z`}
          fill={color} filter="drop-shadow(0 1px 1px rgba(0,0,0,0.2))" />
  </g>
);

// ─── 이모티콘 정의 (20종) ───────────────────────────────────────
export const EMOTICONS = [
  // 1. 사랑 폭발
  {
    id: 'love-explosion', label: '사랑가득',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="love" />
        <radialGradient id="loveBG">
          <stop offset="0%" stopColor="#FFB3D9" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFB3D9" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="55" r="55" fill="url(#loveBG)" />
        <Hamster id="love" />
        <SparkleEye x={44} y={46} type="heart" />
        <SparkleEye x={76} y={46} type="heart" />
        <Nose y={58} />
        <path d="M46,68 Q60,82 74,68" stroke="#C2185B" strokeWidth="3" fill="#FF6B8A" strokeLinecap="round" />
        <Heart x={20} y={15} size={6} color="#FF3366" delay={0} />
        <Heart x={100} y={18} size={5} color="#FF6B8A" delay={0.3} />
        <Heart x={108} y={50} size={4} color="#FF80AB" delay={0.6} />
        <Heart x={15} y={80} size={5} color="#FF4D79" delay={0.9} />
        <Heart x={95} y={95} size={4} color="#FF99B8" delay={1.2} />
        <Heart x={60} y={8} size={7} color="#FF1A4D" delay={0.4} />
      </svg>
    )
  },
  // 2. 무지개 행복
  {
    id: 'rainbow-joy', label: '무지개',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="rainbow" />
        <linearGradient id="rainbowG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF5252" />
          <stop offset="20%" stopColor="#FFB74D" />
          <stop offset="40%" stopColor="#FFEB3B" />
          <stop offset="60%" stopColor="#66BB6A" />
          <stop offset="80%" stopColor="#42A5F5" />
          <stop offset="100%" stopColor="#AB47BC" />
        </linearGradient>
        <path d="M5,80 Q60,5 115,80" stroke="url(#rainbowG)" strokeWidth="14" fill="none" opacity="0.85" />
        <path d="M5,80 Q60,18 115,80" stroke="#fff" strokeWidth="3" fill="none" opacity="0.5" />
        <Hamster id="rainbow" />
        <SparkleEye x={44} y={46} type="sparkle" />
        <SparkleEye x={76} y={46} type="sparkle" />
        <Nose y={58} />
        <path d="M44,66 Q60,82 76,66" stroke="#5a3e1b" strokeWidth="2.5" fill="#FF6B8A" strokeLinecap="round" />
        <Sparkle x={12} y={20} size={5} color="#FFD700" delay={0} />
        <Sparkle x={105} y={25} size={6} color="#FF80AB" delay={0.3} />
        <Sparkle x={100} y={88} size={4} color="#7EC8F7" delay={0.6} />
        <Sparkle x={15} y={92} size={5} color="#A78BFA" delay={0.9} />
      </svg>
    )
  },
  // 3. 폭소
  {
    id: 'laugh-tears', label: '빵터짐',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="laugh" />
        <Hamster id="laugh" />
        <SparkleEye x={44} y={46} type="closed" />
        <SparkleEye x={76} y={46} type="closed" />
        <Nose y={56} />
        {/* 큰 입 */}
        <path d="M40,62 Q60,90 80,62 Q70,72 60,72 Q50,72 40,62Z" fill="#5a3e1b" />
        <path d="M44,68 Q60,82 76,68 Q70,78 60,78 Q50,78 44,68Z" fill="#FF6B8A" />
        <ellipse cx="60" cy="80" rx="4" ry="2" fill="#E91E63" />
        {/* 눈물 폭포 */}
        <path d="M32,52 Q28,62 26,72 Q25,80 31,82 Q37,80 36,72 Q34,62 32,52Z" fill="#7EC8F7" opacity="0.9" />
        <path d="M88,52 Q92,62 94,72 Q95,80 89,82 Q83,80 84,72 Q86,62 88,52Z" fill="#7EC8F7" opacity="0.9" />
        <circle cx="31" cy="85" r="3" fill="#7EC8F7" opacity="0.7" />
        <circle cx="89" cy="85" r="3" fill="#7EC8F7" opacity="0.7" />
        {/* 웃음 효과 */}
        <text x="6" y="20" fontSize="13" fontWeight="900" fill="#FFB74D">ㅋㅋㅋ</text>
        <text x="86" y="14" fontSize="11" fontWeight="900" fill="#FF6B8A">ㅎㅎ</text>
        <text x="92" y="30" fontSize="9" fontWeight="900" fill="#7EC8F7">!!</text>
      </svg>
    )
  },
  // 4. 펑펑 울음
  {
    id: 'cry-waterfall', label: '펑펑',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="cry" />
        <Hamster id="cry" />
        {/* 처진 눈썹 */}
        <path d="M34,36 Q44,42 52,40" stroke="#5a3e1b" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M68,40 Q76,42 86,36" stroke="#5a3e1b" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* 눈 (꼭 감음) */}
        <path d="M36,48 Q44,42 52,48" stroke="#3a2200" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M68,48 Q76,42 84,48" stroke="#3a2200" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Nose y={58} />
        <path d="M48,72 Q60,66 72,72" stroke="#5a3e1b" strokeWidth="2.5" fill="#FF6B8A" strokeLinecap="round" />
        {/* 큰 눈물 폭포 */}
        <path d="M38,50 Q33,68 30,85 Q28,95 36,98 Q44,95 42,85 Q40,68 38,50Z" fill="#5DADE2" opacity="0.9" />
        <path d="M82,50 Q87,68 90,85 Q92,95 84,98 Q76,95 78,85 Q80,68 82,50Z" fill="#5DADE2" opacity="0.9" />
        {/* 광택 */}
        <ellipse cx="36" cy="65" rx="2" ry="5" fill="#fff" opacity="0.5" />
        <ellipse cx="84" cy="65" rx="2" ry="5" fill="#fff" opacity="0.5" />
        {/* 빗방울 */}
        <ellipse cx="20" cy="90" rx="2" ry="3" fill="#7EC8F7" />
        <ellipse cx="100" cy="92" rx="2" ry="3" fill="#7EC8F7" />
        <text x="42" y="14" fontSize="11" fontWeight="900" fill="#5DADE2">엉엉ㅠ</text>
      </svg>
    )
  },
  // 5. 분노 폭발
  {
    id: 'angry-fire', label: '폭발화남',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="angry" />
        <radialGradient id="fireG">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FF4500" />
          <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="55" r="58" fill="url(#fireG)" opacity="0.5" />
        <Hamster id="angry" color="#FF6347" />
        {/* 분노 눈썹 */}
        <path d="M34,36 L52,42 L52,46 L34,40Z" fill="#3a2200" />
        <path d="M86,36 L68,42 L68,46 L86,40Z" fill="#3a2200" />
        {/* 화난 눈 */}
        <SparkleEye x={44} y={50} type="normal" />
        <SparkleEye x={76} y={50} type="normal" />
        <Nose y={60} />
        {/* 으르렁 입 */}
        <path d="M42,72 L48,68 L52,72 L56,68 L60,72 L64,68 L68,72 L72,68 L78,72 Q70,80 60,80 Q50,80 42,72Z"
              fill="#3a2200" />
        <polygon points="48,72 52,68 50,72" fill="#fff" />
        <polygon points="68,72 72,68 70,72" fill="#fff" />
        {/* 분노 기호 */}
        <g transform="translate(94,8)">
          <path d="M10,0 Q12,8 10,15 Q4,10 0,12 Q4,6 0,2 Q6,4 4,-4 Q8,2 14,-2 Q10,4 16,8 Q10,8 10,0Z" fill="#FF1744" />
        </g>
        <g transform="translate(8,14)">
          <path d="M8,0 Q10,6 8,12 Q4,8 0,10 Q3,5 0,2 Q5,3 3,-3 Q6,2 12,-1 Q8,3 13,6 Q8,6 8,0Z" fill="#FF1744" />
        </g>
        {/* 김 모락모락 */}
        <path d="M40,18 Q42,12 40,8 Q38,12 36,8" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.7" />
        <path d="M80,18 Q82,12 80,8 Q78,12 76,8" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.7" />
      </svg>
    )
  },
  // 6. 깜짝 놀람
  {
    id: 'shocked', label: '경악',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="shock" />
        <Hamster id="shock" />
        <SparkleEye x={44} y={46} type="wide" />
        <SparkleEye x={76} y={46} type="wide" />
        <Nose y={62} />
        {/* 동그란 입 (놀란 입) */}
        <ellipse cx="60" cy="74" rx="8" ry="10" fill="#3a2200" />
        <ellipse cx="60" cy="74" rx="5" ry="7" fill="#FF6B8A" />
        {/* 땀방울 */}
        <path d="M98,28 Q96,40 94,50 Q92,58 100,58 Q108,58 106,50 Q104,40 102,28Z" fill="#5DADE2" />
        <ellipse cx="100" cy="40" rx="1.5" ry="3" fill="#fff" opacity="0.6" />
        {/* 충격 라인 */}
        <line x1="20" y1="20" x2="28" y2="28" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="40" x2="22" y2="42" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
        <line x1="22" y1="60" x2="30" y2="56" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
        <text x="80" y="14" fontSize="14" fontWeight="900" fill="#FF1744">!?</text>
      </svg>
    )
  },
  // 7. 별빛 잠
  {
    id: 'sleepy-stars', label: '잠자기',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="sleep" />
        <radialGradient id="moonG">
          <stop offset="0%" stopColor="#FFF59D" />
          <stop offset="100%" stopColor="#FFEB3B" stopOpacity="0" />
        </radialGradient>
        <circle cx="100" cy="20" r="20" fill="url(#moonG)" />
        <circle cx="100" cy="20" r="9" fill="#FFF59D" />
        <circle cx="96" cy="17" r="2" fill="#FFD54F" opacity="0.6" />
        <circle cx="103" cy="22" r="1.5" fill="#FFD54F" opacity="0.6" />
        {/* 별 */}
        <Sparkle x={15} y={15} size={3} color="#FFD700" delay={0} />
        <Sparkle x={28} y={35} size={2.5} color="#FFC107" delay={0.4} />
        <Sparkle x={10} y={50} size={3} color="#FFE082" delay={0.8} />
        <Sparkle x={18} y={75} size={2} color="#FFD700" delay={0.2} />
        <Sparkle x={75} y={10} size={2.5} color="#FFC107" delay={0.6} />
        <Hamster id="sleep" />
        <SparkleEye x={44} y={48} type="closed" />
        <SparkleEye x={76} y={48} type="closed" />
        <Nose y={58} />
        <path d="M50,66 Q60,72 70,66" stroke="#5a3e1b" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* 콧물 방울 (자는 표현) */}
        <ellipse cx="60" cy="72" rx="3" ry="5" fill="#7EC8F7" opacity="0.6" />
        {/* ZZZ */}
        <text x="78" y="44" fontSize="18" fontWeight="900" fill="#5DADE2" fontStyle="italic">Z</text>
        <text x="92" y="32" fontSize="14" fontWeight="900" fill="#7EC8F7" fontStyle="italic">z</text>
        <text x="103" y="22" fontSize="9" fontWeight="900" fill="#A0D8FF" fontStyle="italic">z</text>
      </svg>
    )
  },
  // 8. 부끄러움
  {
    id: 'blush', label: '수줍',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="blush" />
        <radialGradient id="blushBG">
          <stop offset="0%" stopColor="#FFB3D9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFB3D9" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="60" r="55" fill="url(#blushBG)" />
        <Hamster id="blush" />
        <SparkleEye x={44} y={48} type="closed" />
        <SparkleEye x={76} y={48} type="closed" />
        <Nose y={58} />
        {/* 작은 미소 */}
        <path d="M52,68 Q60,72 68,68" stroke="#5a3e1b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* 진한 볼터치 */}
        <ellipse cx="30" cy="60" rx="14" ry="9" fill="#FF1744" opacity="0.35" />
        <ellipse cx="90" cy="60" rx="14" ry="9" fill="#FF1744" opacity="0.35" />
        <ellipse cx="30" cy="60" rx="9" ry="6" fill="#FF1744" opacity="0.5" />
        <ellipse cx="90" cy="60" rx="9" ry="6" fill="#FF1744" opacity="0.5" />
        {/* 손으로 가린 모양 */}
        <path d="M14,62 Q22,58 30,62 L32,76 Q22,80 14,76Z" fill="url(#bodyG-blush)" stroke="#D49B1E" strokeWidth="1" />
        <path d="M88,62 Q98,58 106,62 L104,76 Q98,80 88,76Z" fill="url(#bodyG-blush)" stroke="#D49B1E" strokeWidth="1" />
        <Heart x={20} y={20} size={4} color="#FF80AB" delay={0} />
        <Heart x={100} y={25} size={4} color="#FFB3C6" delay={0.5} />
      </svg>
    )
  },
  // 9. 쿨가이
  {
    id: 'cool-shine', label: '쿨가이',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="cool" />
        <linearGradient id="sunglassG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#212121" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <Hamster id="cool" />
        {/* 선글라스 */}
        <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))">
          <rect x="22" y="38" width="30" height="16" rx="8" fill="url(#sunglassG)" />
          <rect x="68" y="38" width="30" height="16" rx="8" fill="url(#sunglassG)" />
          <line x1="52" y1="46" x2="68" y2="46" stroke="#000" strokeWidth="4" />
          {/* 광택 */}
          <ellipse cx="32" cy="44" rx="6" ry="3" fill="#fff" opacity="0.7" />
          <ellipse cx="78" cy="44" rx="6" ry="3" fill="#fff" opacity="0.7" />
          {/* 안경다리 */}
          <line x1="22" y1="46" x2="14" y2="44" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <line x1="98" y1="46" x2="106" y2="44" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </g>
        <Nose y={60} />
        {/* 비웃는 미소 */}
        <path d="M48,68 Q56,76 60,72 Q64,76 72,68" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 반짝임 */}
        <Sparkle x={10} y={20} size={5} color="#FFD700" delay={0} />
        <Sparkle x={108} y={28} size={4} color="#FF80AB" delay={0.5} />
        <Sparkle x={15} y={90} size={3} color="#7EC8F7" delay={0.8} />
        <text x="2" y="100" fontSize="9" fontWeight="900" fill="#9C27B0" fontStyle="italic">쿨~</text>
      </svg>
    )
  },
  // 10. 응원 (불꽃 주먹)
  {
    id: 'fighting', label: '파이팅',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="fight" />
        <radialGradient id="fireBG">
          <stop offset="0%" stopColor="#FF9800" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF5722" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="55" r="50" fill="url(#fireBG)" />
        <Hamster id="fight" />
        <SparkleEye x={44} y={46} type="happy" />
        <SparkleEye x={76} y={46} type="happy" />
        <Nose y={58} />
        <path d="M44,66 Q60,82 76,66" stroke="#5a3e1b" strokeWidth="2.5" fill="#FF6B8A" strokeLinecap="round" />
        {/* 주먹 */}
        <g transform="translate(82,52) rotate(-30)">
          <ellipse cx="0" cy="0" rx="14" ry="11" fill="url(#bodyG-fight)" stroke="#D49B1E" strokeWidth="1.5" />
          <path d="M-5,-3 Q-5,0 -2,2 M0,-4 Q0,0 3,2 M5,-3 Q5,0 8,2" stroke="#8B6914" strokeWidth="1.2" fill="none" />
        </g>
        {/* 불꽃 */}
        <g transform="translate(95,40)">
          <path d="M0,0 Q-3,-8 0,-15 Q3,-10 5,-6 Q3,-2 0,0Z" fill="#FFB74D" />
          <path d="M0,0 Q-2,-6 0,-11 Q2,-7 3,-4 Q2,-1 0,0Z" fill="#FF5722" />
        </g>
        {/* 헤어밴드 */}
        <path d="M28,30 Q60,18 92,30 L92,36 Q60,24 28,36Z" fill="#FF1744" />
        <circle cx="60" cy="26" r="4" fill="#fff" />
        <text x="55" y="29" fontSize="8" fontWeight="900" fill="#FF1744">필승</text>
        <text x="6" y="100" fontSize="11" fontWeight="900" fill="#FF5722">파이팅!</text>
      </svg>
    )
  },
  // 11. 생각중
  {
    id: 'thinking-deep', label: '고민중',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="think" />
        <Hamster id="think" />
        <SparkleEye x={44} y={46} type="normal" />
        <SparkleEye x={76} y={48} type="closed" />
        <Nose y={58} />
        <path d="M50,68 Q56,66 64,68" stroke="#5a3e1b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* 손 (턱 괴기) */}
        <ellipse cx="76" cy="74" rx="13" ry="9" fill="url(#bodyG-think)" stroke="#D49B1E" strokeWidth="1.2" />
        <path d="M68,72 Q72,76 76,76 M72,68 Q76,72 80,72" stroke="#8B6914" strokeWidth="1" fill="none" />
        {/* 생각 말풍선 */}
        <circle cx="100" cy="80" r="3" fill="#fff" stroke="#9E9E9E" strokeWidth="1" />
        <circle cx="105" cy="65" r="5" fill="#fff" stroke="#9E9E9E" strokeWidth="1" />
        <ellipse cx="100" cy="40" rx="18" ry="14" fill="#fff" stroke="#9E9E9E" strokeWidth="1.5" />
        <text x="100" y="46" textAnchor="middle" fontSize="16" fontWeight="900" fill="#5C6BC0">?</text>
        {/* 작은 점 */}
        <circle cx="115" cy="35" r="1.5" fill="#9E9E9E" />
        <circle cx="88" cy="32" r="1.5" fill="#9E9E9E" />
      </svg>
    )
  },
  // 12. 최고 (트로피)
  {
    id: 'champion', label: '챔피언',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="champ" />
        <linearGradient id="goldG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>
        <radialGradient id="champBG">
          <stop offset="0%" stopColor="#FFF59D" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFC107" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="55" r="55" fill="url(#champBG)" />
        {/* 광선 */}
        <g opacity="0.4">
          <polygon points="60,10 56,30 64,30" fill="#FFD700" />
          <polygon points="60,100 56,80 64,80" fill="#FFD700" />
          <polygon points="10,55 30,51 30,59" fill="#FFD700" />
          <polygon points="110,55 90,51 90,59" fill="#FFD700" />
        </g>
        <Hamster id="champ" />
        <SparkleEye x={44} y={46} type="star" />
        <SparkleEye x={76} y={46} type="star" />
        <Nose y={58} />
        <path d="M44,66 Q60,82 76,66" stroke="#5a3e1b" strokeWidth="2.5" fill="#FF6B8A" strokeLinecap="round" />
        {/* 왕관 */}
        <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))">
          <path d="M30,24 L36,12 L48,22 L60,8 L72,22 L84,12 L90,24 L90,32 L30,32Z" fill="url(#goldG)" stroke="#B8860B" strokeWidth="1" />
          <circle cx="60" cy="20" r="3" fill="#E91E63" />
          <circle cx="42" cy="24" r="2" fill="#3F51B5" />
          <circle cx="78" cy="24" r="2" fill="#4CAF50" />
        </g>
        <Sparkle x={15} y={15} size={4} color="#FFD700" delay={0} />
        <Sparkle x={108} y={20} size={5} color="#FFC107" delay={0.4} />
        <Sparkle x={12} y={85} size={3} color="#FFEB3B" delay={0.8} />
        <text x="22" y="103" fontSize="11" fontWeight="900" fill="#FFA000">CHAMPION!</text>
      </svg>
    )
  },
  // 13. 파티
  {
    id: 'party-blast', label: '축하파티',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="party" />
        <radialGradient id="partyBG">
          <stop offset="0%" stopColor="#FFE0B2" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFE0B2" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="55" r="55" fill="url(#partyBG)" />
        {/* 색종이 */}
        <rect x="10" y="10" width="6" height="6" fill="#FF6B6B" transform="rotate(20,13,13)" />
        <rect x="100" y="14" width="5" height="5" fill="#4ECDC4" transform="rotate(-15,102,16)" />
        <rect x="15" y="40" width="5" height="5" fill="#FFE66D" transform="rotate(45,17,42)" />
        <rect x="105" y="50" width="6" height="6" fill="#A78BFA" transform="rotate(30,108,53)" />
        <rect x="8" y="70" width="4" height="4" fill="#FF80AB" transform="rotate(-25,10,72)" />
        <rect x="102" y="85" width="5" height="5" fill="#66BB6A" transform="rotate(50,104,87)" />
        <circle cx="25" cy="20" r="2.5" fill="#FF1744" />
        <circle cx="95" cy="30" r="2" fill="#7C4DFF" />
        <circle cx="30" cy="85" r="2.5" fill="#00E676" />
        {/* 곡선 리본 */}
        <path d="M6,25 Q15,15 25,25 Q35,35 45,25" stroke="#FF80AB" strokeWidth="2" fill="none" />
        <path d="M75,15 Q85,25 95,15 Q105,5 114,15" stroke="#7C4DFF" strokeWidth="2" fill="none" />
        <Hamster id="party" />
        <SparkleEye x={44} y={48} type="happy" />
        <SparkleEye x={76} y={48} type="happy" />
        <Nose y={60} />
        <path d="M42,68 Q60,86 78,68" stroke="#5a3e1b" strokeWidth="2.5" fill="#FF6B8A" strokeLinecap="round" />
        {/* 파티 모자 (콘) */}
        <linearGradient id="hatG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4081" />
          <stop offset="50%" stopColor="#E91E63" />
          <stop offset="100%" stopColor="#9C27B0" />
        </linearGradient>
        <polygon points="60,2 42,38 78,38" fill="url(#hatG)" stroke="#C2185B" strokeWidth="1" />
        <polygon points="60,2 42,38 50,38" fill="#fff" opacity="0.2" />
        <circle cx="60" cy="2" r="4" fill="#FFD700" />
        <line x1="60" y1="38" x2="50" y2="32" stroke="#FFD700" strokeWidth="2" />
        <line x1="60" y1="38" x2="70" y2="32" stroke="#FFD700" strokeWidth="2" />
        <circle cx="48" cy="22" r="2" fill="#FFD700" />
        <circle cx="72" cy="28" r="2" fill="#fff" />
        <text x="40" y="103" fontSize="11" fontWeight="900" fill="#E91E63">축하해!</text>
      </svg>
    )
  },
  // 14. 슬픔
  {
    id: 'sad-rain', label: '먹구름',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="sad" />
        {/* 먹구름 */}
        <g opacity="0.85">
          <ellipse cx="35" cy="14" rx="14" ry="8" fill="#90A4AE" />
          <ellipse cx="55" cy="10" rx="16" ry="10" fill="#78909C" />
          <ellipse cx="75" cy="12" rx="14" ry="9" fill="#90A4AE" />
          <ellipse cx="62" cy="18" rx="22" ry="10" fill="#607D8B" />
        </g>
        {/* 비 */}
        <line x1="32" y1="24" x2="28" y2="34" stroke="#5DADE2" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="26" x2="44" y2="38" stroke="#5DADE2" strokeWidth="2" strokeLinecap="round" />
        <line x1="64" y1="28" x2="60" y2="40" stroke="#5DADE2" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="26" x2="76" y2="38" stroke="#5DADE2" strokeWidth="2" strokeLinecap="round" />
        <line x1="92" y1="24" x2="88" y2="34" stroke="#5DADE2" strokeWidth="2" strokeLinecap="round" />
        <Hamster id="sad" color="#D49B1E" />
        {/* 처진 눈썹 */}
        <path d="M34,42 Q44,48 52,44" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M68,44 Q76,48 86,42" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <SparkleEye x={44} y={54} type="sad" />
        <SparkleEye x={76} y={54} type="sad" />
        <Nose y={62} />
        <path d="M48,76 Q60,68 72,76" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 한 줄기 눈물 */}
        <path d="M40,58 Q39,68 38,76 Q37,82 42,82 Q46,80 44,76 Q42,68 40,58Z" fill="#5DADE2" opacity="0.85" />
      </svg>
    )
  },
  // 15. 천사
  {
    id: 'angel', label: '천사',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="angel" />
        <radialGradient id="haloG">
          <stop offset="0%" stopColor="#FFF59D" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FFEB3B" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFEB3B" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="55" r="58" fill="url(#haloG)" opacity="0.6" />
        {/* 천사 후광 */}
        <ellipse cx="60" cy="12" rx="22" ry="6" fill="none" stroke="#FFD700" strokeWidth="3" />
        <ellipse cx="60" cy="12" rx="20" ry="4.5" fill="none" stroke="#FFEB3B" strokeWidth="1.5" />
        {/* 날개 */}
        <g filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))">
          <path d="M8,55 Q-2,40 6,28 Q14,38 22,46 Q28,52 22,58 Q14,62 8,55Z" fill="#fff" stroke="#E1F5FE" strokeWidth="1.5" />
          <path d="M112,55 Q122,40 114,28 Q106,38 98,46 Q92,52 98,58 Q106,62 112,55Z" fill="#fff" stroke="#E1F5FE" strokeWidth="1.5" />
          <path d="M10,42 Q12,38 16,40 M14,48 Q18,46 20,50" stroke="#B3E5FC" strokeWidth="1" fill="none" />
          <path d="M110,42 Q108,38 104,40 M106,48 Q102,46 100,50" stroke="#B3E5FC" strokeWidth="1" fill="none" />
        </g>
        <Hamster id="angel" />
        <SparkleEye x={44} y={48} type="happy" />
        <SparkleEye x={76} y={48} type="happy" />
        <Nose y={58} />
        <path d="M48,66 Q60,76 72,66" stroke="#5a3e1b" strokeWidth="2.5" fill="#FF6B8A" strokeLinecap="round" />
        <Sparkle x={14} y={20} size={3} color="#FFD700" delay={0} />
        <Sparkle x={104} y={26} size={4} color="#FFEB3B" delay={0.4} />
        <Sparkle x={20} y={92} size={3} color="#FFC107" delay={0.8} />
      </svg>
    )
  },
  // 16. 마법사
  {
    id: 'wizard', label: '마법사',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="wiz" />
        <linearGradient id="wizHat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7C4DFF" />
          <stop offset="100%" stopColor="#311B92" />
        </linearGradient>
        <radialGradient id="magicG">
          <stop offset="0%" stopColor="#E1BEE7" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="55" r="55" fill="url(#magicG)" />
        <Hamster id="wiz" />
        <SparkleEye x={44} y={52} type="sparkle" />
        <SparkleEye x={76} y={52} type="sparkle" />
        <Nose y={62} />
        <path d="M48,70 Q60,78 72,70" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 마법사 모자 */}
        <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))">
          <path d="M60,0 L40,40 L80,40Z" fill="url(#wizHat)" />
          <path d="M60,0 L45,30 L65,40Z" fill="#fff" opacity="0.15" />
          <ellipse cx="60" cy="40" rx="22" ry="4" fill="#311B92" />
          <ellipse cx="60" cy="40" rx="22" ry="2" fill="#FFD700" />
          {/* 별 장식 */}
          <path d="M55,22 L57,17 L59,22 L64,23 L60,26 L61,31 L57,28 L53,31 L54,26 L50,23Z" fill="#FFD700" />
          <circle cx="60" cy="2" r="3" fill="#FFD700" />
        </g>
        {/* 마법 별 */}
        <Sparkle x={14} y={26} size={4} color="#E1BEE7" delay={0} />
        <Sparkle x={104} y={50} size={5} color="#FFD700" delay={0.3} />
        <Sparkle x={16} y={80} size={3} color="#7C4DFF" delay={0.6} />
        <Sparkle x={100} y={88} size={4} color="#AB47BC" delay={0.9} />
        <Sparkle x={108} y={20} size={3} color="#fff" delay={0.4} />
      </svg>
    )
  },
  // 17. 공주
  {
    id: 'princess', label: '공주님',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="prince" />
        <linearGradient id="crownG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>
        <radialGradient id="pinkBG">
          <stop offset="0%" stopColor="#F8BBD0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#F8BBD0" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="55" r="55" fill="url(#pinkBG)" />
        <Hamster id="prince" />
        <SparkleEye x={44} y={50} type="sparkle" />
        <SparkleEye x={76} y={50} type="sparkle" />
        <Nose y={60} />
        {/* 큰 미소 + 립스틱 */}
        <path d="M44,68 Q60,84 76,68" stroke="#C2185B" strokeWidth="2.5" fill="#E91E63" strokeLinecap="round" />
        <ellipse cx="60" cy="74" rx="3" ry="1.5" fill="#FFB3D9" />
        {/* 티아라 */}
        <g filter="drop-shadow(0 2px 2px rgba(0,0,0,0.25))">
          <path d="M28,28 L36,18 L44,26 L52,14 L60,8 L68,14 L76,26 L84,18 L92,28 L92,32 L28,32Z"
                fill="url(#crownG)" stroke="#FFA000" strokeWidth="1.2" />
          {/* 보석 */}
          <circle cx="60" cy="14" r="4" fill="#E91E63" stroke="#fff" strokeWidth="1" />
          <ellipse cx="60" cy="13" rx="1.5" ry="1" fill="#fff" opacity="0.8" />
          <circle cx="44" cy="24" r="2.5" fill="#7C4DFF" />
          <circle cx="76" cy="24" r="2.5" fill="#00BCD4" />
          <circle cx="36" cy="22" r="1.8" fill="#4CAF50" />
          <circle cx="84" cy="22" r="1.8" fill="#FF5722" />
        </g>
        {/* 진주 목걸이 */}
        <circle cx="60" cy="98" r="3" fill="#fff" stroke="#FFE082" strokeWidth="1" />
        <circle cx="52" cy="96" r="2.5" fill="#FCE4EC" stroke="#FFE082" strokeWidth="0.8" />
        <circle cx="68" cy="96" r="2.5" fill="#FCE4EC" stroke="#FFE082" strokeWidth="0.8" />
        <Heart x={14} y={20} size={4} color="#E91E63" delay={0} />
        <Heart x={104} y={30} size={5} color="#FF80AB" delay={0.4} />
        <Sparkle x={108} y={70} size={3} color="#FFD700" delay={0.7} />
      </svg>
    )
  },
  // 18. 안아줘
  {
    id: 'hug-warm', label: '안아줘',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="hug" />
        <radialGradient id="warmG">
          <stop offset="0%" stopColor="#FFCCBC" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFCCBC" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="55" r="55" fill="url(#warmG)" />
        <Hamster id="hug" />
        {/* 살짝 감은 눈 */}
        <SparkleEye x={44} y={48} type="closed" />
        <SparkleEye x={76} y={48} type="closed" />
        <Nose y={58} />
        <path d="M48,68 Q60,76 72,68" stroke="#5a3e1b" strokeWidth="2.5" fill="#FF6B8A" strokeLinecap="round" />
        {/* 양팔 벌리기 */}
        <g filter="drop-shadow(0 2px 2px rgba(0,0,0,0.15))">
          <path d="M22,68 Q4,60 6,42 Q12,32 22,40 Q28,46 28,55Z" fill="url(#bodyG-hug)" stroke="#D49B1E" strokeWidth="1.5" />
          <ellipse cx="14" cy="44" rx="6" ry="7" fill="url(#bodyG-hug)" stroke="#D49B1E" strokeWidth="1.2" />
          <path d="M98,68 Q116,60 114,42 Q108,32 98,40 Q92,46 92,55Z" fill="url(#bodyG-hug)" stroke="#D49B1E" strokeWidth="1.5" />
          <ellipse cx="106" cy="44" rx="6" ry="7" fill="url(#bodyG-hug)" stroke="#D49B1E" strokeWidth="1.2" />
        </g>
        <Heart x={20} y={18} size={5} color="#FF6B8A" delay={0} />
        <Heart x={60} y={6} size={6} color="#FF3366" delay={0.4} />
        <Heart x={100} y={18} size={5} color="#FF80AB" delay={0.7} />
        <text x="36" y="105" fontSize="11" fontWeight="900" fill="#E91E63">안아줘~♥</text>
      </svg>
    )
  },
  // 19. 음악
  {
    id: 'music', label: '음악',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="music" />
        <radialGradient id="musicBG">
          <stop offset="0%" stopColor="#CE93D8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#CE93D8" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="55" r="55" fill="url(#musicBG)" />
        <Hamster id="music" />
        <SparkleEye x={44} y={46} type="closed" />
        <SparkleEye x={76} y={46} type="closed" />
        <Nose y={58} />
        <path d="M46,66 Q60,78 74,66" stroke="#5a3e1b" strokeWidth="2.5" fill="#FF6B8A" strokeLinecap="round" />
        {/* 헤드폰 */}
        <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))">
          <path d="M22,46 Q22,18 60,18 Q98,18 98,46" stroke="#424242" strokeWidth="6" fill="none" />
          <rect x="14" y="40" width="14" height="22" rx="6" fill="#7C4DFF" stroke="#311B92" strokeWidth="1.5" />
          <rect x="92" y="40" width="14" height="22" rx="6" fill="#7C4DFF" stroke="#311B92" strokeWidth="1.5" />
          <circle cx="21" cy="51" r="4" fill="#311B92" />
          <circle cx="99" cy="51" r="4" fill="#311B92" />
          <circle cx="21" cy="51" r="1.5" fill="#7C4DFF" />
          <circle cx="99" cy="51" r="1.5" fill="#7C4DFF" />
        </g>
        {/* 음표 */}
        <g transform="translate(10,15)">
          <circle cx="0" cy="8" r="3" fill="#E91E63" />
          <path d="M3,8 L3,-4 L11,-2 L11,4" stroke="#E91E63" strokeWidth="2" fill="none" />
          <path d="M3,-4 L11,-2 L11,2 L3,0Z" fill="#E91E63" />
        </g>
        <g transform="translate(98,10)">
          <circle cx="0" cy="8" r="2.5" fill="#3F51B5" />
          <line x1="2.5" y1="8" x2="2.5" y2="-2" stroke="#3F51B5" strokeWidth="2" />
        </g>
        <g transform="translate(15,85)">
          <circle cx="0" cy="6" r="2.5" fill="#4CAF50" />
          <line x1="2.5" y1="6" x2="2.5" y2="-3" stroke="#4CAF50" strokeWidth="2" />
        </g>
        <g transform="translate(102,86)">
          <circle cx="0" cy="6" r="2.5" fill="#FF5722" />
          <line x1="2.5" y1="6" x2="2.5" y2="-3" stroke="#FF5722" strokeWidth="2" />
        </g>
        <text x="40" y="105" fontSize="10" fontWeight="900" fill="#9C27B0">♪ ♫ ♪</text>
      </svg>
    )
  },
  // 20. 게임
  {
    id: 'gaming-rgb', label: '게이머',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Defs id="game" />
        <linearGradient id="rgbG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF1744" />
          <stop offset="33%" stopColor="#00E676" />
          <stop offset="66%" stopColor="#2979FF" />
          <stop offset="100%" stopColor="#D500F9" />
        </linearGradient>
        <radialGradient id="gameBG">
          <stop offset="0%" stopColor="#311B92" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#311B92" stopOpacity="0" />
        </radialGradient>
        <circle cx="60" cy="55" r="55" fill="url(#gameBG)" />
        <Hamster id="game" />
        <SparkleEye x={44} y={44} type="star" />
        <SparkleEye x={76} y={44} type="star" />
        <Nose y={56} />
        <path d="M46,64 Q60,80 74,64" stroke="#5a3e1b" strokeWidth="2.5" fill="#FF6B8A" strokeLinecap="round" />
        {/* 컨트롤러 */}
        <g filter="drop-shadow(0 3px 4px rgba(0,0,0,0.3))">
          <path d="M16,74 Q12,90 24,98 L42,96 L48,86 L72,86 L78,96 L96,98 Q108,90 104,74 Q98,68 88,72 Q60,80 32,72 Q22,68 16,74Z"
                fill="#1A1A2E" stroke="#0F0F1E" strokeWidth="1.5" />
          {/* RGB 라인 */}
          <path d="M22,80 L98,80" stroke="url(#rgbG)" strokeWidth="2" />
          {/* D-Pad */}
          <rect x="28" y="85" width="14" height="4" rx="1" fill="#444" />
          <rect x="33" y="80" width="4" height="14" rx="1" fill="#444" />
          {/* 버튼 */}
          <circle cx="86" cy="84" r="3.5" fill="#FF1744" stroke="#fff" strokeWidth="0.8" />
          <circle cx="94" cy="91" r="3.5" fill="#2979FF" stroke="#fff" strokeWidth="0.8" />
          <circle cx="86" cy="98" r="3.5" fill="#00E676" stroke="#fff" strokeWidth="0.8" />
          <circle cx="78" cy="91" r="3.5" fill="#FFD600" stroke="#fff" strokeWidth="0.8" />
          {/* 작은 LED */}
          <circle cx="60" cy="76" r="1.5" fill="#00E676">
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
          </circle>
        </g>
        <text x="34" y="14" fontSize="10" fontWeight="900" fill="url(#rgbG)">LEVEL UP!</text>
        <Sparkle x={12} y={32} size={3} color="#00E676" delay={0} />
        <Sparkle x={108} y={34} size={3} color="#FF1744" delay={0.4} />
      </svg>
    )
  },
];

export default function EmoticonSticker({ emoticonId, size = 150 }) {
  const emoticon = EMOTICONS.find(e => e.id === emoticonId);
  if (!emoticon) return null;
  return (
    <div className="emoticon-sticker" style={{ width: size, height: size * 0.92, display: 'inline-block' }}>
      {emoticon.svg}
    </div>
  );
}
