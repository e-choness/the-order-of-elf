// Training — Elf Academy Night Drill. A small cabin with a clockwork
// training automaton and step-by-step field instructions.

import type { LevelDef } from './types';

const K = (k: string) => `<span class="kbd">${k}</span>`;

export const academy: LevelDef = {
  id: 'academy',
  index: 0,
  title: 'Elf Academy: Night Drill',
  subtitle: 'Training cabin · North Pole',
  family: 'The Order of E.L.F.',
  child: {
    name: 'Holly Practice',
    age: 8,
    pronoun: 'she',
    blurb: 'A fictional child invented by the Academy for training purposes. Very fond of bears. Allegedly.',
  },
  briefing: [
    'Welcome, recruit. Before we send you into a real home on Christmas Eve, you’ll run the Night Drill in our training cabin.',
    'The Drill Automaton plays the part of a parent. It is slow, a little rusty, and absolutely will report you to the Head Elf.',
    'Follow the field instructions in the corner of your eye. Find at least three clues about “Holly”, then climb the chimney to file your first report.',
  ],
  minutes: 12,
  clockStart: [21, 0],
  clockEnd: [24, 0],
  bounds: [0, 0, 10, 8],
  exterior: { style: 'workshop' },
  rooms: [
    { id: 'hall', name: 'Training Hall', x: 0, z: 0, w: 6, d: 5, floor: 'wood', wall: 'logs', wallColor: '#8a5a3a' },
    { id: 'bed', name: 'Mock Bedroom', x: 6, z: 0, w: 4, d: 5, floor: 'carpetRed', wall: 'stars', wallColor: '#2c3e66', accent: '#ffe38a' },
    { id: 'corr', name: 'Corridor', x: 0, z: 5, w: 10, d: 3, floor: 'tile', wall: 'stripes', wallColor: '#d9cbb0', accent: '#a8573f' },
  ],
  doors: [
    { x: 6, z: 2.5, axis: 'z', width: 1, leaf: true, open: false },
    { x: 1.5, z: 5, axis: 'x', width: 1.4 },
    { x: 8, z: 5, axis: 'x', width: 1, leaf: true, open: true },
    { x: 0, z: 6.5, axis: 'z', width: 1.1, leaf: true, locked: true },
  ],
  windows: [
    { x: 1.2, z: 0, axis: 'x', width: 1.2, curtains: '#2f5547' },
    { x: 8, z: 0, axis: 'x', width: 1.2, curtains: '#f2c14e' },
    { x: 10, z: 6.5, axis: 'z', width: 1.2 },
    { x: 5, z: 8, axis: 'x', width: 1.6 },
  ],
  props: [
    { m: 'special/fireplace', x: 3.4, z: 0.42, rot: 0 },
    { m: 'furniture/rugRound', x: 3.2, z: 2.8, tint: { carpet: '#a33a3f', carpetWhite: '#a33a3f' } },
    { m: 'furniture/loungeChair', x: 1.0, z: 2.8, rot: 90, tint: { carpet: '#2f5547' } },
    { m: 'furniture/cardboardBoxClosed', x: 4.9, z: 3.8, rot: 10, s: 1.6, climb: true },
    { m: 'furniture/tableCoffee', x: 3.2, z: 2.8, rot: 0 },
    { m: 'furniture/bookcaseOpen', x: 5.6, z: 0.35, rot: 0 },
    { m: 'holiday/treeDecorated', x: 0.7, z: 4.3, rot: 0 },
    { m: 'holiday/present', x: 1.2, z: 4.6, rot: 20, tint: { packageWhite: '#c0392b' } },
    // mock bedroom
    { m: 'furniture/bedSingle', x: 9.4, z: 3.0, rot: 0, tint: { carpet: '#8a2f35' }, id: 'mockBed' },
    { m: 'furniture/cabinetBedDrawerTable', x: 9.6, z: 4.6, rot: 270, id: 'mockNightstand' },
    { m: 'furniture/desk', x: 9.3, z: 1.0, rot: 270, id: 'mockDesk' },
    { m: 'furniture/chairDesk', x: 8.6, z: 1.0, rot: 90 },
    { m: 'furniture/bookcaseClosedDoors', x: 6.5, z: 0.3, rot: 0, id: 'mockCloset' },
    // corridor
    { m: 'furniture/rugRectangle', x: 5, z: 6.5, rot: 90, s: 1.1, tint: { carpet: '#3b5ba5', carpetWhite: '#3b5ba5' } },
    { m: 'furniture/coatRackStanding', x: 0.4, z: 7.6, rot: 0 },
    { m: 'furniture/sideTableDrawers', x: 3.0, z: 7.6, rot: 180, id: 'corrDrawers' },
    { m: 'furniture/pottedPlant', x: 9.6, z: 7.6, rot: 0 },
  ],
  lights: [
    { id: 'fire', kind: 'fire', x: 3.4, z: 0.75, y: 0.55 },
    { id: 'tree', kind: 'tree', x: 0.7, z: 4.3 },
    { id: 'lamp', kind: 'floorLamp', x: 2.2, z: 4.4, switchable: true, watched: true },
    { id: 'bedNight', kind: 'nightlight', x: 9.6, z: 4.6, y: 0.62, color: '#ffd28a' },
    { id: 'corrCeil', kind: 'ceiling', x: 5, z: 6.5, switchable: true, watched: true },
    { id: 'corrWall', kind: 'wallLamp', x: 8.5, z: 7.88, rot: 180 },
  ],
  decor: [
    { kind: 'stocking', x: 2.8, y: 1.05, z: 0.75, rot: 0, color: '#c0392b', label: 'YOU' },
    { kind: 'stocking', x: 4.0, y: 1.05, z: 0.75, rot: 0, color: '#2f7d5b', label: 'ELF' },
    { kind: 'poster', x: 0.09, y: 1.6, z: 2.0, rot: 90, label: 'STEALTH' },
    { kind: 'clock', x: 5, y: 1.95, z: 5.08, rot: 0 },
    { kind: 'garland', x: 3.4, y: 2.45, z: 0.1, rot: 0 },
    { kind: 'frame', x: 7.5, y: 1.6, z: 0.08, rot: 0 },
    { kind: 'snowflake', x: 5, y: 1.9, z: 7.92, rot: 180 },
  ],
  npcs: [
    {
      id: 'auto', name: 'Drill Automaton', kind: 'adult', voice: 0.7, sight: 0.8, speed: 0.75,
      skin: { base: 'robot', shirt: '#b8323f' },
      start: [8, 6.5],
      activities: [
        { at: [8.2, 6.5], face: 270, anim: 'look', min: 6, max: 9, weight: 2, say: 'BZZT. Corridor secure. Probably.' },
        { at: [1.6, 6.6], face: 90, anim: 'stand', min: 4, max: 7, weight: 2 },
        { at: [8.0, 2.2], face: 180, anim: 'look', min: 5, max: 8, weight: 2, say: 'Checking on the pretend child. Beep.' },
        { at: [3.2, 3.9], face: 180, anim: 'stand', min: 4, max: 7, weight: 1, say: 'Fireplace temperature: festive.' },
      ],
      barks: {
        suspicious: ['WHIRR? Unidentified elf-shaped movement.', 'Beep? Recalibrating suspicion.'],
        alert: ['INTRUDER DETECTED! (This is a drill.)', 'ELF SPOTTED. DEDUCTING HOT COCOA.'],
        giveUp: ['Error 404: elf not found.', 'Returning to patrol. Beep boop.'],
        lamp: ['Lamp malfunction detected. Correcting.'],
        broken: ['Ornament integrity compromised.'],
      },
    },
  ],
  clues: [
    {
      id: 'tLetter', title: 'Draft letter to Santa', category: 'wish', points: 'teddy',
      text: '“Dear Santa, I would like a TEDDY BEAR with a red bow. A big one. I will hug it every night.”',
      source: { kind: 'note', paper: 'letter', spots: [[9.3, 0.765, 1.0]], body: 'Dear Santa,\n\nI would like a TEDDY BEAR with a red bow.\nA big one. I will hug it every night.\n\nNot a sled. Sleds are cold.\n\nLove, Holly\n(training exercise #1)' },
    },
    {
      id: 'tSled', title: 'Sled brochure', category: 'wish', points: 'sled',
      text: 'A brochure for the Thunderbolt Toy Sled. Someone has written “for Dad?” on it — not Holly’s handwriting.',
      source: { kind: 'note', paper: 'list', spots: [[3.4, 0.465, 2.6]], body: 'THUNDERBOLT TOY SLED\nFastest on the slopes!\n\n…scribbled in the margin, grown-up handwriting:\n“for Dad? He keeps borrowing the kids’ sled”' },
    },
    {
      id: 'tChores', title: 'Chore chart', category: 'deed', points: 'nice',
      text: 'A chore chart with a gold star for every single day of December. “Fed the training reindeer” appears a lot.',
      source: { kind: 'container', propId: 'mockNightstand', inspect: 'A folded chore chart: gold stars every single day of December. “Fed the training reindeer”, “Tidied my room”, “Helped with dishes”. Exemplary — for a pretend child.' },
    },
    {
      id: 'tBear', title: 'Bear sketch', category: 'wish', points: 'teddy',
      text: 'A crayon drawing of a teddy bear wearing a red bow, labelled “MY FUTURE BEST FRIEND”.',
      source: { kind: 'item', model: 'special/photo', spots: [[3.0, 0.765, 7.6], [5.6, 1.76, 0.35]], inspect: 'A crayon drawing in a little frame: a brown bear with a big red bow. Labelled in wobbly letters: “MY FUTURE BEST FRIEND”.' },
    },
    {
      id: 'tAuto', title: 'Overheard: the Automaton', category: 'rumor', points: 'teddy',
      text: 'The Drill Automaton muttered that “Holly” has asked for a teddy bear in every training scenario since 1987.',
      source: { kind: 'conversation', convo: 'auto' },
    },
  ],
  conversations: [
    {
      id: 'auto', at: 60, where: [5.5, 6.5], who: ['auto'], clue: 'tAuto',
      lines: [
        ['auto', 'Bzzt. Reciting scenario data for trainee elves.'],
        ['auto', 'Pretend child “Holly” has requested a teddy bear in every drill since 1987.'],
        ['auto', 'Pretend child behaviour: nice. Pretend child spelling: needs work.'],
      ],
    },
  ],
  throwables: [
    { model: 'special/ornament', x: 3.1, y: 0.46, z: 2.95, kind: 'ornament' },
    { model: 'furniture/books', x: 5.6, y: 1.76, z: 0.35, kind: 'book' },
  ],
  hides: [
    { kind: 'closet', x: 6.5, z: 0.3, rot: 0, propId: 'mockCloset' },
    { kind: 'box', x: 2.4, z: 7.3, rot: 0 },
    { kind: 'underBed', x: 9.4, z: 3.0, rot: 270, propId: 'mockBed' },
  ],
  sightToys: [
    { id: 'g1', name: 'Snow globe (mantel)', model: 'special/snowglobe', x: 2.8, y: 1.29, z: 0.72 },
    { id: 'b1', name: 'Teddy (bedroom)', model: 'furniture/bear', x: 9.35, y: 0.76, z: 1.6, rot: 270, scale: 0.6 },
  ],
  cookies: [{ x: 3.6, y: 0.465, z: 2.95 }],
  gifts: [
    { id: 'teddy', name: 'Big Teddy Bear', icon: '🧸', blurb: 'With a red bow. Extremely huggable.' },
    { id: 'sled', name: 'Thunderbolt Toy Sled', icon: '🛷', blurb: 'Fastest on the slopes.' },
    { id: 'kite', name: 'Rainbow Kite', icon: '🪁', blurb: 'For windy summer days.' },
    { id: 'yoyo', name: 'Glow Yo-Yo', icon: '🪀', blurb: 'Lights up when it spins.' },
    { id: 'globe', name: 'Snow Globe', icon: '🔮', blurb: 'A tiny village inside.' },
    { id: 'coal', name: 'Lump of Coal', icon: '⚫', blurb: 'Traditional. Unpopular.' },
  ],
  answer: { gift: 'teddy', ledger: 'nice' },
  minCluesForReport: 3,
  player: { x: 3.4, z: 1.45, rot: 0 },
  chimney: [3.4, 0, 0.6],
  creaks: [[4.0, 6.6], [6.5, 6.2]],
  tutorial: [
    { id: 'move', until: 'move', text: `Welcome, recruit! Use ${K('W')}${K('A')}${K('S')}${K('D')} to move and the mouse to look around.` },
    { id: 'crouch', until: 'crouch', text: `Press ${K('Q')} or ${K('C')} to crouch. Crouched elves are smaller, quieter and harder to spot.` },
    { id: 'jump', until: 'jump', text: `Press ${K('Space')} beside furniture to clamber up — try the big cardboard box by the fire.` },
    { id: 'lamp', until: 'lamp', text: `The ★ at the bottom is your light gem: brighter means easier to see. Look at the floor lamp and press ${K('E')} to switch it off.` },
    { id: 'clue', until: 'clue', text: `Evidence glints gold. Find a clue and press ${K('E')} to examine it. (Try the brochure on the coffee table.)` },
    { id: 'hide', until: 'hide', text: `The Drill Automaton patrols the corridor. Hide in the closet or the box with ${K('E')}. Its floor cone shows where it’s looking.` },
    { id: 'dusted', until: 'dusted', text: `Christmas Cheer (${K('LMB')}) sends people to dreamland and leaves a sparkly hiding cloud. Dust the Automaton!` },
    { id: 'report', until: 'never', text: `Find 3 clues (${K('Tab')} opens your journal), then press ${K('E')} at the fireplace to climb the chimney and file your report. Spells are on ${K('1')} and ${K('2')}.` },
  ],
};
