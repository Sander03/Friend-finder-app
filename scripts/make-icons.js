const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BG = [0x0e, 0x0f, 0x13];
const ACCENT = [0xc6, 0xf4, 0x32];

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function pinCoverage(x, y, s) {
  const cx = 0.5 * s;
  const cy = 0.43 * s;
  const r = 0.2 * s;
  const tipY = 0.8 * s;
  const d = Math.hypot(x - cx, y - cy);
  let inside = d <= r;
  if (!inside && y > cy && y <= tipY) {
    const t = (tipY - y) / (tipY - cy);
    inside = Math.abs(x - cx) <= r * 0.92 * t;
  }
  const hole = d <= r * 0.42;
  return inside && !hole;
}

function makeIcon(size, padding) {
  const rows = [];
  const inner = size * (1 - padding * 2);
  const off = size * padding;
  const samples = 3;
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    for (let x = 0; x < size; x++) {
      let hits = 0;
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = x + (sx + 0.5) / samples - off;
          const py = y + (sy + 0.5) / samples - off;
          if (px >= 0 && py >= 0 && px < inner && py < inner && pinCoverage(px, py, inner)) hits++;
        }
      }
      const a = hits / (samples * samples);
      for (let c = 0; c < 3; c++) row[1 + x * 3 + c] = Math.round(BG[c] * (1 - a) + ACCENT[c] * a);
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const root = path.join(__dirname, '..');
const out = [
  ['public/icons/icon-192.png', 192, 0],
  ['public/icons/icon-512.png', 512, 0],
  ['public/icons/maskable-512.png', 512, 0.12],
  ['public/icons/apple-touch-icon.png', 180, 0.04],
  ['assets/icon.png', 1024, 0],
  ['assets/adaptive-icon.png', 1024, 0.18],
  ['assets/favicon.png', 48, 0],
];
for (const [file, size, padding] of out) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), makeIcon(size, padding));
  console.log('geschreven:', file);
}
