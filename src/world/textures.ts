// Procedural canvas textures (wallpapers, floors, brick, logs…). Generated at
// load time so the remake stays light-weight and every family's house can
// have its own palette.

import * as THREE from 'three';
import type { FloorKind, WallKind } from '../levels/types';

const cache = new Map<string, THREE.CanvasTexture>();

function canvas(w: number, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function finish(c: HTMLCanvasElement, key: string, repeat = 1) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.repeat.set(repeat, repeat);
  cache.set(key, t);
  return t;
}

function shade(hex: string, amt: number) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amt)));
  return `#${c.getHexString()}`;
}

function noise(g: CanvasRenderingContext2D, w: number, h: number, alpha: number, size = 1) {
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      const n = (Math.random() - 0.5) * 255 * alpha;
      for (let yy = 0; yy < size; yy++) for (let xx = 0; xx < size; xx++) {
        const i = ((y + yy) * w + (x + xx)) * 4;
        d[i] += n; d[i + 1] += n; d[i + 2] += n;
      }
    }
  }
  g.putImageData(img, 0, 0);
}

/** 1 texture repeat == 1 metre for walls (UVs are world-space metres). */
export function wallTexture(kind: WallKind, color: string, accent = '#f3e6c8'): THREE.CanvasTexture {
  const key = `w:${kind}:${color}:${accent}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const S = 256;
  const [c, g] = canvas(S);
  g.fillStyle = color;
  g.fillRect(0, 0, S, S);
  switch (kind) {
    case 'stripes': {
      g.fillStyle = shade(color, -0.06);
      for (let x = 0; x < S; x += 64) g.fillRect(x, 0, 30, S);
      g.fillStyle = accent;
      g.globalAlpha = 0.5;
      for (let x = 0; x < S; x += 64) g.fillRect(x + 31, 0, 3, S);
      g.globalAlpha = 1;
      break;
    }
    case 'damask': {
      g.fillStyle = shade(color, 0.07);
      for (let y = 0; y < S; y += 64) {
        for (let x = 0; x < S; x += 64) {
          const ox = (y / 64) % 2 ? 32 : 0;
          drawDamask(g, x + ox + 16, y + 32);
        }
      }
      break;
    }
    case 'plaid': {
      g.globalAlpha = 0.22;
      g.fillStyle = shade(color, -0.2);
      for (let i = 0; i < S; i += 64) { g.fillRect(i, 0, 22, S); g.fillRect(0, i, S, 22); }
      g.fillStyle = accent;
      g.globalAlpha = 0.35;
      for (let i = 0; i < S; i += 64) { g.fillRect(i + 40, 0, 3, S); g.fillRect(0, i + 40, S, 3); }
      g.globalAlpha = 1;
      break;
    }
    case 'stars': {
      g.fillStyle = accent;
      for (let y = 0; y < S; y += 42) {
        for (let x = 0; x < S; x += 42) {
          const ox = (y / 42) % 2 ? 21 : 0;
          star(g, x + ox + 10, y + 12, 5, 0.45);
        }
      }
      break;
    }
    case 'tileWall': {
      g.strokeStyle = shade(color, -0.12);
      g.lineWidth = 3;
      for (let y = 0; y <= S; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(S, y); g.stroke(); }
      for (let x = 0; x <= S; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }
      break;
    }
    case 'logs': {
      for (let y = 0; y < S; y += 42) {
        const grd = g.createLinearGradient(0, y, 0, y + 42);
        grd.addColorStop(0, shade(color, -0.12));
        grd.addColorStop(0.5, shade(color, 0.06));
        grd.addColorStop(1, shade(color, -0.18));
        g.fillStyle = grd;
        g.fillRect(0, y, S, 42);
        g.fillStyle = shade(color, -0.25);
        g.fillRect(0, y + 40, S, 2);
      }
      break;
    }
    case 'brick': {
      g.fillStyle = shade(color, -0.25);
      g.fillRect(0, 0, S, S);
      for (let y = 0; y < S; y += 21) {
        const off = (y / 21) % 2 ? 32 : 0;
        for (let x = -64; x < S; x += 64) {
          g.fillStyle = shade(color, (Math.random() - 0.5) * 0.12);
          g.fillRect(x + off + 2, y + 2, 60, 17);
        }
      }
      break;
    }
    case 'paint':
    default:
      break;
  }
  noise(g, S, S, 0.035, 2);
  return finish(c, key);
}

function drawDamask(g: CanvasRenderingContext2D, x: number, y: number) {
  g.save();
  g.translate(x, y);
  g.beginPath();
  g.moveTo(0, -20);
  g.bezierCurveTo(12, -12, 10, 4, 0, 18);
  g.bezierCurveTo(-10, 4, -12, -12, 0, -20);
  g.fill();
  g.beginPath();
  g.arc(0, -24, 3, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

export function star(g: CanvasRenderingContext2D, x: number, y: number, r: number, inner = 0.5) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * inner : r;
    g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  g.closePath();
  g.fill();
}

const FLOOR_COLORS: Record<FloorKind, string> = {
  wood: '#a8774d',
  woodDark: '#6b4530',
  carpet: '#b9ab98',
  carpetRed: '#8a2f35',
  carpetGreen: '#3f5f4a',
  tile: '#d9d5cc',
  tileCheck: '#e8e2d6',
  stone: '#8e8a84',
};

/** 1 repeat == 2 metres for floors. */
export function floorTexture(kind: FloorKind): THREE.CanvasTexture {
  const key = `f:${kind}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const S = 512;
  const [c, g] = canvas(S);
  const base = FLOOR_COLORS[kind];
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  if (kind === 'wood' || kind === 'woodDark') {
    const plank = 48;
    for (let y = 0; y < S; y += plank) {
      let x = -Math.random() * 200;
      while (x < S) {
        const len = 160 + Math.random() * 220;
        g.fillStyle = shade(base, (Math.random() - 0.5) * 0.09);
        g.fillRect(x, y, len, plank);
        // grain
        g.strokeStyle = shade(base, -0.08);
        g.globalAlpha = 0.25;
        for (let k = 0; k < 4; k++) {
          g.beginPath();
          const yy = y + 6 + Math.random() * (plank - 12);
          g.moveTo(x, yy);
          g.bezierCurveTo(x + len * 0.3, yy + 3, x + len * 0.6, yy - 3, x + len, yy);
          g.stroke();
        }
        g.globalAlpha = 1;
        g.fillStyle = shade(base, -0.22);
        g.fillRect(x + len - 2, y, 2, plank);
        x += len;
      }
      g.fillStyle = shade(base, -0.25);
      g.fillRect(0, y + plank - 2, S, 2);
    }
    noise(g, S, S, 0.03, 2);
  } else if (kind.startsWith('carpet')) {
    noise(g, S, S, 0.09, 1);
    noise(g, S, S, 0.04, 4);
  } else if (kind === 'tile' || kind === 'tileCheck') {
    const n = 8;
    const sz = S / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const dark = kind === 'tileCheck' && (i + j) % 2 === 1;
      g.fillStyle = dark ? '#2f3a45' : shade(base, (Math.random() - 0.5) * 0.04);
      g.fillRect(i * sz + 2, j * sz + 2, sz - 4, sz - 4);
    }
    noise(g, S, S, 0.025, 2);
  } else {
    for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
      g.fillStyle = shade(base, (Math.random() - 0.5) * 0.15);
      g.fillRect(i * (S / 6) + 3, j * (S / 6) + 3, S / 6 - 6, S / 6 - 6);
    }
    noise(g, S, S, 0.05, 2);
  }
  return finish(c, key);
}

export function sidingTexture(color = '#7a3b34'): THREE.CanvasTexture {
  const key = `siding:${color}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const S = 256;
  const [c, g] = canvas(S);
  for (let y = 0; y < S; y += 32) {
    const grd = g.createLinearGradient(0, y, 0, y + 32);
    grd.addColorStop(0, shade(color, 0.05));
    grd.addColorStop(1, shade(color, -0.1));
    g.fillStyle = grd;
    g.fillRect(0, y, S, 32);
    g.fillStyle = shade(color, -0.25);
    g.fillRect(0, y + 30, S, 2);
  }
  noise(g, S, S, 0.03, 2);
  return finish(c, key);
}

export function snowTexture(): THREE.CanvasTexture {
  const key = 'snow';
  const hit = cache.get(key);
  if (hit) return hit;
  const S = 512;
  const [c, g] = canvas(S);
  g.fillStyle = '#e9f1fb';
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(160,185,220,${Math.random() * 0.12})`;
    g.beginPath();
    g.ellipse(Math.random() * S, Math.random() * S, 10 + Math.random() * 40, 4 + Math.random() * 12, Math.random() * 3, 0, Math.PI * 2);
    g.fill();
  }
  for (let i = 0; i < 1600; i++) {
    g.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.6})`;
    g.fillRect(Math.random() * S, Math.random() * S, 1.5, 1.5);
  }
  return finish(c, key);
}

export function ceilingTexture(): THREE.CanvasTexture {
  const key = 'ceiling';
  const hit = cache.get(key);
  if (hit) return hit;
  const S = 128;
  const [c, g] = canvas(S);
  g.fillStyle = '#efe8dc';
  g.fillRect(0, 0, S, S);
  noise(g, S, S, 0.05, 1);
  return finish(c, key);
}

/** Paper texture for notes (used in the 3D world). */
export function paperTexture(kind: 'letter' | 'list' | 'drawing' | 'report' | 'receipt' | 'diary' | 'screen', seed = 0): THREE.CanvasTexture {
  const key = `paper:${kind}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [c, g] = canvas(256, 320);
  g.fillStyle = kind === 'screen' ? '#1b2735' : kind === 'drawing' ? '#fffaf0' : kind === 'receipt' ? '#f5f3ee' : '#fbf3df';
  g.fillRect(0, 0, 256, 320);
  if (kind === 'screen') {
    g.fillStyle = '#5fb4ff';
    for (let y = 30; y < 300; y += 18) g.fillRect(20, y, 60 + Math.random() * 150, 6);
  } else if (kind === 'drawing') {
    const cols = ['#e5484d', '#30a46c', '#f5d90a', '#3e63dd', '#8e4ec6'];
    g.lineWidth = 6;
    g.lineCap = 'round';
    for (let k = 0; k < 9; k++) {
      g.strokeStyle = cols[k % cols.length];
      g.beginPath();
      g.moveTo(30 + Math.random() * 200, 40 + Math.random() * 240);
      for (let j = 0; j < 4; j++) g.quadraticCurveTo(Math.random() * 256, Math.random() * 320, Math.random() * 256, Math.random() * 320);
      g.stroke();
    }
  } else {
    if (kind !== 'receipt') {
      g.strokeStyle = '#b8cde8';
      g.lineWidth = 1;
      for (let y = 40; y < 320; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
      g.strokeStyle = '#e8a0a0';
      g.beginPath(); g.moveTo(30, 0); g.lineTo(30, 320); g.stroke();
    }
    g.fillStyle = '#2a2a45';
    for (let y = 46; y < 300; y += 20) {
      let x = 38;
      while (x < 230) {
        const w = 10 + Math.random() * 30;
        g.globalAlpha = 0.65;
        g.fillRect(x, y - 6, w, 3);
        x += w + 6;
      }
    }
    g.globalAlpha = 1;
  }
  noise(g, 256, 320, 0.03, 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}

/** A soft round sprite (glow / bokeh). */
export function glowTexture(): THREE.CanvasTexture {
  const key = 'glow';
  const hit = cache.get(key);
  if (hit) return hit;
  const [c, g] = canvas(64);
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.6)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  cache.set(key, t);
  return t;
}

/** Painting for picture frames. */
export function paintingTexture(seed: number): THREE.CanvasTexture {
  const key = `painting:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [c, g] = canvas(128, 160);
  const rnd = mulberry(seed);
  const palettes = [
    ['#1d3557', '#457b9d', '#a8dadc', '#f1faee', '#e63946'],
    ['#2d6a4f', '#40916c', '#95d5b2', '#d8f3dc', '#bc4749'],
    ['#3d405b', '#81b29a', '#f2cc8f', '#e07a5f', '#f4f1de'],
    ['#22223b', '#4a4e69', '#9a8c98', '#c9ada7', '#f2e9e4'],
  ];
  const p = palettes[seed % palettes.length];
  const sky = g.createLinearGradient(0, 0, 0, 160);
  sky.addColorStop(0, p[0]);
  sky.addColorStop(1, p[1]);
  g.fillStyle = sky;
  g.fillRect(0, 0, 128, 160);
  // hills / trees / family portrait blob
  if (seed % 3 === 0) {
    g.fillStyle = p[3];
    g.beginPath();
    g.moveTo(0, 120);
    g.quadraticCurveTo(64, 80 + rnd() * 20, 128, 115);
    g.lineTo(128, 160); g.lineTo(0, 160);
    g.fill();
    g.fillStyle = p[2];
    for (let i = 0; i < 5; i++) {
      const x = 10 + rnd() * 108, y = 100 + rnd() * 20;
      g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x - 10, y); g.lineTo(x + 10, y); g.fill();
    }
  } else if (seed % 3 === 1) {
    for (let i = 0; i < 3 + (seed % 3); i++) {
      const x = 25 + i * 30;
      g.fillStyle = p[(i + 2) % 5];
      g.beginPath(); g.arc(x, 70, 11, 0, Math.PI * 2); g.fill();
      g.fillRect(x - 13, 82, 26, 50);
    }
  } else {
    g.fillStyle = p[4];
    g.beginPath(); g.arc(64, 70, 30, 0, Math.PI * 2); g.fill();
    g.fillStyle = p[3];
    g.fillRect(0, 120, 128, 40);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}

export function mulberry(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
