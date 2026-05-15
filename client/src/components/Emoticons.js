import React from 'react';

// ─── 공통 파츠 ───────────────────────────────────────────────
const Body = ({ color = '#F5C842', cheek = '#F08080' }) => (
  <>
    {/* 몸통 */}
    <ellipse cx="60" cy="72" rx="38" ry="30" fill={color} />
    {/* 배 */}
    <ellipse cx="60" cy="76" rx="22" ry="18" fill="#FDE8A0" />
    {/* 귀 */}
    <ellipse cx="28" cy="28" rx="12" ry="14" fill={color} />
    <ellipse cx="92" cy="28" rx="12" ry="14" fill={color} />
    <ellipse cx="28" cy="28" rx="7" ry="9" fill="#F4A0A0" />
    <ellipse cx="92" cy="28" rx="7" ry="9" fill="#F4A0A0" />
    {/* 볼 터치 */}
    <ellipse cx="36" cy="60" rx="10" ry="7" fill={cheek} opacity="0.55" />
    <ellipse cx="84" cy="60" rx="10" ry="7" fill={cheek} opacity="0.55" />
  </>
);

const Head = ({ color = '#F5C842' }) => (
  <ellipse cx="60" cy="50" rx="34" ry="30" fill={color} />
);

const Eye = ({ x, y, open = true, heart = false, star = false, closed = false, wink = false }) => {
  if (heart)
    return <text x={x - 8} y={y + 6} fontSize="16" fill="#e74c3c">♥</text>;
  if (star)
    return <text x={x - 8} y={y + 6} fontSize="16" fill="#f39c12">★</text>;
  if (closed || wink)
    return <path d={`M${x - 8},${y} Q${x},${y - 8} ${x + 8},${y}`} stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  return (
    <g>
      <circle cx={x} cy={y} r="8" fill="#fff" />
      <circle cx={x} cy={y} r="5" fill="#3a2200" />
      <circle cx={x + 2} cy={y - 2} r="1.8" fill="#fff" />
    </g>
  );
};

const Nose = ({ y = 55 }) => (
  <>
    <ellipse cx="60" cy={y} rx="5" ry="3.5" fill="#e07070" />
    <line x1="60" y1={y + 3.5} x2="60" y2={y + 8} stroke="#e07070" strokeWidth="1.5" />
  </>
);

// ─── 이모티콘 정의 ───────────────────────────────────────────
export const EMOTICONS = [
  {
    id: 'happy', label: '행복',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body /><Head />
        <Eye x={44} y={44} /><Eye x={76} y={44} />
        <Nose />
        <path d="M46,65 Q60,78 74,65" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'love', label: '사랑',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body cheek="#FF6B8A" /><Head color="#F5C842" />
        <Eye x={44} y={44} heart /><Eye x={76} y={44} heart />
        <Nose />
        <path d="M47,65 Q60,78 73,65" stroke="#e74c3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <text x="50" y="20" fontSize="12" fill="#e74c3c">♥</text>
        <text x="68" y="15" fontSize="9" fill="#e74c3c">♥</text>
        <text x="38" y="16" fontSize="9" fill="#e74c3c">♥</text>
      </svg>
    )
  },
  {
    id: 'laugh', label: '폭소',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body /><Head />
        <Eye x={44} y={44} closed /><Eye x={76} y={44} closed />
        <Nose />
        <path d="M44,63 Q60,82 76,63" stroke="#5a3e1b" strokeWidth="2.5" fill="#e07070" strokeLinecap="round" />
        {/* 눈물 */}
        <ellipse cx="34" cy="56" rx="3" ry="5" fill="#7ec8f7" opacity="0.8" />
        <ellipse cx="86" cy="56" rx="3" ry="5" fill="#7ec8f7" opacity="0.8" />
        <text x="10" y="20" fontSize="14">😂</text>
      </svg>
    )
  },
  {
    id: 'cry', label: '울음',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body cheek="#A0BFFF" /><Head color="#F5C842" />
        <Eye x={44} y={44} closed /><Eye x={76} y={44} closed />
        <Nose y={57} />
        <path d="M48,68 Q60,62 72,68" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 눈물 방울 */}
        <path d="M42,52 Q40,62 38,70 Q37,75 42,74 Q47,74 46,70 Q44,62 42,52Z" fill="#7ec8f7" opacity="0.85" />
        <path d="M78,52 Q76,62 74,70 Q73,75 78,74 Q83,74 82,70 Q80,62 78,52Z" fill="#7ec8f7" opacity="0.85" />
      </svg>
    )
  },
  {
    id: 'angry', label: '화남',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body color="#F57042" cheek="#FF3030" /><Head color="#F57042" />
        {/* 화난 눈썹 */}
        <line x1="36" y1="34" x2="52" y2="39" stroke="#5a3e1b" strokeWidth="3" strokeLinecap="round" />
        <line x1="84" y1="34" x2="68" y2="39" stroke="#5a3e1b" strokeWidth="3" strokeLinecap="round" />
        <Eye x={44} y={46} /><Eye x={76} y={46} />
        <Nose y={58} />
        <path d="M47,68 Q60,62 73,68" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 분노 기호 */}
        <text x="90" y="20" fontSize="16">💢</text>
      </svg>
    )
  },
  {
    id: 'surprised', label: '깜짝',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body /><Head />
        <Eye x={44} y={43} /><Eye x={76} y={43} />
        <Nose />
        {/* 동그란 입 */}
        <ellipse cx="60" cy="68" rx="8" ry="9" fill="#5a3e1b" />
        <ellipse cx="60" cy="68" rx="5" ry="6" fill="#e07070" />
        {/* 땀 */}
        <path d="M92,32 Q90,40 88,46 Q87,50 91,50 Q95,50 94,46 Q92,40 92,32Z" fill="#7ec8f7" opacity="0.8" />
      </svg>
    )
  },
  {
    id: 'sleepy', label: '졸림',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body cheek="#C0A0FF" /><Head />
        <Eye x={44} y={46} wink /><Eye x={76} y={46} wink />
        <Nose y={57} />
        <path d="M50,66 Q60,72 70,66" stroke="#5a3e1b" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Z Z Z */}
        <text x="80" y="22" fontSize="13" fill="#888" fontWeight="bold">Z</text>
        <text x="89" y="14" fontSize="10" fill="#aaa" fontWeight="bold">z</text>
        <text x="96" y="8" fontSize="7" fill="#ccc" fontWeight="bold">z</text>
        {/* 머리 기울기 암시 */}
      </svg>
    )
  },
  {
    id: 'shy', label: '부끄',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body cheek="#FF6060" /><Head />
        <Eye x={44} y={44} wink /><Eye x={76} y={44} />
        <Nose />
        {/* 손으로 얼굴 가리기 */}
        <path d="M38,58 Q44,56 50,58 Q50,72 44,74 Q38,72 38,58Z" fill="#F5C842" stroke="#d4a020" strokeWidth="1" />
        <path d="M70,58 Q76,56 82,58 Q82,72 76,74 Q70,72 70,58Z" fill="#F5C842" stroke="#d4a020" strokeWidth="1" />
        <path d="M50,68 Q60,74 70,68" stroke="#5a3e1b" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* 볼 진하게 */}
        <ellipse cx="33" cy="60" rx="12" ry="8" fill="#FF4060" opacity="0.4" />
        <ellipse cx="87" cy="60" rx="12" ry="8" fill="#FF4060" opacity="0.4" />
      </svg>
    )
  },
  {
    id: 'cool', label: '멋짐',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body /><Head />
        {/* 선글라스 */}
        <rect x="28" y="36" width="24" height="16" rx="6" fill="#1a1a2e" />
        <rect x="68" y="36" width="24" height="16" rx="6" fill="#1a1a2e" />
        <line x1="52" y1="44" x2="68" y2="44" stroke="#1a1a2e" strokeWidth="3" />
        <line x1="28" y1="44" x2="20" y2="42" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="92" y1="44" x2="100" y2="42" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
        <Nose y={57} />
        <path d="M47,66 Q60,76 73,66" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <text x="5" y="20" fontSize="14">✨</text>
        <text x="92" y="20" fontSize="14">✨</text>
      </svg>
    )
  },
  {
    id: 'think', label: '고민',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body /><Head />
        <Eye x={44} y={44} /><Eye x={76} y={46} wink />
        <Nose />
        <path d="M49,67 Q56,64 68,66" stroke="#5a3e1b" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* 손 턱 괴기 */}
        <ellipse cx="78" cy="72" rx="10" ry="7" fill="#F5C842" stroke="#d4a020" strokeWidth="1" />
        {/* 생각 말풍선 */}
        <circle cx="96" cy="20" r="3" fill="#ddd" opacity="0.8" />
        <circle cx="102" cy="13" r="5" fill="#ddd" opacity="0.8" />
        <circle cx="108" cy="6" r="7" fill="#eee" opacity="0.9" />
        <text x="103" y="10" fontSize="8" fill="#888">?</text>
      </svg>
    )
  },
  {
    id: 'thumbsup', label: '최고',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body /><Head />
        <Eye x={44} y={44} /><Eye x={76} y={44} />
        <Nose />
        <path d="M46,65 Q60,78 74,65" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 엄지 */}
        <g transform="translate(82,62) rotate(-20)">
          <rect x="0" y="0" width="14" height="20" rx="4" fill="#F5C842" stroke="#d4a020" strokeWidth="1.2" />
          <rect x="2" y="-10" width="10" height="14" rx="5" fill="#F5C842" stroke="#d4a020" strokeWidth="1.2" />
        </g>
        <text x="5" y="20" fontSize="13">👍</text>
      </svg>
    )
  },
  {
    id: 'party', label: '파티',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body cheek="#FF80AB" /><Head />
        <Eye x={44} y={44} star /><Eye x={76} y={44} star />
        <Nose />
        <path d="M44,63 Q60,80 76,63" stroke="#5a3e1b" strokeWidth="2.5" fill="#e07070" strokeLinecap="round" />
        {/* 파티 모자 */}
        <polygon points="60,2 42,36 78,36" fill="#FF4081" stroke="#C2185B" strokeWidth="1" />
        <circle cx="60" cy="2" r="3" fill="#FFD700" />
        <ellipse cx="60" cy="36" rx="18" ry="4" fill="#FF80AB" />
        {/* 색종이 */}
        <text x="5" y="22" fontSize="10">🎉</text>
        <text x="90" y="18" fontSize="10">✨</text>
        <rect x="15" y="30" width="6" height="6" rx="1" fill="#7EC8F7" transform="rotate(20,18,33)" />
        <rect x="94" y="38" width="5" height="5" rx="1" fill="#FF6B6B" transform="rotate(-15,96,40)" />
        <rect x="25" y="20" width="4" height="4" rx="1" fill="#FFD700" transform="rotate(35,27,22)" />
      </svg>
    )
  },
  {
    id: 'sad', label: '슬픔',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body cheek="#A0B8FF" /><Head color="#E8B830" />
        {/* 처진 눈썹 */}
        <path d="M36,36 Q44,40 52,37" stroke="#5a3e1b" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M68,37 Q76,40 84,36" stroke="#5a3e1b" strokeWidth="2" fill="none" strokeLinecap="round" />
        <Eye x={44} y={46} /><Eye x={76} y={46} />
        <Nose y={58} />
        <path d="M48,70 Q60,63 72,70" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 빗방울 */}
        <text x="5" y="25" fontSize="12">🌧️</text>
      </svg>
    )
  },
  {
    id: 'hungry', label: '배고파',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body /><Head />
        <Eye x={44} y={44} /><Eye x={76} y={44} />
        <Nose />
        {/* 입에서 침 */}
        <path d="M44,63 Q60,80 76,63" stroke="#5a3e1b" strokeWidth="2.5" fill="#e07070" strokeLinecap="round" />
        <path d="M55,73 Q55,82 57,86 Q60,90 61,86 Q62,82 62,73" fill="#7ec8f7" opacity="0.8" />
        {/* 음식 */}
        <text x="86" y="20" fontSize="16">🍔</text>
        {/* 뱃속 꼬르륵 */}
        <text x="44" y="98" fontSize="9" fill="#aaa">꼬르륵~</text>
      </svg>
    )
  },
  {
    id: 'hug', label: '안아줘',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body cheek="#FFB3C6" /><Head />
        <Eye x={44} y={44} /><Eye x={76} y={44} />
        <Nose />
        <path d="M46,65 Q60,78 74,65" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 두 팔 벌리기 */}
        <path d="M22,65 Q15,55 18,48 Q22,42 28,48" stroke="#F5C842" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M98,65 Q105,55 102,48 Q98,42 92,48" stroke="#F5C842" strokeWidth="7" fill="none" strokeLinecap="round" />
        <text x="48" y="103" fontSize="10" fill="#e74c3c">안아줘~</text>
      </svg>
    )
  },
  {
    id: 'gaming', label: '게임',
    svg: (
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        <Body /><Head />
        <Eye x={44} y={44} star /><Eye x={76} y={44} star />
        <Nose />
        <path d="M46,65 Q60,78 74,65" stroke="#5a3e1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 게임패드 */}
        <rect x="26" y="74" width="68" height="30" rx="14" fill="#444" />
        <circle cx="48" cy="89" r="5" fill="#555" stroke="#333" strokeWidth="1" />
        <line x1="48" y1="84" x2="48" y2="94" stroke="#888" strokeWidth="2" />
        <line x1="43" y1="89" x2="53" y2="89" stroke="#888" strokeWidth="2" />
        <circle cx="76" cy="86" r="4" fill="#e74c3c" />
        <circle cx="84" cy="92" r="4" fill="#3498db" />
        <circle cx="84" cy="84" r="4" fill="#2ecc71" />
        <circle cx="76" cy="92" r="4" fill="#f1c40f" />
        <text x="48" y="12" fontSize="10" fill="#7ec8f7">LEVEL UP!</text>
      </svg>
    )
  },
];

export default function EmoticonSticker({ emoticonId, size = 140 }) {
  const emoticon = EMOTICONS.find(e => e.id === emoticonId);
  if (!emoticon) return null;
  return (
    <div style={{ width: size, height: size * 0.92, display: 'inline-block' }}>
      {emoticon.svg}
    </div>
  );
}
