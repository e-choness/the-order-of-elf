// Usage: start the game with `npm run dev` at the repo root, then: node capture-screenshots.mjs [title,living,spotted,cabin,manor,ui]
// Needs Playwright (npm i -D playwright). Renders with SwiftShader if no GPU, so it is slow but deterministic.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
const OUT = fileURLToPath(new URL('..', import.meta.url));
const only = process.argv[2];
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const W = 1920, H = 1080;
async function page(q = 'high', throttle = 7000) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', (e) => console.log('pageerror', e.message));
  await p.goto(`http://localhost:5173/?throttle=${throttle}`);
  await p.evaluate((q) => { localStorage.clear(); localStorage.setItem('elf.settings.v2', JSON.stringify({ quality: q, showVisionCones: true })); localStorage.setItem('elf.save.v2', JSON.stringify({ missions: { academy: { completed: true, bestEnding: 'promotion', bestRank: 5, ghost: true }, johnson: { completed: true, bestEnding: 'promotion', bestRank: 4 } }, seenIntro: true, totalCookies: 3 })); }, q);
  await p.reload();
  await p.waitForFunction(() => document.querySelector('.title-screen'), null, { timeout: 180000 });
  return p;
}
const shot = (p, name, extra = {}) => p.screenshot({ path: `${OUT}/${name}.jpg`, type: "jpeg", quality: 92, timeout: 240000, ...extra });
async function mission(p, idx, loadout = ['shimmer', 'sight']) {
  await p.evaluate(([i, l]) => { window.__app.loadout = l; window.__app.startMission(window.__LEVELS[i]); }, [idx, loadout]);
  await p.waitForFunction(() => window.__app.screen === 'play', null, { timeout: 180000 });
  await p.evaluate(() => {
    const g = window.__app.game; window.__app.input.allowUnlocked = true; g.intro = 0; g.renderer.stealth.set('uFade', 0);
    g.end = function () {}; // never end the mission while staging a shot
    window.__sim = (s) => { for (let t = 0; t < s; t += 0.05) { g.update(0.05); window.__app.input.endFrame(); if (g.ended) break; } };
    document.querySelector('.click-to-play')?.remove();
  });
}
// place camera: player at (px,pz) looking toward (lx,lz)
const cam = (p, px, pz, lx, lz, pitch = -0.08, sim = 0, freeze = true, crouch = false) => p.evaluate(([px, pz, lx, lz, pitch, sim, freeze, crouch]) => {
  const g = window.__app.game; window.__sim(sim);
  g.player.pos.set(px, 0, pz); g.player.crouched = crouch; g.player.yaw = Math.atan2(-(lx - px), -(lz - pz)); g.player.pitch = pitch;
  g.ended = false; g.detection = 0; g.player.updateCamera(0); g.update(0.001); g.player.updateCamera(0);
  if (freeze) { g.__upd = g.update; g.update = function (dt) { this.level.update(dt, this.time += dt, this.player.camera.position); this.hud.update(this, dt); }; }
}, [px, pz, lx, lz, pitch, sim, freeze, crouch]);
const hud = (p, on) => p.evaluate((on) => { document.querySelector('.hud').classList.toggle('hidden', !on); }, on);
const settle = (p, ms = 16000) => p.waitForTimeout(ms);
const want = (n) => !only || only.split(',').includes(n);

if (want('title')) {
  const p = await page('high', 6000);
  await p.evaluate(() => { window.__app.menuT = -13; });
  await settle(p, 16000);
  await shot(p, 'screenshots/01-title');
  // clean key art (no UI) + transparent logo
  await p.evaluate(() => { document.querySelector('.ui').style.visibility = 'hidden'; document.querySelector('.snowfall').style.display = 'none'; window.__app.menuT = -13.2; });
  await settle(p, 8000);
  await shot(p, 'art/keyart-clean');
  await p.evaluate(() => { document.querySelector('.ui').style.visibility = ''; document.querySelector('.menu').style.display = 'none'; document.querySelector('.title-foot').style.display = 'none'; document.querySelector('.title-hint').style.display = 'none'; document.querySelector('#game-canvas').style.visibility = 'hidden'; document.querySelector('.snowfall').style.display = 'none'; document.body.style.background = 'transparent'; document.documentElement.style.background = 'transparent'; document.querySelector('.title-screen').style.background = 'none'; const l = document.querySelector('.logo'); l.style.padding = '12px 40px 34px 14px'; });
  await settle(p, 1500);
  await p.locator('.logo').screenshot({ path: `${OUT}/logo/logo-transparent.png`, omitBackground: true, timeout: 120000 });
  await p.close();
}
if (want('living')) {
  const p = await page();
  await mission(p, 1);
  await cam(p, 1.0, 5.3, 5.5, 1.0, 0.05, 30);
  await settle(p);
  await shot(p, 'screenshots/02-living-room');
  await cam(p, 3.5, 2.0, 3.5, 0.0, -0.05, 0, false);
  await hud(p, false); await settle(p);
  await shot(p, 'art/fireplace-clean');
  await p.close();
}
if (want('spotted')) {
  const p = await page();
  await mission(p, 1);
  await p.evaluate(() => {
    const g = window.__app.game; window.__sim(20);
    const m = g.npcs[0]; m.pos.set(13.3, 0, 2.0); m.body.root.position.copy(m.pos);
    g.player.pos.set(10.9, 0, 3.4);
    m.heading = Math.atan2(g.player.pos.x - m.pos.x, g.player.pos.z - m.pos.z);
    m.state = 'alert'; m.suspicion = 1.3; m.seeing = 0.8; m.lookTarget = g.player.chest;
    g.detection = 62;
    const e = new window.__THREE.Vector3(13.3, 1.35, 2.0);
    g.player.yaw = Math.atan2(-(e.x - g.player.pos.x), -(e.z - g.player.pos.z)); g.player.pitch = 0.12; g.player.updateCamera(0);
    m.update(0.05, g.time);
    g.update = function (dt) { this.level.update(dt, this.time += dt, this.player.camera.position); m.body.update(dt, 'alert', 0, 0, 0, this.time); m.body.root.rotation.y = m.heading; this.hud.update(this, dt); this.renderer.stealth.set('uAlert', 1); this.renderer.stealth.set('uSuspicion', 1); };
  });
  await settle(p);
  await shot(p, 'screenshots/03-spotted');
  await p.close();
}
if (want('cabin')) {
  const p = await page();
  await mission(p, 2);
  await cam(p, 6.9, 4.8, 1.2, 2.4, -0.1, 25);
  await settle(p);
  await shot(p, 'screenshots/04-frostbrook-cabin');
  await p.close();
}
if (want('manor')) {
  const p = await page();
  await mission(p, 3, ['sight', 'lure']);
  await cam(p, 6.4, 1.3, 1.0, 4.4, -0.08, 20);
  await settle(p);
  await shot(p, 'screenshots/05-whitmore-manor');
  await p.evaluate(() => { const g = window.__app.game; g.update = g.__upd; const toy = g.interactables.find((i) => i.constructor.name === 'SightToy' && i.def.id === 'n1'); g.abilities.trySight(toy); window.__sim(0.4); g.abilities.tagged.set('maya', 40); g.abilities.tagged.set('raj', 40); const f = g.update; g.update = function (dt) { this.level.update(dt, this.time += dt, this.player.camera.position); this.hud.update(this, dt); }; });
  await settle(p);
  await shot(p, 'screenshots/06-second-sight');
  await p.close();
}
if (want('ui')) {
  const p = await page('medium', 5000);
  await p.click('[data-a=missions]'); await settle(p, 6000);
  await shot(p, 'screenshots/07-missions');
  await p.click('.mission[data-id=frostbrook]'); await settle(p, 6000);
  await shot(p, 'screenshots/08-briefing');
  await mission(p, 1);
  await cam(p, 9.6, 2.6, 9.3, 3.6, -0.6, 3);
  await p.evaluate(() => { const g = window.__app.game; g.update = g.__upd; const n = g.interactables.find((i) => i.constructor.name === 'NoteClue' && i.clue.id === 'apology'); n.use(g); window.__sim(0.1); });
  await settle(p, 8000);
  await shot(p, 'screenshots/09-reading-a-note');
  await p.evaluate(() => { const g = window.__app.game; window.__app.overlays.forceClose(); for (const i of g.interactables) if (i.clue && ['photo', 'catalog', 'receipt', 'apology', 'science', 'helmet'].includes(i.clue.id)) g.foundClue(i.clue); window.__app.openPause(); });
  await settle(p, 6000);
  await shot(p, 'screenshots/10-journal');
  await p.evaluate(() => window.__app.openReport()); await settle(p, 3000);
  await p.click('[data-g=dino-blaster]'); await p.click('[data-l=nice]'); await settle(p, 5000);
  await shot(p, 'screenshots/11-report');
  await p.click('[data-a=submit]'); await settle(p, 7000);
  await shot(p, 'screenshots/12-results');
  await p.close();
}
await b.close();
console.log('done');
