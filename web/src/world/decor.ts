// Hand-built festive set dressing: fireplace, stockings, picture frames,
// posters, clocks, calendars, garlands and paper snowflakes.

import * as THREE from 'three';
import type { LevelDef } from '../levels/types';
import { makeProp } from './props';
import { F, type PhysicsWorld } from './physics';
import { paintingTexture, wallTexture, star } from './textures';

export interface DecorResult {
  group: THREE.Group;
  clocks: THREE.Object3D[];
}

export function buildFireplace(x: number, z: number, rot: number, world: PhysicsWorld): THREE.Group {
  const g = new THREE.Group();
  const brick = new THREE.MeshStandardMaterial({ map: wallTexture('brick', '#9a4a3a'), roughness: 0.95 });
  brick.map = brick.map!.clone();
  brick.map.needsUpdate = true;
  brick.map.repeat.set(1.5, 1.5);
  const stone = new THREE.MeshStandardMaterial({ color: 0x8f8a85, roughness: 0.9 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x5b3a26, roughness: 0.6 });
  const soot = new THREE.MeshStandardMaterial({ color: 0x120c0a, roughness: 1 });
  const W = 1.9, D = 0.55, H = 1.2;
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, px: number, py: number, pz: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(px, py, pz);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    return m;
  };
  // sides + top of the firebox surround
  add(new THREE.BoxGeometry(0.45, H, D), brick, -W / 2 + 0.225, H / 2, 0);
  add(new THREE.BoxGeometry(0.45, H, D), brick, W / 2 - 0.225, H / 2, 0);
  add(new THREE.BoxGeometry(W - 0.9, 0.35, D), brick, 0, H - 0.175, 0);
  add(new THREE.BoxGeometry(W - 0.9, H - 0.35, 0.1), soot, 0, (H - 0.35) / 2, -D / 2 + 0.05);
  // mantel
  add(new THREE.BoxGeometry(W + 0.25, 0.09, D + 0.18), wood, 0, H + 0.045, 0.05);
  // chimney breast to the ceiling
  add(new THREE.BoxGeometry(W - 0.3, 2.6 - H - 0.09, D - 0.12), brick, 0, H + 0.09 + (2.6 - H - 0.09) / 2, -0.06);
  // hearth
  add(new THREE.BoxGeometry(W + 0.3, 0.06, 0.55), stone, 0, 0.03, D / 2 + 0.25);
  // logs
  const logGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.7, 8);
  for (const [lx, ly, lr] of [[0, 0.1, 0.1], [0, 0.2, -0.2], [0.05, 0.1, 0.5]]) {
    const l = add(logGeo, wood, lx, ly, -0.02);
    l.rotation.z = Math.PI / 2 + lr;
  }
  // embers glow
  const ember = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.25), new THREE.MeshStandardMaterial({ color: 0, emissive: 0xff5a1a, emissiveIntensity: 2.5 }));
  ember.rotation.x = -Math.PI / 2;
  ember.position.set(0, 0.04, 0);
  g.add(ember);
  // mantel garland with berries
  const garMat = new THREE.MeshStandardMaterial({ color: 0x1f5a35, roughness: 0.9 });
  const berry = new THREE.MeshStandardMaterial({ color: 0xc0182c, roughness: 0.4, emissive: 0x300000 });
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07 + Math.random() * 0.03, 0), garMat);
    s.position.set(-W / 2 - 0.05 + t * (W + 0.1), H + 0.12 - Math.sin(t * Math.PI) * 0.03, D / 2 + 0.08);
    g.add(s);
    if (i % 2 === 0) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), berry);
      b.position.copy(s.position).add(new THREE.Vector3(0.03, 0.05, 0.05));
      g.add(b);
    }
  }
  // candles on mantel
  for (const cx of [-0.75, 0.75]) {
    const c = add(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 10), new THREE.MeshStandardMaterial({ color: 0xf3ead8 }), cx, H + 0.2, 0);
    c.castShadow = false;
  }
  g.position.set(x, 0, z);
  g.rotation.y = THREE.MathUtils.degToRad(rot);
  g.updateWorldMatrix(true, true);
  // colliders: two pillars + mantel top (climbable!) + chimney breast
  const pillars = [-W / 2 + 0.225, W / 2 - 0.225];
  for (const px of pillars) {
    const p = new THREE.Vector3(px, 0, 0).applyMatrix4(g.matrixWorld);
    const ext = rot % 180 === 0 ? [0.45, D] : [D, 0.45];
    world.addBox(p.x, 0, p.z, ext[0], H + 0.09, ext[1], F.ALL, { surface: 'tile' });
  }
  const back = new THREE.Vector3(0, 0, -D / 2 + 0.1).applyMatrix4(g.matrixWorld);
  world.addBox(back.x, 0, back.z, rot % 180 === 0 ? W : 0.2, H + 0.09, rot % 180 === 0 ? 0.2 : W, F.ALL);
  const top = new THREE.Vector3(0, 0, 0).applyMatrix4(g.matrixWorld);
  world.addBox(top.x, H - 0.35, top.z, rot % 180 === 0 ? W - 0.9 : D, 0.44, rot % 180 === 0 ? D : W - 0.9, F.ALL, { surface: 'wood' });
  const breast = new THREE.Vector3(0, 0, -0.06).applyMatrix4(g.matrixWorld);
  world.addBox(breast.x, H + 0.09, breast.z, rot % 180 === 0 ? W - 0.3 : D - 0.12, 2.6 - H, rot % 180 === 0 ? D - 0.12 : W - 0.3, F.ALL);
  return g;
}

function labelTexture(text: string, bg: string, fg: string, w = 256, h = 128, font = '700 64px Fraunces Variable, serif') {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.font = font;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildDecor(level: LevelDef, world: PhysicsWorld): DecorResult {
  const g = new THREE.Group();
  const clocks: THREE.Object3D[] = [];
  let seed = level.index * 31;
  for (const d of level.decor ?? []) {
    const o = new THREE.Group();
    o.position.set(d.x, d.y, d.z);
    o.rotation.y = THREE.MathUtils.degToRad(d.rot);
    switch (d.kind) {
      case 'stocking': {
        const mat = new THREE.MeshStandardMaterial({ color: d.color ?? '#c0392b', roughness: 0.9 });
        const cuff = new THREE.MeshStandardMaterial({ color: 0xf8f4ee, roughness: 1 });
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.07), mat);
        leg.position.y = -0.2;
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.07), mat);
        foot.position.set(0.05, -0.37, 0);
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.09, 0.08), cuff);
        top.position.y = -0.02;
        if (d.label) {
          const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.07), new THREE.MeshStandardMaterial({ map: labelTexture(d.label, '#f8f4ee', '#8a1f2b', 256, 96, '700 58px Fraunces Variable, serif') }));
          lbl.position.set(0, -0.02, 0.041);
          o.add(lbl);
        }
        for (const m of [leg, foot, top]) { m.castShadow = true; o.add(m); }
        break;
      }
      case 'wreath': {
        const w = makeProp({ m: 'holiday/wreath', x: 0, z: 0 });
        w.rotation.x = 0;
        o.add(w);
        break;
      }
      case 'frame': {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.62, 0.04), new THREE.MeshStandardMaterial({ color: 0xc19a5b, roughness: 0.4, metalness: 0.5 }));
        const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.52), new THREE.MeshStandardMaterial({ map: paintingTexture(seed++), roughness: 0.7 }));
        pic.position.z = 0.021;
        o.add(frame, pic);
        break;
      }
      case 'poster': {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 360;
        const x = c.getContext('2d')!;
        const grd = x.createLinearGradient(0, 0, 0, 360);
        grd.addColorStop(0, '#f2c14e'); grd.addColorStop(1, '#e07a3f');
        x.fillStyle = grd; x.fillRect(0, 0, 256, 360);
        x.fillStyle = '#2f5547';
        // dino silhouette
        x.beginPath();
        x.ellipse(128, 210, 70, 42, 0, 0, Math.PI * 2);
        x.ellipse(196, 150, 34, 24, -0.4, 0, Math.PI * 2);
        x.fill();
        x.fillRect(80, 240, 22, 60); x.fillRect(140, 240, 22, 60);
        x.beginPath(); x.moveTo(60, 200); x.lineTo(10, 260); x.lineTo(70, 225); x.fill();
        x.fillStyle = '#fffbe8';
        x.font = '900 46px Fraunces Variable, serif';
        x.textAlign = 'center';
        x.fillText(d.label ?? 'ROAR', 128, 70);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        const p = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.84), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 }));
        o.add(p);
        break;
      }
      case 'clock': {
        const face = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 32), new THREE.MeshStandardMaterial({ color: 0xf8f1e2 }));
        face.rotation.x = Math.PI / 2;
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 8, 32), new THREE.MeshStandardMaterial({ color: 0x5b3a26, roughness: 0.5 }));
        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.15, 0.01), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        hand.geometry.translate(0, 0.07, 0);
        hand.position.z = 0.03;
        const hand2 = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.1, 0.01), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        hand2.geometry.translate(0, 0.045, 0);
        hand2.position.z = 0.035;
        o.add(face, rim, hand, hand2);
        o.userData.hands = [hand, hand2];
        clocks.push(o);
        break;
      }
      case 'calendar': {
        const c = document.createElement('canvas');
        c.width = 200; c.height = 260;
        const x = c.getContext('2d')!;
        x.fillStyle = '#fbf6ec'; x.fillRect(0, 0, 200, 260);
        x.fillStyle = '#b8323f'; x.fillRect(0, 0, 200, 54);
        x.fillStyle = '#fff'; x.font = '700 30px Fraunces Variable, serif'; x.textAlign = 'center';
        x.fillText('DECEMBER', 100, 38);
        x.font = '600 16px Nunito Variable, sans-serif';
        for (let i = 0; i < 31; i++) {
          const cx = 20 + (i % 7) * 27, cy = 80 + Math.floor(i / 7) * 34;
          x.fillStyle = i === 23 ? '#b8323f' : '#444';
          x.fillText(String(i + 1), cx + 6, cy + 6);
          if (i < 23) { x.strokeStyle = '#b8323f'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx - 4, cy - 6); x.lineTo(cx + 16, cy + 12); x.stroke(); }
        }
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        o.add(new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.39), new THREE.MeshStandardMaterial({ map: t })));
        break;
      }
      case 'garland': {
        const mat = new THREE.MeshStandardMaterial({ color: 0x1f5a35, roughness: 0.9 });
        const bulbs = ['#ff4d5e', '#ffd166', '#06d6a0', '#4cc9f0'];
        for (let i = 0; i < 26; i++) {
          const t = i / 25;
          const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), mat);
          s.position.set((t - 0.5) * 2.2, -(Math.sin(t * Math.PI * 3) ** 2) * 0.12, 0.05);
          o.add(s);
          if (i % 2) {
            const b = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), new THREE.MeshStandardMaterial({ color: 0, emissive: bulbs[i % 4], emissiveIntensity: 3 }));
            b.position.copy(s.position).add(new THREE.Vector3(0, -0.05, 0.04));
            o.add(b);
          }
        }
        break;
      }
      case 'snowflake': {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const x = c.getContext('2d')!;
        x.fillStyle = '#ffffff';
        x.translate(64, 64);
        for (let i = 0; i < 6; i++) {
          x.rotate(Math.PI / 3);
          x.fillRect(-3, 0, 6, 56);
          x.fillRect(-14, 30, 28, 4);
          x.fillRect(-10, 44, 20, 4);
        }
        x.setTransform(1, 0, 0, 1, 0, 0);
        x.fillStyle = '#ffe38a';
        star(x, 64, 64, 10);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        o.add(new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.3 })));
        break;
      }
    }
    o.traverse((m) => { if ((m as THREE.Mesh).isMesh) (m as THREE.Mesh).receiveShadow = true; });
    g.add(o);
  }
  void world;
  return { group: g, clocks };
}
