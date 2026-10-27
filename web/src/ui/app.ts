// Application shell: boot, title diorama, menus, briefing & loadout, the
// mission loop, journal/pause, report form and results.

import * as THREE from 'three';
import { Renderer } from '../core/renderer';
import { Input } from '../core/input';
import { initAudio, audio } from '../core/audio';
import { settings, updateSettings, defaultSettings, type Settings } from '../core/settings';
import { save, recordMission } from '../core/save';
import { LEVELS } from '../levels';
import type { LevelDef, ClueDef } from '../levels/types';
import { Level } from '../world/level';
import { Game, type MissionResult } from '../game/game';
import { ABILITIES, type AbilityId } from '../game/abilities';
import { HudView } from './hud';
import { Overlays } from './overlays';
import { h, esc, kbd, snowOverlay, CATEGORY_ICON, CATEGORY_NAME } from './dom';

const TIPS = [
  'Rugs and carpets muffle footsteps. Polished floors and kitchen tiles do not.',
  'The star at the bottom of your screen is your light gem — the dimmer it glows, the harder you are to see.',
  'Switch off a lamp to make a pool of shadow… but someone may notice and switch it back on.',
  'A cloud of Christmas Cheer hides you as well as sending people off to dreamland.',
  'Doors block sight. Close one behind you and you buy yourself a moment.',
  'Squeaky floorboards are loud. Crouch-walk to soften them.',
  'Pets can talk to elves. Make sure no human is watching first.',
  'Dogs can smell you even while you Shimmer. Bring a biscuit.',
  'Santa’s cookies restore magic. He won’t notice one missing. Probably.',
  'Old evidence can lie. Check the dates on things.',
  'Thrown objects make noise where they land — a perfect distraction.',
  'Press Space to clamber onto furniture. Elves are excellent climbers.',
  'People notice things out of place. Tidy hands make quiet elves.',
];

type Screen = 'title' | 'missions' | 'briefing' | 'loading' | 'play' | 'pause' | 'report' | 'results' | 'settings' | 'manual' | 'credits';

export class App {
  renderer: Renderer;
  input: Input;
  hud: HudView;
  overlays: Overlays;
  private ui: HTMLElement;
  private screenEl: HTMLElement | null = null;
  screen: Screen = 'title';
  game: Game | null = null;
  private menuLevel: Level | null = null;
  private menuCam = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
  private last = performance.now();
  private menuT = 0;
  private snow: HTMLElement;
  private loadout: AbilityId[] = ['shimmer', 'sight'];
  private clickToPlay: HTMLElement | null = null;
  private fadeEl: HTMLElement;

  constructor(root: HTMLElement) {
    this.renderer = new Renderer(root);
    this.input = new Input(this.renderer.canvas);
    initAudio();
    this.overlays = new Overlays(root, this.input);
    this.hud = new HudView(root);
    this.hud.show(false);
    this.ui = h('div', { class: 'layer ui' });
    root.append(this.ui);
    this.snow = snowOverlay();
    root.append(this.snow);
    this.fadeEl = h('div', { class: 'fade-black' });
    root.append(this.fadeEl);
    this.input.onLockChange = (locked) => this.onLockChange(locked);
    try {
      const l = JSON.parse(localStorage.getItem('elf.loadout') ?? 'null');
      if (Array.isArray(l) && l.length === 2) this.loadout = l;
    } catch { /* ignore */ }
    // Hovering buttons makes a soft tick
    document.addEventListener('pointerover', (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('.btn, .mission, .ability, .gift, .ledger, .tab')) audio.ui('hover');
    });
    requestAnimationFrame(() => this.loop());
  }

  async boot() {
    this.showLoading('Lighting the fire…', 0.05);
    const audioP = audio.loadAll();
    this.menuLevel = new Level(LEVELS.find((l) => l.id === 'johnson') ?? LEVELS[0]);
    await this.menuLevel.load(this.renderer.shadowMapSize, (p) => this.setLoading(0.1 + p * 0.8, 'Hanging stockings…'));
    await audioP;
    this.renderer.setScene(this.menuLevel.scene, this.menuCam);
    this.showTitle();
  }

  // ---------------------------------------------------------------- frame loop

  /** test hook: ?throttle=ms limits the frame rate (headless screenshots) */
  private throttle = Number(new URLSearchParams(location.search).get('throttle') ?? 0);
  private lastRun = 0;

  private loop() {
    requestAnimationFrame(() => this.loop());
    if (this.throttle) {
      const now = performance.now();
      if (now - this.lastRun < this.throttle) return;
      this.lastRun = now;
    }
    try {
      this.frame();
    } catch (e) {
      console.error(e);
      this.input.endFrame();
    }
  }

  private frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (this.game && (this.screen === 'play')) {
      this.overlays.update(dt);
      this.game.update(dt);
      this.renderer.render(dt);
    } else if (this.game && (this.screen === 'pause' || this.screen === 'report' || this.screen === 'results' || this.screen === 'settings' || this.screen === 'manual')) {
      this.renderer.render(dt * 0.0);
    } else if (this.menuLevel && this.menuLevel.env) {
      this.menuT += dt;
      const t = this.menuT * 0.05;
      const [x0, z0, x1, z1] = this.menuLevel.def.bounds;
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      this.menuCam.position.set(cx + Math.sin(t) * 19, 4.2 + Math.sin(t * 0.7) * 0.8, cz + Math.cos(t) * 19);
      this.menuCam.lookAt(cx - 2, 1.6, cz);
      this.menuLevel.update(dt, this.menuT, this.menuCam.position);
      this.renderer.render(dt);
    }
    this.input.endFrame();
  }

  private onLockChange(locked: boolean) {
    if (!this.game || this.screen !== 'play') return;
    if (!locked) {
      if (this.overlays.isModalOpen()) this.overlays.forceClose();
      if (!this.game.ended) this.openPause();
    }
  }

  // ---------------------------------------------------------------- screens

  private setScreen(s: Screen, el: HTMLElement | null) {
    this.screen = s;
    this.screenEl?.remove();
    this.screenEl = el;
    if (el) this.ui.append(el);
    this.snow.classList.toggle('hidden', !['title', 'missions', 'briefing', 'credits', 'manual', 'loading'].includes(s) || (s === 'settings' && !!this.game));
  }

  private showLoading(label: string, p: number) {
    const tip = TIPS[(Math.random() * TIPS.length) | 0];
    const el = h('div', { class: 'screen loading' });
    el.innerHTML = `<div>
      <div class="wreath">${Array.from({ length: 14 }, (_, i) => `<i style="--a:${i * (360 / 14)}deg"></i>`).join('')}</div>
      <h2 class="ld-label">${esc(label)}</h2>
      <div class="bar"><span style="width:${p * 100}%"></span></div>
      <p class="tip">“${esc(tip)}”</p></div>`;
    this.setScreen('loading', el);
  }

  private setLoading(p: number, label?: string) {
    const el = this.screenEl;
    if (!el || this.screen !== 'loading') return;
    (el.querySelector('.bar span') as HTMLElement).style.width = `${Math.round(p * 100)}%`;
    if (label) (el.querySelector('.ld-label') as HTMLElement).textContent = label;
  }

  showTitle() {
    audio.music.play('silentNight');
    this.renderer.stealth.set('uFade', 0);
    const el = h('div', { class: 'screen title-screen' });
    el.innerHTML = `
      <div>
        <div class="logo">
          <div class="the">The Order of</div>
          <div class="elf">E.L.F.</div>
          <div class="tagline"><b>E</b>lves <b>L</b>urking <b>F</b>estively</div>
        </div>
        <div class="menu">
          <button class="btn primary" data-a="play"><span class="ico">🎄</span>${this.nextMission() ? 'Continue: ' + esc(this.nextMission()!.title) : 'Begin'}</button>
          <button class="btn" data-a="missions"><span class="ico">🗺️</span>Missions</button>
          <button class="btn" data-a="manual"><span class="ico">📖</span>Field Manual</button>
          <button class="btn" data-a="settings"><span class="ico">⚙️</span>Settings</button>
          <button class="btn ghost" data-a="credits"><span class="ico">⭐</span>Credits</button>
        </div>
      </div>
      <div></div>
      <div class="title-foot">A web remake of the ABK Jam Team 7 game · Art: Kenney (CC0) · MIT License</div>
      <div class="title-hint">Best with headphones 🎧<br/>Mouse + keyboard</div>`;
    el.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).closest('[data-a]')?.getAttribute('data-a');
      if (!a) return;
      audio.ui('click');
      if (a === 'play') this.showBriefing(this.nextMission() ?? LEVELS[0]);
      if (a === 'missions') this.showMissions();
      if (a === 'manual') this.showManual(() => this.showTitle());
      if (a === 'settings') this.showSettings(() => this.showTitle());
      if (a === 'credits') this.showCredits();
    });
    this.setScreen('title', el);
  }

  private nextMission(): LevelDef | null {
    for (const l of LEVELS) if (!save.missions[l.id]?.completed) return l;
    return null;
  }

  private unlocked(l: LevelDef) {
    const i = LEVELS.indexOf(l);
    return i <= 0 || !!save.missions[LEVELS[i - 1].id]?.completed;
  }

  showMissions() {
    const el = h('div', { class: 'screen' });
    const page = h('div', { class: 'page glass' });
    const arts = ['#2c3e66,#0b1022', '#7c2f35,#1a0f18', '#2f5547,#0b1a14', '#556b8a,#141a2c', '#5a3a7a,#120c1c'];
    page.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">North Pole Dispatch</div><h2>Missions for Christmas Eve</h2></div>
      <button class="btn" data-a="back">← Back</button></div>
      <div class="mission-grid">${LEVELS.map((l, i) => {
        const rec = save.missions[l.id];
        const lock = !this.unlocked(l);
        const stars = rec?.bestRank ?? 0;
        return `<button class="mission ${lock ? 'locked' : ''}" data-id="${l.id}" ${lock ? 'disabled' : ''}>
          <div class="art" style="background: radial-gradient(ellipse at 50% 120%, rgba(255,200,120,.35), transparent 60%), linear-gradient(180deg, ${arts[i % arts.length]})">
            ${houseSvg(i)}
          </div>
          <div class="body">
            <span class="eyebrow">${i === 0 ? 'Training' : `Mission ${l.index}`}</span>
            <h3>${esc(l.title)}</h3>
            <p>${esc(l.child.name)}, ${l.child.age} · ${esc(l.subtitle)}</p>
            <div class="meta"><span class="stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span>
            ${rec?.bestEnding ? `<span class="badge ${rec.bestEnding === 'promotion' ? 'gold' : rec.bestEnding === 'recognition' ? 'green' : 'red'}">${rec.bestEnding}</span>` : ''}
            ${rec?.ghost ? '<span class="badge">👻 ghost</span>' : ''}
            <span>⏱ ${l.minutes} min</span></div>
          </div></button>`;
      }).join('')}</div>`;
    page.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-a="back"]')) { audio.ui('back'); this.showTitle(); return; }
      const id = t.closest('.mission')?.getAttribute('data-id');
      const l = LEVELS.find((x) => x.id === id);
      if (l && this.unlocked(l)) { audio.ui('click'); this.showBriefing(l); }
    });
    el.append(page);
    this.setScreen('missions', el);
  }

  showBriefing(l: LevelDef) {
    audio.music.play('deckTheHalls');
    const el = h('div', { class: 'screen' });
    const page = h('div', { class: 'page glass' });
    const household = l.npcs.map((n) => {
      const ic = { adult: '🧑', kid: '🧒', teen: '🧑‍🎤', elder: '🧓', dog: '🐶', cat: '🐱', robot: '🤖' }[n.kind];
      return `<div><b>${ic} ${esc(n.name)}</b>${esc(roleOf(n))}</div>`;
    }).join('');
    const sel = new Set(this.loadout);
    const render = () => {
      page.innerHTML = `
        <div class="page-head"><div><div class="eyebrow">${l.index === 0 ? 'Elf Academy' : `Mission ${l.index}`} · Top Secret</div><h2>${esc(l.title)}</h2></div>
        <button class="btn" data-a="back">← Missions</button></div>
        <div class="briefing">
          <div class="dossier">
            <div class="stamp">CLASSIFIED</div>
            <h2>Dossier</h2>
            <div class="sub">${esc(l.family)} · ${esc(l.subtitle)}</div>
            ${l.briefing.map((p) => `<p>${esc(p)}</p>`).join('')}
            <div class="polaroid"><div class="pic">${l.child.age < 10 ? '🧒' : '🧑'}</div><div><b>${esc(l.child.name)}</b>, age ${l.child.age}<br/><span style="font-size:.85rem">${esc(l.child.blurb)}</span></div></div>
            <div style="font-size:.85rem;opacity:.7;margin-bottom:.3rem">HOUSEHOLD</div>
            <div class="household">${household}</div>
          </div>
          <div class="loadout">
            <ul class="objectives">
              <li>Find evidence of ${esc(l.child.name.split(' ')[0])}’s true wish and how ${l.child.pronoun} behaved this year.</li>
              <li>Gather at least ${l.minCluesForReport} of ${l.clues.length} clues, then climb back up the chimney to report.</li>
              <li>Stay out of sight. If detection fills, the mission is blown.</li>
              <li>Be back before midnight — you have ${l.minutes} minutes.</li>
            </ul>
            <h3>Choose two spells</h3>
            <span class="dim" style="font-size:.88rem">Bound to ${kbd('1')} and ${kbd('2')}. Christmas Cheer dust (${kbd('LMB')}) is always with you.</span>
            <div class="ability-grid">${(Object.keys(ABILITIES) as AbilityId[]).map((id) => {
              const a = ABILITIES[id];
              const idx = this.loadout.indexOf(id);
              return `<button class="ability ${sel.has(id) ? 'sel' : ''}" data-ab="${id}" style="--c:${a.color}">
                ${idx >= 0 ? `<span class="slot kbd">${idx + 1}</span>` : ''}
                <span class="ico">${a.icon}</span><b>${a.name}</b><p>${esc(a.desc)}</p><p style="margin-top:.35rem;opacity:.75">${esc(a.detail)}</p></button>`;
            }).join('')}</div>
            <div style="display:flex;gap:.8rem;flex-wrap:wrap">
              <button class="btn primary" data-a="go" ${this.loadout.length === 2 ? '' : 'disabled'}>🎅 Down the chimney</button>
              <button class="btn ghost" data-a="manual">📖 Controls</button>
            </div>
          </div>
        </div>`;
    };
    render();
    page.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      const a = t.closest('[data-a]')?.getAttribute('data-a');
      const ab = t.closest('[data-ab]')?.getAttribute('data-ab') as AbilityId | null;
      if (ab) {
        audio.ui('toggle');
        if (this.loadout.includes(ab)) this.loadout = this.loadout.filter((x) => x !== ab);
        else {
          this.loadout.push(ab);
          if (this.loadout.length > 2) this.loadout.shift();
        }
        sel.clear();
        this.loadout.forEach((x) => sel.add(x));
        try { localStorage.setItem('elf.loadout', JSON.stringify(this.loadout)); } catch { /* ignore */ }
        render();
        return;
      }
      if (a === 'back') { audio.ui('back'); this.showMissions(); }
      if (a === 'manual') { audio.ui('click'); this.showManual(() => this.showBriefing(l)); }
      if (a === 'go' && this.loadout.length === 2) { audio.ui('confirm'); this.startMission(l); }
    });
    el.append(page);
    this.setScreen('briefing', el);
  }

  async startMission(l: LevelDef) {
    // ask for pointer lock while we still have the click gesture
    this.input.lock();
    this.showLoading('Sliding down the chimney…', 0.02);
    audio.music.stop();
    this.disposeGame();
    const game = new Game(l, this.renderer, this.input, this.overlays, this.hud, {
      onEnd: (r) => this.onEnd(r),
      onReport: () => this.openReport(),
      onPause: () => this.openPause(),
    }, [this.loadout[0], this.loadout[1]]);
    this.game = game;
    try {
      await game.load((p, label) => this.setLoading(p, label));
    } catch (e) {
      console.error(e);
      this.showTitle();
      return;
    }
    this.hud.clear();
    this.hud.setup(game);
    this.hud.show(true);
    this.setScreen('play', null);
    audio.music.play('carolOfBells');
    audio.whoosh(1.2, false, 0.3);
    audio.play('sfx/coins', { volume: 0.3 });
    this.hud.toast(`${l.title} — ${l.clockStart[0] % 12}:${String(l.clockStart[1]).padStart(2, '0')} PM`, 'gold');
    if (!this.input.locked) this.showClickToPlay();
  }

  private showClickToPlay() {
    if (this.clickToPlay) return;
    const el = h('div', { class: 'click-to-play' });
    el.innerHTML = `<div class="glass"><h3>Click to sneak in</h3><p class="dim">Your mouse will be captured. Press ${kbd('Esc')} or ${kbd('Tab')} for the journal.</p></div>`;
    el.addEventListener('click', () => {
      this.input.lock();
      el.remove();
      this.clickToPlay = null;
    });
    this.ui.append(el);
    this.clickToPlay = el;
  }

  private disposeGame() {
    if (this.game) {
      this.game.dispose();
      this.game = null;
    }
  }

  // ---------------------------------------------------------------- pause / journal

  openPause(tab: 'clues' | 'household' | 'gifts' | 'controls' = 'clues') {
    const g = this.game;
    if (!g || g.ended) return;
    g.paused = true;
    this.input.unlock();
    this.hud.show(false);
    audio.ui('page');
    audio.music.intensity = 0;
    const el = h('div', { class: 'screen' });
    el.style.background = 'rgba(5,8,20,.55)';
    const j = h('div', { class: 'journal glass' });
    const found = new Set(g.found.map((f) => f.clue.id));
    const counts = { wish: 0, deed: 0, rumor: 0 } as Record<string, number>;
    for (const f of g.found) counts[f.clue.category]++;
    const render = (t: typeof tab) => {
      tab = t;
      let content = '';
      if (t === 'clues') {
        content = `<h3>Evidence journal</h3><p class="dim" style="margin-top:-.4rem">${g.found.length} of ${g.def.clues.length} clues · ${g.found.length >= g.def.minCluesForReport ? 'You can file your report at the chimney.' : `${g.def.minCluesForReport - g.found.length} more needed before you can report.`}</p>`;
        for (const cat of ['wish', 'deed', 'rumor'] as const) {
          const list = g.def.clues.filter((c) => c.category === cat);
          if (!list.length) continue;
          content += `<div class="cat-head"><span class="eyebrow">${CATEGORY_ICON[cat]} ${CATEGORY_NAME[cat]}</span><span class="dim" style="font-size:.8rem">${counts[cat]}/${list.length}</span></div><div class="clue-list">`;
          content += list.map((c) => clueCard(c, found.has(c.id))).join('');
          content += '</div>';
        }
      } else if (t === 'household') {
        content = `<h3>The household</h3><div class="clue-list">${g.npcs.map((n) => {
          const ic = { adult: '🧑', kid: '🧒', teen: '🧑‍🎤', elder: '🧓', dog: '🐶', cat: '🐱', robot: '🤖' }[n.def.kind];
          const st = n.befriended ? '<span class="badge green">befriended</span>' : n.state === 'sleep' ? '<span class="badge">asleep</span>' : n.state === 'alert' ? '<span class="badge red">alerted</span>' : '';
          return `<div class="clue-card"><span class="ic">${ic}</span><div><b>${esc(n.name)}</b> ${st}<p>${esc(roleOf(n.def))}</p></div></div>`;
        }).join('')}</div>`;
      } else if (t === 'gifts') {
        content = `<h3>The shortlist</h3><p class="dim" style="margin-top:-.4rem">North Pole records suggest ${esc(g.def.child.name.split(' ')[0])}’s wish is one of these. Your evidence decides which.</p><div class="gifts" style="margin-top:1rem">${g.def.gifts.map((gf) => `<div class="gift" style="cursor:default"><div class="ic">${gf.icon}</div><b>${esc(gf.name)}</b><small>${esc(gf.blurb)}</small></div>`).join('')}</div>`;
      } else {
        content = controlsHtml();
      }
      j.innerHTML = `
        <nav>
          <h2>📓 Journal</h2>
          <button class="tab ${t === 'clues' ? 'on' : ''}" data-t="clues">Evidence <span>${g.found.length}/${g.def.clues.length}</span></button>
          <button class="tab ${t === 'household' ? 'on' : ''}" data-t="household">Household</button>
          <button class="tab ${t === 'gifts' ? 'on' : ''}" data-t="gifts">Gift shortlist</button>
          <button class="tab ${t === 'controls' ? 'on' : ''}" data-t="controls">Controls</button>
          <div class="spacer"></div>
          <button class="btn primary" data-a="resume">▶ Resume</button>
          ${g.found.length >= g.def.minCluesForReport ? '<button class="btn gold" data-a="report">📝 File report</button>' : ''}
          <button class="btn" data-a="settings">⚙️ Settings</button>
          <button class="btn" data-a="restart">↺ Restart</button>
          <button class="btn ghost" data-a="quit">⏏ Quit to menu</button>
        </nav>
        <div class="content">${content}</div>`;
    };
    render(tab);
    j.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      const tb = t.closest('[data-t]')?.getAttribute('data-t') as typeof tab | null;
      if (tb) { audio.ui('page'); render(tb); return; }
      const a = t.closest('[data-a]')?.getAttribute('data-a');
      if (!a) return;
      audio.ui('click');
      if (a === 'resume') this.resume();
      if (a === 'report') { this.openReport(); }
      if (a === 'settings') this.showSettings(() => this.openPause());
      if (a === 'restart') { const def = g.def; this.startMission(def); }
      if (a === 'quit') { this.disposeGame(); this.hud.show(false); this.renderer.setScene(this.menuLevel!.scene, this.menuCam); this.showTitle(); }
    });
    const onKey = (e: KeyboardEvent) => {
      if (this.screen !== 'pause') { window.removeEventListener('keydown', onKey); return; }
      if (e.code === 'Tab' || e.code === 'KeyJ') { e.preventDefault(); window.removeEventListener('keydown', onKey); this.resume(); }
    };
    window.addEventListener('keydown', onKey);
    el.append(j);
    this.setScreen('pause', el);
  }

  private resume() {
    const g = this.game;
    if (!g) return;
    g.paused = false;
    this.hud.show(true);
    this.setScreen('play', null);
    this.input.clear();
    this.input.lock();
    window.setTimeout(() => { if (!this.input.locked && this.screen === 'play') this.showClickToPlay(); }, 300);
  }

  // ---------------------------------------------------------------- report

  openReport() {
    const g = this.game;
    if (!g) return;
    g.paused = true;
    this.input.unlock();
    this.hud.show(false);
    audio.play('sfx/book_open', { bus: 'ui', volume: 0.5 });
    let gift = '';
    let ledger: '' | 'nice' | 'naughty' = '';
    const el = h('div', { class: 'screen' });
    el.style.background = 'rgba(5,8,20,.6)';
    const wrap = h('div', { class: 'report' });
    const found = new Set(g.found.map((f) => f.clue.id));
    const evidence = h('div', { class: 'evidence glass' });
    evidence.innerHTML = `<h3>Your evidence</h3><div class="clue-list">${g.def.clues.filter((c) => found.has(c.id)).map((c) => clueCard(c, true)).join('') || '<p class="dim">No evidence… bold.</p>'}</div>`;
    const form = h('div', { class: 'report-form' });
    const render = () => {
      form.innerHTML = `
        <div class="head"><div><span class="eyebrow" style="color:var(--cranberry)">Order of E.L.F. · Form 24-12</span><h2>Field Report: ${esc(g.def.child.name)}</h2></div>
        <div class="formno">Filed ${g.clock()[0] % 12}:${String(g.clock()[1]).padStart(2, '0')} PM<br/>Agent: you</div></div>
        <h4>1. WHAT IS AT THE TOP OF ${esc(g.def.child.name.split(' ')[0].toUpperCase())}’S LIST?</h4>
        <div class="gifts">${g.def.gifts.map((gf) => {
          const n = g.found.filter((f) => f.clue.points === gf.id).length;
          return `<button class="gift ${gift === gf.id ? 'sel' : ''}" data-g="${gf.id}">${n ? `<span class="hint-count">📎 ${n}</span>` : ''}<div class="ic">${gf.icon}</div><b>${esc(gf.name)}</b><small>${esc(gf.blurb)}</small></button>`;
        }).join('')}</div>
        <h4>2. WHICH LEDGER DOES ${esc(g.def.child.pronoun === 'she' ? 'HER' : g.def.child.pronoun === 'he' ? 'HIS' : 'THEIR')} LIST GO TO?</h4>
        <div class="ledgers">
          <button class="ledger nice ${ledger === 'nice' ? 'sel' : ''}" data-l="nice"><div class="ic">🎅</div><b>Nice — to Santa</b><small>Kind, honest, generally lovely.</small><span class="stamp-mark">NICE</span></button>
          <button class="ledger naughty ${ledger === 'naughty' ? 'sel' : ''}" data-l="naughty"><div class="ic">👹</div><b>Naughty — to Krampus</b><small>Mischief beyond the forgivable.</small><span class="stamp-mark">NAUGHTY</span></button>
        </div>
        <div class="report-actions">
          <button class="btn" style="color:var(--paper-ink);border-color:rgba(43,36,51,.3)" data-a="back">← Keep investigating</button>
          <button class="btn primary" data-a="submit" ${gift && ledger ? '' : 'disabled'}>📮 Seal & send to the North Pole</button>
        </div>`;
    };
    render();
    form.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      const gid = t.closest('[data-g]')?.getAttribute('data-g');
      const lid = t.closest('[data-l]')?.getAttribute('data-l') as 'nice' | 'naughty' | null;
      const a = t.closest('[data-a]')?.getAttribute('data-a');
      if (gid) { gift = gid; audio.ui('toggle'); render(); }
      if (lid) { ledger = lid; audio.play('sfx/wood', { bus: 'ui', volume: 0.7, rate: 0.7 }); render(); }
      if (a === 'back') { audio.ui('back'); this.resume(); }
      if (a === 'submit' && gift && ledger) {
        audio.ui('confirm');
        audio.sleighBells(undefined, 1.6, 0.4);
        g.paused = false;
        g.submitReport(gift, ledger);
      }
    });
    wrap.append(form, evidence);
    el.append(wrap);
    this.setScreen('report', el);
  }

  // ---------------------------------------------------------------- results

  private onEnd(r: MissionResult) {
    const g = this.game!;
    this.input.unlock();
    this.hud.show(false);
    const def = g.def;
    let ending: 'promotion' | 'recognition' | 'demotion' | 'caught' | 'timeout';
    if (r.outcome === 'caught') ending = 'caught';
    else if (r.outcome === 'timeout') ending = 'timeout';
    else {
      const giftOk = r.gift === def.answer.gift;
      const ledgerOk = r.ledger === def.answer.ledger;
      ending = giftOk && ledgerOk ? 'promotion' : giftOk || ledgerOk ? 'recognition' : 'demotion';
    }
    const ghost = r.stats.spotted === 0 && r.outcome === 'report';
    const allClues = r.clues.length >= def.clues.length;
    let stars = { promotion: 3, recognition: 2, demotion: 1, caught: 0, timeout: 0 }[ending];
    if (r.outcome === 'report') {
      if (ghost) stars++;
      if (allClues) stars++;
    }
    stars = Math.min(5, stars);
    const ranks = ['Coal Shoveller', 'Tinsel Trainee', 'Stocking Stuffer', 'Sleigh Scout', 'Gingerbread Agent', 'Head Elf of the Order'];
    if (r.outcome === 'report') {
      recordMission(def.id, { completed: true, bestEnding: ending as 'promotion', bestRank: stars, bestTime: r.time, ghost });
    } else recordMission(def.id, { completed: false, bestRank: 0 });
    audio.music.stop();
    window.setTimeout(() => audio.play(ending === 'promotion' ? 'music/win' : ending === 'recognition' ? 'music/partial' : ending === 'caught' ? 'music/caught' : 'music/lose', { bus: 'music', volume: 0.7, vary: 0 }), 300);
    window.setTimeout(() => audio.music.play('deckTheHalls'), 4500);

    const medals: string[] = [];
    if (ghost) medals.push('👻 Silent Night — never spotted');
    if (ghost && r.stats.dusted === 0) medals.push('🕊️ Peace on Earth — no one dusted');
    if (allClues) medals.push('🔎 Sherlock Holly — every clue');
    if (r.stats.cookies >= 2) medals.push('🍪 Cookie Monster');
    if (r.stats.pets > 0) medals.push('🐾 Friend of Fur');
    if (r.stats.broken > 0) medals.push('💥 Butterfingers');
    if (r.stats.lightsOut >= 3) medals.push('🌑 Lights Out');
    if (r.outcome === 'report' && r.time < def.minutes * 30) medals.push('🛷 Speedy Sleigh');

    const titles = {
      promotion: ['🏅', 'Promoted!', `You nailed it. ${def.child.name.split(' ')[0]}’s Christmas is in safe hands.`],
      recognition: ['🎖️', 'Recognised', 'Half right — the North Pole appreciates the effort.'],
      demotion: ['🧹', 'Demoted', 'Wrong gift, wrong ledger. Report to the reindeer stables.'],
      caught: ['🚨', 'Caught!', `${r.caughtBy ?? 'Someone'} found an elf on the shelf. Literally.`],
      timeout: ['🕛', 'Midnight!', 'Santa’s sleigh arrived before your report did.'],
    } as const;
    const [emoji, big, line] = titles[ending];
    const giftName = def.gifts.find((x) => x.id === r.gift)?.name ?? '';
    const first = def.child.name.split(' ')[0];
    let letter = '';
    if (r.outcome === 'report') {
      if (r.ledger === 'nice') {
        letter = `<div class="letter">Dear Agent,<br/><br/>Your report on ${esc(first)} arrived by snow-owl. ${ending === 'promotion' ? `A ${esc(giftName)} it is — wrapped, bowed, and loaded onto the sleigh. You have a real gift for this work.` : ending === 'recognition' ? `I have loaded the ${esc(giftName)}… though something tells me there was more to uncover.` : `Hmm. A ${esc(giftName)}? The reindeer and I have our doubts.`}<br/><br/>Ho ho ho,<div class="sig">— S. Claus</div><div class="seal">SC</div></div>`;
      } else {
        letter = `<div class="letter krampus">Little elf,<br/><br/>You sent ${esc(first)}’s list to <i>me</i>. ${ending === 'promotion' ? 'A wise choice. I shall visit with a stern lecture, a sack of coal… and, grudgingly, the ' + esc(giftName) + ' — for honesty is a start.' : ending === 'recognition' ? 'Interesting. Are you <i>sure</i>? My chains rattle with doubt.' : 'I have rarely seen a list so wrongly delivered. Even I feel bad.'}<br/><br/>Grumpily yours,<div class="sig">— K.</div></div>`;
      }
    } else {
      letter = `<div class="letter">Agent,<br/><br/>${ending === 'caught' ? `The ${esc(def.family)} now believe in elves. Our lawyers (also elves) are handling it. Try again — quieter, darker, sneakier.` : 'The bells have rung twelve and your report is nowhere. Remember: you only need enough evidence, not all of it.'}<br/><br/>Regards,<div class="sig">— Head of the Order</div></div>`;
    }
    const mm = Math.floor(r.time / 60), ss = Math.floor(r.time % 60);
    const el = h('div', { class: 'screen' });
    el.style.background = 'rgba(5,8,20,.7)';
    const idx = LEVELS.indexOf(def);
    const next = LEVELS[idx + 1];
    el.innerHTML = `<div class="results">
      <div class="verdict glass ${ending}">
        <div class="emoji">${emoji}</div>
        <div class="eyebrow">${esc(def.title)}</div>
        <div class="big">${big}</div>
        <p class="dim">${esc(line)}</p>
        <div class="rank">${Array.from({ length: 5 }, (_, i) => `<i class="${i < stars ? 'on' : ''}" style="animation-delay:${0.4 + i * 0.15}s">★</i>`).join('')}</div>
        <div class="rank-name">${ranks[stars]}</div>
        ${r.outcome === 'report' ? `<p style="font-size:.9rem;margin:.8rem 0 0" class="dim">The truth: <b style="color:var(--ink)">${esc(def.gifts.find((x) => x.id === def.answer.gift)?.name ?? '')}</b> · <b style="color:var(--ink)">${def.answer.ledger === 'nice' ? 'Nice list 🎅' : 'Naughty list 👹'}</b></p>` : ''}
        <div class="stats">
          <div><span>Time</span><b>${mm}:${String(ss).padStart(2, '0')}</b></div>
          <div><span>Clues</span><b>${r.clues.length}/${def.clues.length}</b></div>
          <div><span>Times spotted</span><b>${r.stats.spotted}</b></div>
          <div><span>People dusted</span><b>${r.stats.dusted}</b></div>
          <div><span>Spells cast</span><b>${r.stats.spells}</b></div>
          <div><span>Peak detection</span><b>${Math.round(r.stats.maxDetection)}%</b></div>
        </div>
        <div class="medals">${medals.map((m) => `<span class="badge gold">${esc(m)}</span>`).join('')}</div>
      </div>
      ${letter}
      <div class="results-actions">
        ${r.outcome === 'report' && next ? `<button class="btn primary" data-a="next">Next: ${esc(next.title)} →</button>` : ''}
        <button class="btn" data-a="retry">↺ Replay mission</button>
        <button class="btn ghost" data-a="menu">⏏ Main menu</button>
      </div></div>`;
    el.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).closest('[data-a]')?.getAttribute('data-a');
      if (!a) return;
      audio.ui('click');
      if (a === 'next' && next) this.showBriefing(next);
      if (a === 'retry') this.showBriefing(def);
      if (a === 'menu') { this.disposeGame(); this.renderer.setScene(this.menuLevel!.scene, this.menuCam); this.showTitle(); return; }
      this.disposeGame();
      this.renderer.setScene(this.menuLevel!.scene, this.menuCam);
    });
    this.setScreen('results', el);
  }

  // ---------------------------------------------------------------- settings / manual / credits

  showSettings(back: () => void) {
    const el = h('div', { class: 'screen' });
    if (this.game) el.style.background = 'rgba(5,8,20,.6)';
    const page = h('div', { class: 'page glass' });
    const slider = (k: keyof Settings, label: string, min: number, max: number, step: number, fmt: (v: number) => string) =>
      `<div class="setting"><label>${label}</label><div style="display:flex;gap:.6rem;align-items:center"><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${settings[k]}"/><span class="val">${fmt(settings[k] as number)}</span></div></div>`;
    const toggle = (k: keyof Settings, label: string) => `<div class="setting"><label>${label}</label><button class="toggle ${settings[k] ? 'on' : ''}" data-tg="${k}" aria-pressed="${settings[k]}"></button></div>`;
    const seg = (k: keyof Settings, label: string, opts: string[]) => `<div class="setting"><label>${label}</label><div class="seg">${opts.map((o) => `<button class="${settings[k] === o ? 'on' : ''}" data-seg="${k}" data-v="${o}">${o}</button>`).join('')}</div></div>`;
    const pct = (v: number) => `${Math.round(v * 100)}%`;
    const render = () => {
      page.innerHTML = `
        <div class="page-head"><div><div class="eyebrow">Workshop</div><h2>Settings</h2></div>
        <div style="display:flex;gap:.6rem"><button class="btn ghost" data-a="reset">Reset</button><button class="btn" data-a="back">← Back</button></div></div>
        <div class="settings">
          <div class="setting-group"><h3>🔊 Sound</h3>
            ${slider('masterVolume', 'Master', 0, 1, 0.05, pct)}
            ${slider('musicVolume', 'Music', 0, 1, 0.05, pct)}
            ${slider('sfxVolume', 'Effects', 0, 1, 0.05, pct)}
          </div>
          <div class="setting-group"><h3>🖥️ Graphics</h3>
            ${seg('quality', 'Quality', ['low', 'medium', 'high', 'ultra'])}
            ${slider('fov', 'Field of view', 60, 100, 1, (v) => `${v}°`)}
            ${toggle('headBob', 'Head bob')}
            ${toggle('reduceMotion', 'Reduce motion')}
          </div>
          <div class="setting-group"><h3>🖱️ Controls</h3>
            ${slider('sensitivity', 'Mouse sensitivity', 0.2, 3, 0.05, (v) => v.toFixed(2))}
            ${toggle('invertY', 'Invert Y')}
            ${toggle('crouchToggle', 'Crouch is a toggle')}
          </div>
          <div class="setting-group"><h3>♿ Accessibility</h3>
            ${toggle('subtitles', 'Subtitles')}
            ${seg('subtitleSize', 'Subtitle size', ['small', 'medium', 'large'])}
            ${toggle('showVisionCones', 'Show vision cones')}
          </div>
        </div>`;
    };
    render();
    page.addEventListener('input', (e) => {
      const t = e.target as HTMLInputElement;
      const k = t.getAttribute('data-k') as keyof Settings | null;
      if (!k) return;
      updateSettings({ [k]: parseFloat(t.value) } as Partial<Settings>);
      const v = parseFloat(t.value);
      (t.nextElementSibling as HTMLElement).textContent = k === 'fov' ? `${v}°` : k === 'sensitivity' ? v.toFixed(2) : `${Math.round(v * 100)}%`;
    });
    page.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      const tg = t.getAttribute('data-tg') as keyof Settings | null;
      const sg = t.getAttribute('data-seg') as keyof Settings | null;
      const a = t.closest('[data-a]')?.getAttribute('data-a');
      if (tg) { updateSettings({ [tg]: !settings[tg] } as Partial<Settings>); audio.ui('toggle'); render(); }
      if (sg) { updateSettings({ [sg]: t.getAttribute('data-v') } as Partial<Settings>); audio.ui('toggle'); render(); }
      if (a === 'reset') { updateSettings({ ...defaultSettings }); render(); }
      if (a === 'back') { audio.ui('back'); back(); }
      this.hud.applySubSize();
      if (this.game) this.game.showCones = settings.showVisionCones;
    });
    el.append(page);
    this.setScreen('settings', el);
  }

  showManual(back: () => void) {
    const el = h('div', { class: 'screen' });
    const page = h('div', { class: 'page glass' });
    page.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Order of E.L.F. — Issue 24</div><h2>Field Manual</h2></div><button class="btn" data-a="back">← Back</button></div>
      <div class="manual-grid">
        <div class="manual-card">${controlsHtml()}</div>
        <div class="manual-card"><h3>🎯 Your mission</h3><p>Every Christmas Eve, wish lists get smudged. Sneak into the house, gather evidence of what the child <i>really</i> wants and how they behaved, then climb back up the chimney and file your report: the right gift, and the right ledger — Santa’s Nice list or Krampus’s Naughty list.</p>
          <ul><li><b>Wishes</b> point to a gift — but some are out of date or belong to someone else.</li><li><b>Deeds</b> reveal behaviour. Weigh the good against the bad.</li><li><b>Rumours</b> come from listening in, and from pets.</li></ul></div>
        <div class="manual-card"><h3>🌙 Staying unseen</h3><ul>
          <li>Your <b>light gem</b> ★ shows how visible you are. Shadows are your friend; lamps can be switched off.</li>
          <li>Crouching makes you smaller and quieter. Sprinting is loud.</li>
          <li><b>Carpet</b> is quiet, <b>tile</b> is loud, and some floorboards <b>squeak</b>.</li>
          <li>People have <b>vision cones</b>. A <b>?</b> means they’re suspicious; a <b>!</b> means you’ve been spotted. Break line of sight and hide.</li>
          <li>If the detection meter fills, the mission is over.</li></ul></div>
        <div class="manual-card"><h3>✨ Elf magic</h3><ul>
          <li><b>Shimmer</b> — 6 s of invisibility.</li>
          <li><b>Morph</b> — become a nutcracker until you move.</li>
          <li><b>Second Sight</b> — look at a toy marked ◆ and see through its eyes; tag people with ${kbd('F')}.</li>
          <li><b>Jingle Lure</b> — a thrown bell that rings and draws people over.</li>
          <li><b>Christmas Cheer</b> (${kbd('LMB')}) — sparkly dust that puts people to sleep and leaves a hiding cloud.</li>
          <li>Magic recharges slowly. Santa’s cookies restore it instantly.</li></ul></div>
        <div class="manual-card"><h3>🧰 Tricks of the trade</h3><ul>
          <li>Hide in closets, under beds, behind curtains, among presents — or <i>inside a cardboard box</i>.</li>
          <li>Throw ornaments, books and toys to make a distraction. Glass ornaments shatter loudly.</li>
          <li>People notice what’s out of place: a lamp you turned off, a broken bauble.</li>
          <li>Doors block sight and muffle sound. Close them behind you.</li>
          <li>Feed a dog a biscuit and it’ll be your friend for life.</li></ul></div>
      </div>`;
    page.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-a="back"]')) { audio.ui('back'); back(); }
    });
    el.append(page);
    this.setScreen('manual', el);
  }

  showCredits() {
    const el = h('div', { class: 'screen' });
    const page = h('div', { class: 'page glass' });
    page.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">With thanks</div><h2>Credits</h2></div><button class="btn" data-a="back">← Back</button></div>
      <div class="credits-cols">
        <div><h3 style="margin-bottom:.6rem">ABK Jam Team 7 — original game</h3><table>
          <tr><td>Shawn Wells</td><td>Producer / Level Designer</td></tr>
          <tr><td>Mondae Atughonu</td><td>Gameplay & AI Programming</td></tr>
          <tr><td>Echo (Beili) Yin</td><td>Generalist Programmer</td></tr>
          <tr><td>Jonathan Librizzi</td><td>UI Engineer</td></tr>
          <tr><td>Milton Clark</td><td>Software Engineer</td></tr>
          <tr><td>Sara Zorns</td><td>Concept, 2D Art & Narrative</td></tr>
          <tr><td>Molly Carroll</td><td>Environment Art & 3D Modelling</td></tr>
          <tr><td>Lu Xu</td><td>Opening Cinematic Artist</td></tr>
          <tr><td>Andre B</td><td>Concept Artist</td></tr></table></div>
        <div><h3 style="margin-bottom:.6rem">Open-source assets & tech</h3><table>
          <tr><td>3D models</td><td>Kenney — Furniture Kit, Holiday Kit, Food Kit, Blocky Characters (CC0)</td></tr>
          <tr><td>Particles</td><td>Kenney — Particle Pack (CC0)</td></tr>
          <tr><td>Sound effects</td><td>Kenney — Impact, Interface, RPG & UI Audio (CC0)</td></tr>
          <tr><td>Jingles</td><td>Kenney — Music Jingles (CC0)</td></tr>
          <tr><td>Carols</td><td>Public-domain melodies, synthesised live with Web Audio</td></tr>
          <tr><td>Fonts</td><td>Fraunces, Nunito, Caveat, Special Elite, Mountains of Christmas (OFL)</td></tr>
          <tr><td>Engine</td><td>three.js, pmndrs postprocessing, N8AO, Vite, TypeScript</td></tr></table>
          <p class="dim" style="margin-top:1rem;font-size:.85rem">Kenney assets: <a href="https://kenney.nl" target="_blank" rel="noopener">kenney.nl</a>. Licence files ship in <code>assets/licenses</code>.</p></div>
      </div>`;
    page.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-a="back"]')) { audio.ui('back'); this.showTitle(); }
    });
    el.append(page);
    this.setScreen('credits', el);
  }
}

function roleOf(n: import('../levels/types').NPCDef) {
  const r: Record<string, string> = { adult: 'Parent', kid: 'The child', teen: 'Teenager', elder: 'Grandparent', dog: 'Dog — keen nose', cat: 'Cat — talks to elves', robot: 'Robot vacuum' };
  return n.barks?.giveUp ? r[n.kind] : r[n.kind];
}

function clueCard(c: ClueDef, known: boolean) {
  if (!known) return `<div class="clue-card unknown"><span class="ic">❔</span><div><b>Undiscovered ${c.category === 'wish' ? 'wish' : c.category === 'deed' ? 'deed' : 'rumour'}</b><p>Keep searching.</p></div></div>`;
  return `<div class="clue-card"><span class="ic">${CATEGORY_ICON[c.category]}</span><div><b>${esc(c.title)}</b><p>${esc(c.text)}</p></div></div>`;
}

function controlsHtml() {
  const rows: [string[], string][] = [
    [['W', 'A', 'S', 'D'], 'Move'],
    [['Mouse'], 'Look'],
    [['Shift'], 'Sprint (loud)'],
    [['Q', 'C'], 'Crouch (toggle)'],
    [['Space'], 'Jump / climb onto furniture'],
    [['E'], 'Interact · pick up · read · hide (hold to search)'],
    [['LMB'], 'Throw Christmas Cheer / throw held item'],
    [['RMB'], 'Drop held item'],
    [['1', '2'], 'Cast your two spells'],
    [['F'], 'Tag a person (during Second Sight)'],
    [['3'], 'Jump to report once every clue is found'],
    [['Tab', 'Esc'], 'Journal & pause'],
  ];
  return `<h3>⌨️ Controls</h3><div class="controls-table">${rows.map(([k, d]) => `<div class="keys">${k.map(kbd).join('')}</div><div>${esc(d)}</div>`).join('')}</div>`;
}

function houseSvg(i: number) {
  const roof = ['#e6eefc', '#f1f6ff', '#e6eefc', '#f1f6ff', '#e6eefc'][i % 5];
  const body = ['#40536b', '#40536b', '#6b4a32', '#3a3150', '#7d2e2e'][i % 5];
  return `<svg class="house" viewBox="0 0 120 70"><polygon points="10,32 60,6 110,32" fill="${roof}"/><rect x="18" y="30" width="84" height="40" fill="${body}"/><rect x="28" y="40" width="14" height="12" fill="#ffc46b"/><rect x="78" y="40" width="14" height="12" fill="#ffc46b"/><rect x="54" y="46" width="12" height="24" fill="#8c1f2b"/>${Array.from({ length: 9 }, (_, k) => `<circle cx="${18 + k * 10.5}" cy="31" r="1.6" fill="${['#ff4d5e', '#ffd166', '#06d6a0', '#4cc9f0'][k % 4]}"/>`).join('')}<rect x="80" y="8" width="8" height="16" fill="#8a3f33"/></svg>`;
}
