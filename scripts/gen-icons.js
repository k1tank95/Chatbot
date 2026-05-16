const sharp = require('/tmp/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../client/public');

const hamsterSvg = (size, maskable = false) => {
  const inset = maskable ? size * 0.1 : 0;
  const s = size - inset * 2;
  const cx = size / 2, cy = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="bg" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#FFF59D"/>
        <stop offset="100%" stop-color="#FEE500"/>
      </radialGradient>
      <radialGradient id="face" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFE0B2"/>
        <stop offset="100%" stop-color="#FFB74D"/>
      </radialGradient>
      <radialGradient id="cheek" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FF8A80" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#FF8A80" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.22}" fill="url(#bg)"/>
    <!-- ears -->
    <circle cx="${cx - s * 0.22}" cy="${cy - s * 0.22}" r="${s * 0.11}" fill="#A1887F"/>
    <circle cx="${cx + s * 0.22}" cy="${cy - s * 0.22}" r="${s * 0.11}" fill="#A1887F"/>
    <circle cx="${cx - s * 0.22}" cy="${cy - s * 0.22}" r="${s * 0.06}" fill="#FFAB91"/>
    <circle cx="${cx + s * 0.22}" cy="${cy - s * 0.22}" r="${s * 0.06}" fill="#FFAB91"/>
    <!-- face -->
    <ellipse cx="${cx}" cy="${cy + s * 0.02}" rx="${s * 0.32}" ry="${s * 0.28}" fill="url(#face)"/>
    <!-- cheeks -->
    <circle cx="${cx - s * 0.18}" cy="${cy + s * 0.08}" r="${s * 0.08}" fill="url(#cheek)"/>
    <circle cx="${cx + s * 0.18}" cy="${cy + s * 0.08}" r="${s * 0.08}" fill="url(#cheek)"/>
    <!-- eyes -->
    <circle cx="${cx - s * 0.1}" cy="${cy - s * 0.02}" r="${s * 0.035}" fill="#212121"/>
    <circle cx="${cx + s * 0.1}" cy="${cy - s * 0.02}" r="${s * 0.035}" fill="#212121"/>
    <circle cx="${cx - s * 0.09}" cy="${cy - s * 0.03}" r="${s * 0.012}" fill="#fff"/>
    <circle cx="${cx + s * 0.11}" cy="${cy - s * 0.03}" r="${s * 0.012}" fill="#fff"/>
    <!-- nose -->
    <ellipse cx="${cx}" cy="${cy + s * 0.06}" rx="${s * 0.022}" ry="${s * 0.018}" fill="#5D4037"/>
    <!-- mouth -->
    <path d="M ${cx - s * 0.04} ${cy + s * 0.09} Q ${cx} ${cy + s * 0.13} ${cx + s * 0.04} ${cy + s * 0.09}" stroke="#5D4037" stroke-width="${s * 0.012}" fill="none" stroke-linecap="round"/>
  </svg>`;
};

const tasks = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-192-maskable.png', size: 192, maskable: true },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'logo192.png', size: 192, maskable: false },
  { name: 'logo512.png', size: 512, maskable: false },
];

(async () => {
  for (const t of tasks) {
    const svg = hamsterSvg(t.size, t.maskable);
    const out = path.join(outDir, t.name);
    await sharp(Buffer.from(svg)).png().toFile(out);
    console.log('✓', t.name);
  }
})();
