// Generates placeholder PWA icons: navy square with a centered white checkmark.
// Pure-Node PNG encoder — no dependencies. Can be re-run any time.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const NAVY = [0x0a, 0x16, 0x28];
const ACCENT = [0x3b, 0x82, 0xf6];

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c >>> 0;
    }
    crc32.table = table;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Render a checkmark by filling pixels along three thick line segments.
// Use a basic "stamp a disk at every step" approach in a normalized coordinate
// space that matches the 64x64 SVG, then scale to size.
function drawIcon(size, { padding = 0, accent = ACCENT } = {}) {
  const channels = 3;
  const stride = size * channels;
  const buf = Buffer.alloc(size * stride);
  // background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = y * stride + x * channels;
      buf[o] = NAVY[0];
      buf[o + 1] = NAVY[1];
      buf[o + 2] = NAVY[2];
    }
  }

  // Checkmark in 64x64 space: (16, 33.5) -> (26, 43.5) -> (48, 21.5)
  // stroke-width 6 -> radius 3 in 64-space
  const inner = size - padding * 2;
  const scale = inner / 64;
  const offset = padding;
  const px = (xy) => xy * scale + offset;
  const radius = 3 * scale;

  const stamp = (cx, cy) => {
    const r = radius;
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(size - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r));
    const y1 = Math.min(size - 1, Math.ceil(cy + r));
    const r2 = r * r;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          const o = y * stride + x * channels;
          buf[o] = accent[0];
          buf[o + 1] = accent[1];
          buf[o + 2] = accent[2];
        }
      }
    }
  };

  const segment = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const steps = Math.max(2, Math.ceil(len * 2));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      stamp(x1 + dx * t, y1 + dy * t);
    }
  };

  segment(px(16), px(33.5), px(26), px(43.5));
  segment(px(26), px(43.5), px(48), px(21.5));

  // Filter byte 0 per row + raw RGB.
  const raw = Buffer.alloc(size * (stride + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    buf.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  { name: 'icon-192.png', size: 192, padding: 0 },
  { name: 'icon-512.png', size: 512, padding: 0 },
  // Maskable spec: outer 20% (10% per side) gets cropped on round/squircle
  // masks. We use ~19% padding so the checkmark sits well inside the safe
  // zone with margin to spare on aggressive squircles.
  { name: 'icon-512-maskable.png', size: 512, padding: 96 },
];

for (const t of targets) {
  const png = drawIcon(t.size, { padding: t.padding });
  fs.writeFileSync(path.join(outDir, t.name), png);
  console.log('wrote', t.name, png.length, 'bytes');
}
