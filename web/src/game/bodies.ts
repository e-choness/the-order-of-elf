// Character bodies with procedural animation.
// Humans use Kenney's Blocky Characters (CC0), re-pivoted at the joints so the
// limbs can be animated; pets and the robot vacuum are built in the same chunky style.

import * as THREE from 'three';
import { cloneModel, makeSkin } from '../core/assets';
import type { NPCDef } from '../levels/types';

export type Pose = 'stand' | 'walk' | 'run' | 'sit' | 'sleep' | 'lie' | 'phone' | 'cook' | 'wrap' | 'read' | 'tv' | 'snack' | 'sniff' | 'clean' | 'look' | 'stunned' | 'alert' | 'talk' | 'sitUp';

export interface Body {
  root: THREE.Group;
  height: number;
  eyeHeight: number;
  headWorld(): THREE.Vector3;
  update(dt: number, pose: Pose, speed: number, headYaw: number, headPitch: number, time: number): void;
  setSitHeight(y: number): void;
  flashlight?: THREE.SpotLight;
  /** materials to flash/outline */
  meshes: THREE.Mesh[];
}

const U = 1 / 16; // blocky units → normalised height

function damp(cur: number, target: number, k: number, dt: number) {
  return cur + (target - cur) * Math.min(1, k * dt);
}

export async function buildBody(def: NPCDef): Promise<Body> {
  if (def.kind === 'dog' || def.kind === 'cat') return buildPet(def);
  if (def.kind === 'robot') return buildRobot();
  return buildHuman(def);
}

async function buildHuman(def: NPCDef): Promise<Body> {
  const height = def.kind === 'kid' ? 1.12 : def.kind === 'teen' ? 1.62 : def.kind === 'elder' ? 1.68 : 1.78;
  const src = cloneModel('characters/advancedCharacter.gltf');
  const tex = await makeSkin(def.skin ?? { base: 'man' });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
  const parts: Record<string, THREE.Mesh> = {};
  src.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) parts[m.name.replace(/\d+$/, '')] = m;
  });
  // some exporters name the mesh after the node; fall back to node names
  if (!parts.Body) src.children.forEach((c) => { if ((c as THREE.Mesh).isMesh) parts[c.name.replace(/\d+$/, '')] = c as THREE.Mesh; });

  const root = new THREE.Group();
  const scaler = new THREE.Group();
  const s = height * U;
  scaler.scale.setScalar(s);
  root.add(scaler);
  const meshes: THREE.Mesh[] = [];
  const pivot = (name: string, jx: number, jy: number, jz: number, parent: THREE.Object3D) => {
    const g = new THREE.Group();
    g.position.set(jx, jy, jz);
    const m = parts[name];
    if (m) {
      const mm = m.clone();
      mm.material = mat;
      mm.position.set(-jx, -jy, -jz);
      mm.castShadow = true;
      mm.receiveShadow = true;
      g.add(mm);
      meshes.push(mm);
    }
    parent.add(g);
    return g;
  };
  const hips = new THREE.Group();
  hips.position.set(0, 6, 0);
  scaler.add(hips);
  const torso = pivot('Body', 0, 0, 0, hips);
  // body mesh is authored in model space; the pivot helper offsets by the joint
  torso.children[0]?.position.set(0, -6, 0);
  const head = new THREE.Group();
  head.position.set(0, 6, 0);
  torso.add(head);
  const headMesh = parts.Head?.clone();
  if (headMesh) {
    headMesh.material = mat;
    headMesh.position.set(0, -12, 0);
    headMesh.castShadow = true;
    head.add(headMesh);
    meshes.push(headMesh);
  }
  if (def.kind === 'kid') head.scale.setScalar(1.22);
  const armL = new THREE.Group(); armL.position.set(3, 6, 0); torso.add(armL);
  const armR = new THREE.Group(); armR.position.set(-3, 6, 0); torso.add(armR);
  for (const [g, n, jx] of [[armL, 'ArmLeft', 3], [armR, 'ArmRight', -3]] as const) {
    const m = parts[n]?.clone();
    if (m) { m.material = mat; m.position.set(-jx, -12, 0); m.castShadow = true; g.add(m); meshes.push(m); }
  }
  const legL = pivot('LegLeft', 1, 6, 0, scaler);
  const legR = pivot('LegRight', -1, 6, 0, scaler);

  // festive extras: santa hats for some, a phone, flashlight
  const hat = new THREE.Group();
  if (def.kind === 'kid' || def.kind === 'teen') {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.3, 4.5, 8), new THREE.MeshStandardMaterial({ color: 0xc0182c, roughness: 0.8 }));
    cone.position.set(0, 18.2, -0.3);
    cone.rotation.x = -0.25;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.55, 6, 16), new THREE.MeshStandardMaterial({ color: 0xf8f4ee, roughness: 1 }));
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 16.2, 0);
    const pom = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), rim.material);
    pom.position.set(0, 20.3, -1.1);
    hat.add(cone, rim, pom);
    hat.position.set(0, -12, 0);
    head.add(hat);
  }
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.25), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x6fa8ff, emissiveIntensity: 0.6 }));
  phone.position.set(-1, -6.4, 1.3);
  phone.visible = false;
  armR.add(phone);

  let flashlight: THREE.SpotLight | undefined;
  if (def.flashlight) {
    const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 2.2, 10), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.4 }));
    torch.rotation.x = Math.PI / 2;
    torch.position.set(-1, -6.5, 1.4);
    armR.add(torch);
    flashlight = new THREE.SpotLight(0xfff1d0, 14, 11, 0.42, 0.45, 1.3);
    flashlight.position.set(-1, -6.5, 2.4);
    const tgt = new THREE.Object3D();
    tgt.position.set(-1, -9, 12);
    armR.add(flashlight, tgt);
    flashlight.target = tgt;
    flashlight.castShadow = false;
  }

  let walkPhase = 0;
  let sitK = 0, lieK = 0, armRaise = 0, armFwd = 0, bob = 0, sitY = 0.45;
  const state = { hy: 0, hp: 0 };
  return {
    root,
    height,
    eyeHeight: height * 0.9,
    meshes,
    flashlight,
    setSitHeight(y) { sitY = y; },
    headWorld() {
      const v = new THREE.Vector3();
      head.getWorldPosition(v);
      v.y += height * 0.06;
      return v;
    },
    update(dt, pose, speed, headYaw, headPitch, time) {
      const moving = pose === 'walk' || pose === 'run';
      walkPhase += dt * speed * (def.kind === 'kid' ? 9 : 6.5);
      const swing = moving ? Math.min(1, speed / 1.2) * (pose === 'run' ? 0.95 : 0.6) : 0;
      sitK = damp(sitK, pose === 'sit' || pose === 'tv' || pose === 'read' || pose === 'sitUp' ? 1 : 0, 6, dt);
      lieK = damp(lieK, pose === 'sleep' || pose === 'lie' ? 1 : 0, 4, dt);
      armRaise = damp(armRaise, pose === 'phone' ? 1 : pose === 'alert' ? 0.6 : 0, 6, dt);
      armFwd = damp(armFwd, pose === 'cook' || pose === 'wrap' || pose === 'read' || pose === 'snack' || pose === 'clean' ? 1 : 0, 6, dt);
      phone.visible = pose === 'phone';
      const sw = Math.sin(walkPhase) * swing;
      legL.rotation.x = sw * (1 - sitK) - sitK * Math.PI / 2;
      legR.rotation.x = -sw * (1 - sitK) - sitK * Math.PI / 2;
      armL.rotation.x = -sw * 0.9 * (1 - armFwd) - armFwd * 1.1 + (pose === 'cook' || pose === 'wrap' ? Math.sin(time * 6) * 0.15 : 0);
      armR.rotation.x = sw * 0.9 * (1 - armFwd) * (1 - armRaise) - armFwd * 1.1 - armRaise * 2.4 + (pose === 'clean' ? Math.sin(time * 5) * 0.4 : 0);
      armR.rotation.z = armRaise * 0.5;
      armL.rotation.z = pose === 'alert' ? -0.5 : 0;
      armR.rotation.y = pose === 'phone' ? 0.3 : 0;
      // breathing / bobbing
      bob = moving ? Math.abs(Math.sin(walkPhase)) * 0.25 * swing : Math.sin(time * 1.6) * 0.06;
      hips.position.y = 6 + bob - sitK * (6 - sitY / s);
      hips.position.z = sitK * -0.5;
      torso.rotation.x = pose === 'sniff' || pose === 'clean' ? 0.35 : pose === 'run' ? 0.15 : pose === 'stunned' ? Math.sin(time * 1.5) * 0.12 + 0.15 : 0;
      torso.rotation.z = pose === 'stunned' ? Math.sin(time * 1.1) * 0.1 : 0;
      // lie down for sleeping
      scaler.rotation.x = -lieK * Math.PI / 2;
      scaler.position.y = lieK * 0.12;
      scaler.position.z = lieK * height * 0.5;
      // head look
      state.hy = damp(state.hy, headYaw, 8, dt);
      state.hp = damp(state.hp, headPitch, 8, dt);
      head.rotation.y = state.hy;
      head.rotation.x = -state.hp + (pose === 'stunned' ? 0.35 : 0) + (pose === 'phone' ? 0.1 : 0);
    },
  };
}

function buildPet(def: NPCDef): Body {
  const isCat = def.kind === 'cat';
  const root = new THREE.Group();
  const furCol = new THREE.Color(def.skin?.shirt ?? (isCat ? '#f2efe9' : '#c48a4a'));
  const fur = new THREE.MeshStandardMaterial({ color: furCol, roughness: 0.95 });
  const fur2 = new THREE.MeshStandardMaterial({ color: new THREE.Color(def.skin?.pants ?? (isCat ? '#9aa0a8' : '#7a5230')), roughness: 0.95 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.4 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xff9aa8, roughness: 0.7 });
  const L = isCat ? 0.42 : 0.62, Wd = isCat ? 0.2 : 0.28, Hh = isCat ? 0.2 : 0.27;
  const legH = isCat ? 0.16 : 0.26;
  const meshes: THREE.Mesh[] = [];
  const mk = (g: THREE.BufferGeometry, m: THREE.Material) => {
    const mesh = new THREE.Mesh(g, m);
    mesh.castShadow = true;
    meshes.push(mesh);
    return mesh;
  };
  const body = new THREE.Group();
  body.position.y = legH + Hh / 2;
  root.add(body);
  const torso = mk(new THREE.BoxGeometry(Wd, Hh, L), fur);
  body.add(torso);
  const patch = mk(new THREE.BoxGeometry(Wd + 0.01, Hh * 0.5, L * 0.4), fur2);
  patch.position.set(0, Hh * 0.28, -L * 0.1);
  body.add(patch);
  const head = new THREE.Group();
  head.position.set(0, Hh * 0.45, L / 2 + 0.02);
  body.add(head);
  const hs = isCat ? 0.17 : 0.22;
  const skull = mk(new THREE.BoxGeometry(hs, hs * 0.9, hs), fur);
  skull.position.set(0, hs * 0.35, hs * 0.3);
  head.add(skull);
  const snout = mk(new THREE.BoxGeometry(hs * 0.55, hs * 0.4, hs * (isCat ? 0.25 : 0.55)), isCat ? fur : fur2);
  snout.position.set(0, hs * 0.18, hs * (isCat ? 0.85 : 0.98));
  head.add(snout);
  const nose = mk(new THREE.BoxGeometry(hs * 0.2, hs * 0.14, hs * 0.08), isCat ? pink : dark);
  nose.position.set(0, hs * 0.32, hs * (isCat ? 0.99 : 1.27));
  head.add(nose);
  for (const sx of [-1, 1]) {
    const eye = mk(new THREE.BoxGeometry(hs * 0.14, hs * 0.16, 0.01), dark);
    eye.position.set(sx * hs * 0.24, hs * 0.5, hs * 0.81);
    head.add(eye);
    const shine = new THREE.Mesh(new THREE.BoxGeometry(hs * 0.05, hs * 0.05, 0.005), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    shine.position.set(sx * hs * 0.22, hs * 0.54, hs * 0.818);
    head.add(shine);
    if (isCat) {
      const ear = mk(new THREE.ConeGeometry(hs * 0.22, hs * 0.38, 4), fur);
      ear.position.set(sx * hs * 0.3, hs * 0.95, hs * 0.25);
      ear.rotation.y = Math.PI / 4;
      head.add(ear);
    } else {
      const ear = mk(new THREE.BoxGeometry(hs * 0.18, hs * 0.5, hs * 0.3), fur2);
      ear.position.set(sx * hs * 0.55, hs * 0.5, hs * 0.2);
      ear.rotation.z = sx * 0.3;
      head.add(ear);
    }
  }
  if (!isCat) {
    const collar = mk(new THREE.BoxGeometry(Wd * 0.9, 0.05, 0.06), new THREE.MeshStandardMaterial({ color: 0xc0182c }));
    collar.position.set(0, Hh * 0.3, L / 2 - 0.02);
    body.add(collar);
    const tag = mk(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 10), new THREE.MeshStandardMaterial({ color: 0xffd36e, metalness: 0.8, roughness: 0.3 }));
    tag.rotation.x = Math.PI / 2;
    tag.position.set(0, Hh * 0.18, L / 2 + 0.02);
    body.add(tag);
  } else {
    const bell = mk(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffd36e, metalness: 0.9, roughness: 0.25 }));
    bell.position.set(0, Hh * 0.05, L / 2 + 0.03);
    body.add(bell);
  }
  const tail = new THREE.Group();
  tail.position.set(0, Hh * 0.35, -L / 2);
  body.add(tail);
  const tailM = mk(new THREE.BoxGeometry(0.05, 0.05, isCat ? 0.34 : 0.2), isCat ? fur2 : fur);
  tailM.position.z = isCat ? -0.16 : -0.09;
  tail.add(tailM);
  tail.rotation.x = isCat ? -0.9 : -0.6;
  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const g = new THREE.Group();
    g.position.set(lx * (Wd / 2 - 0.04), legH, lz * (L / 2 - 0.06));
    const leg = mk(new THREE.BoxGeometry(0.07, legH, 0.07), fur);
    leg.position.y = -legH / 2;
    g.add(leg);
    root.add(g);
    legs.push(g);
  }
  let phase = 0, lie = 0;
  const st = { hy: 0, hp: 0 };
  return {
    root,
    height: legH + Hh + hs,
    eyeHeight: legH + Hh + hs * 0.5,
    meshes,
    setSitHeight() { /* pets lie on the floor */ },
    headWorld() {
      const v = new THREE.Vector3();
      head.getWorldPosition(v);
      v.y += hs * 0.5;
      return v;
    },
    update(dt, pose, speed, headYaw, headPitch, time) {
      const moving = pose === 'walk' || pose === 'run';
      phase += dt * speed * 11;
      const sw = moving ? Math.sin(phase) * Math.min(0.9, speed * 0.5) : 0;
      legs[0].rotation.x = sw; legs[3].rotation.x = sw;
      legs[1].rotation.x = -sw; legs[2].rotation.x = -sw;
      lie = damp(lie, pose === 'sleep' || pose === 'lie' || pose === 'sit' || pose === 'stunned' ? 1 : 0, 4, dt);
      body.position.y = legH + Hh / 2 - lie * legH * 0.9 + (moving ? Math.abs(Math.sin(phase)) * 0.02 : Math.sin(time * 2) * 0.004);
      for (const l of legs) l.scale.y = 1 - lie * 0.85;
      tail.rotation.y = Math.sin(time * (pose === 'alert' ? 14 : isCat ? 2 : 8)) * (isCat ? 0.3 : 0.6) * (pose === 'sleep' ? 0.1 : 1);
      tail.rotation.x = isCat ? -0.9 - (pose === 'alert' ? 0.6 : 0) : -0.6;
      st.hy = damp(st.hy, headYaw, 7, dt);
      st.hp = damp(st.hp, pose === 'sniff' ? -0.6 : pose === 'sleep' ? -0.3 : headPitch, 7, dt);
      head.rotation.y = st.hy;
      head.rotation.x = -st.hp;
      body.rotation.z = pose === 'sleep' ? lie * 0.4 : 0;
    },
  };
}

function buildRobot(): Body {
  const root = new THREE.Group();
  const meshes: THREE.Mesh[] = [];
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.18, 0.08, 24), new THREE.MeshStandardMaterial({ color: 0x2b2f3a, metalness: 0.4, roughness: 0.35 }));
  shell.position.y = 0.05;
  shell.castShadow = true;
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.01, 24), new THREE.MeshStandardMaterial({ color: 0x8a95a8, metalness: 0.7, roughness: 0.25 }));
  top.position.y = 0.095;
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 6), new THREE.MeshStandardMaterial({ color: 0, emissive: 0x40ff90, emissiveIntensity: 3 }));
  led.position.set(0, 0.1, 0.12);
  const antler = new THREE.Group(); // festive reindeer antlers sticker!
  for (const sx of [-1, 1]) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.09, 0.012), new THREE.MeshStandardMaterial({ color: 0x8b5a2b }));
    a.position.set(sx * 0.06, 0.14, 0.02);
    a.rotation.z = -sx * 0.4;
    antler.add(a);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshStandardMaterial({ color: 0, emissive: 0xff2030, emissiveIntensity: 3 }));
  nose.position.set(0, 0.07, 0.18);
  root.add(shell, top, led, antler, nose);
  meshes.push(shell, top);
  return {
    root,
    height: 0.15,
    eyeHeight: 0.1,
    meshes,
    setSitHeight() { /* n/a */ },
    headWorld() { const v = new THREE.Vector3(); led.getWorldPosition(v); return v; },
    update(_dt, pose, _speed, _hy, _hp, time) {
      const m = led.material as THREE.MeshStandardMaterial;
      m.emissive.set(pose === 'alert' ? 0xff3030 : pose === 'stunned' ? 0x4060ff : 0x40ff90);
      m.emissiveIntensity = 2 + Math.sin(time * (pose === 'alert' ? 20 : 3)) * 1.5;
      (nose.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(time * 4) * 1.2;
    },
  };
}
