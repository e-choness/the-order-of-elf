// Rewrites the countdown badge between <!-- countdown:start --> and <!-- countdown:end --> in README.md.
import fs from 'node:fs';

const file = new URL('../../README.md', import.meta.url);
const now = new Date();
const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
let eve = Date.UTC(now.getUTCFullYear(), 11, 24);
if (today > Date.UTC(now.getUTCFullYear(), 11, 25)) eve = Date.UTC(now.getUTCFullYear() + 1, 11, 24);
const days = Math.round((eve - today) / 86400000);

let label, message, color;
if (days === 0) [label, message, color] = ['🎅 It’s', 'Christmas Eve — elves deployed!', 'E8C062'];
else if (days === -1) [label, message, color] = ['🎄', 'Merry Christmas!', '1F5A45'];
else [label, message, color] = ['🎄 Christmas Eve in', `${days} day${days === 1 ? '' : 's'}`, 'C0283B'];

const enc = (s) => encodeURIComponent(s).replace(/-/g, '--').replace(/_/g, '__');
const badge = `<p align="center"><img alt="Countdown to Christmas" src="https://img.shields.io/badge/${enc(label)}-${enc(message)}-${color}?style=for-the-badge"></p>`;

const src = fs.readFileSync(file, 'utf8');
const out = src.replace(/<!-- countdown:start -->[\s\S]*?<!-- countdown:end -->/, `<!-- countdown:start -->\n${badge}\n<!-- countdown:end -->`);
if (out !== src) {
  fs.writeFileSync(file, out);
  console.log(`Updated: ${label} ${message}`);
} else console.log('No change');
