// Night sky (stars, moon, aurora), snowfall, snowy yard, moonlight and
// distant neighbours' lit windows.

import * as THREE from 'three';
import type { LevelDef } from '../levels/types';
import { makeProp } from './props';
import { snowTexture, mulberry } from './textures';
import { F, type PhysicsWorld } from './physics';

const skyVert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * p;
  gl_Position.z = gl_Position.w; // at far plane
}`;

const skyFrag = /* glsl */ `
uniform float uTime;
uniform vec3 uMoonDir;
uniform float uAurora;
varying vec3 vDir;
float hash(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  float a = hash(vec3(i,0.)), b = hash(vec3(i+vec2(1,0),0.)), c = hash(vec3(i+vec2(0,1),0.)), d = hash(vec3(i+vec2(1,1),0.));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
void main() {
  vec3 d = normalize(vDir);
  float h = clamp(d.y, -0.2, 1.0);
  vec3 top = vec3(0.012, 0.018, 0.06);
  vec3 mid = vec3(0.05, 0.06, 0.16);
  vec3 hor = vec3(0.22, 0.17, 0.30);
  vec3 col = mix(hor, mid, smoothstep(-0.02, 0.25, h));
  col = mix(col, top, smoothstep(0.25, 0.9, h));
  // stars
  vec3 sd = d * 420.0;
  float s = hash(floor(sd));
  float tw = 0.6 + 0.4 * sin(uTime * 2.0 + s * 50.0);
  col += vec3(0.9, 0.95, 1.0) * step(0.9975, s) * tw * smoothstep(0.02, 0.3, h) * 1.6;
  // moon + halo
  float m = dot(d, normalize(uMoonDir));
  col += vec3(1.0, 0.97, 0.88) * smoothstep(0.9993, 0.9996, m) * 6.0;
  col += vec3(0.5, 0.6, 0.9) * pow(max(m, 0.0), 180.0) * 0.6;
  col += vec3(0.25, 0.3, 0.5) * pow(max(m, 0.0), 12.0) * 0.18;
  // aurora ribbons
  if (uAurora > 0.0 && d.y > 0.05) {
    vec2 uv = d.xz / (d.y + 0.25);
    float band = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float n = noise(uv * (1.2 + fi * 0.4) + vec2(uTime * 0.03 * (fi + 1.0), fi * 3.1));
      band += smoothstep(0.55, 0.95, n) * (0.6 - fi * 0.15);
    }
    vec3 ac = mix(vec3(0.1, 0.9, 0.55), vec3(0.5, 0.25, 0.9), smoothstep(0.1, 0.6, d.y));
    col += ac * band * uAurora * smoothstep(0.05, 0.35, d.y) * 0.55;
  }
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const snowVert = /* glsl */ `
uniform float uTime;
uniform vec3 uCenter;
uniform vec4 uHole; // minX, minZ, maxX, maxZ of the house (no snow inside)
uniform float uScale;
attribute float aSeed;
varying float vA;
void main() {
  vec3 p = position;
  float fall = mod(p.y - uTime * (0.6 + aSeed * 0.5), 14.0);
  p.y = fall - 1.0;
  p.x += sin(uTime * 0.7 + aSeed * 30.0) * 0.4 + uTime * 0.15;
  p.z += cos(uTime * 0.5 + aSeed * 20.0) * 0.3;
  // wrap around the camera
  p.x = uCenter.x + mod(p.x - uCenter.x + 30.0, 60.0) - 30.0;
  p.z = uCenter.z + mod(p.z - uCenter.z + 30.0, 60.0) - 30.0;
  float inside = step(uHole.x - 0.3, p.x) * step(p.x, uHole.z + 0.3) * step(uHole.y - 0.3, p.z) * step(p.z, uHole.w + 0.3) * step(p.y, 3.4);
  vA = (1.0 - inside) * (0.5 + aSeed * 0.5);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.0 + aSeed * 2.0) * uScale / max(0.1, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const snowFrag = /* glsl */ `
varying float vA;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.0, length(c)) * vA;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vec3(0.92, 0.95, 1.0), a);
}`;

export class Environment {
  group = new THREE.Group();
  sky: THREE.Mesh;
  snow: THREE.Points;
  moon: THREE.DirectionalLight;
  moonDir: THREE.Vector3;
  hemi: THREE.HemisphereLight;
  private chimneySmoke: THREE.Vector3 | null = null;
  eaveLights: THREE.InstancedMesh | null = null;
  private eaveColors: THREE.Color[] = [];

  constructor(level: LevelDef, world: PhysicsWorld, shadowSize: number) {
    const [bx0, bz0, bx1, bz1] = level.bounds;
    const cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2;
    this.moonDir = new THREE.Vector3(-0.55, 0.62, 0.56).normalize();
    // sky
    this.sky = new THREE.Mesh(
      new THREE.SphereGeometry(150, 32, 16),
      new THREE.ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uMoonDir: { value: this.moonDir },
          uAurora: { value: level.exterior.style === 'forest' || level.exterior.style === 'workshop' ? 1 : 0.35 },
        },
      }),
    );
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -10;
    this.group.add(this.sky);

    // moon light (only light that casts shadows → real moonbeams through windows)
    this.moon = new THREE.DirectionalLight(0x9db8ff, 1.5);
    this.moon.position.set(cx, 0, cz).addScaledVector(this.moonDir, 30);
    this.moon.target.position.set(cx, 0, cz);
    this.moon.castShadow = shadowSize > 0;
    const ext = Math.max(bx1 - bx0, bz1 - bz0) / 2 + 6;
    const sc = this.moon.shadow.camera;
    sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext;
    sc.near = 1; sc.far = 70;
    this.moon.shadow.mapSize.set(shadowSize, shadowSize);
    this.moon.shadow.bias = -0.0006;
    this.moon.shadow.normalBias = 0.03;
    this.group.add(this.moon, this.moon.target);

    this.hemi = new THREE.HemisphereLight(0x3a4a7a, 0x2a1f1a, 0.55);
    this.group.add(this.hemi);
    const amb = new THREE.AmbientLight(0x6070a0, 0.12);
    this.group.add(amb);

    // snowy ground
    const st = snowTexture();
    st.repeat.set(30, 30);
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(120, 48),
      new THREE.MeshStandardMaterial({ map: st, roughness: 0.85, color: 0xdfe8f5 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    this.group.add(ground);

    // snow drifts (soft mounds)
    const rnd = mulberry(level.index * 977 + 13);
    const driftMat = new THREE.MeshStandardMaterial({ color: 0xeef4ff, roughness: 0.9 });
    for (let i = 0; i < 40; i++) {
      const a = rnd() * Math.PI * 2;
      const r = ext + 2 + rnd() * 30;
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), driftMat);
      m.scale.set(1.5 + rnd() * 3, 0.3 + rnd() * 0.5, 1.5 + rnd() * 3);
      m.position.set(cx + Math.cos(a) * r, -0.1, cz + Math.sin(a) * r);
      m.receiveShadow = true;
      this.group.add(m);
    }

    // trees + yard props
    const treeModels = ['holiday/treePineSnow', 'holiday/treePineSnowRound', 'holiday/treePineSnowed', 'holiday/treePine'];
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2;
      const r = ext + 3 + rnd() * 45 * (level.exterior.style === 'forest' ? 0.7 : 1);
      const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      const t = makeProp({ m: treeModels[(rnd() * treeModels.length) | 0], x, z, rot: rnd() * 360, s: 1.6 + rnd() * 1.8 });
      this.group.add(t);
    }
    const yard: [string, number, number, number][] = [
      ['holiday/snowmanFancy', bx1 + 3, bz1 + 2.5, 200],
      ['holiday/sled', bx1 + 2, bz1 + 3.6, 30],
      ['holiday/lightpost', bx0 - 1.2, bz1 + 1.5, 0],
      ['holiday/lightpost', bx1 + 1.2, bz0 - 1.5, 0],
      ['holiday/snowFort', bx0 - 4, bz0 - 3, 40],
      ['holiday/rockFormationMedium', bx0 - 6, bz1 + 4, 20],
    ];
    for (const [m, x, z, r] of yard) {
      const p = makeProp({ m, x, z, rot: r });
      this.group.add(p);
      world.addFromObject(p, F.MOVE | F.SIGHT | F.LIGHT | F.CAMERA, {}, 0.05);
    }
    for (const lp of [[bx0 - 1.2, bz1 + 1.5], [bx1 + 1.2, bz0 - 1.5]]) {
      const l = new THREE.PointLight(0xffc98a, 6, 9, 1.6);
      l.position.set(lp[0], 2.05, lp[1]);
      this.group.add(l);
    }

    // distant neighbour houses with glowing windows
    const nbMat = new THREE.MeshStandardMaterial({ color: 0x1d2233, roughness: 1 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xe6eefc, roughness: 1 });
    const winMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffb866, emissiveIntensity: 2.2 });
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rnd() * 0.3;
      const r = 45 + rnd() * 20;
      const hx = cx + Math.cos(a) * r, hz = cz + Math.sin(a) * r;
      const w = 6 + rnd() * 4, d = 5 + rnd() * 3, h = 3 + rnd() * 2;
      const house = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), nbMat);
      body.position.y = h / 2;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.75, 2.4, 4), roofMat);
      roof.position.y = h + 1.2;
      roof.rotation.y = Math.PI / 4;
      house.add(body, roof);
      for (let k = 0; k < 4; k++) {
        if (rnd() < 0.35) continue;
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), winMat);
        win.position.set(-w / 2 + 1 + k * (w - 2) / 3, h * 0.55, d / 2 + 0.01);
        house.add(win);
      }
      house.position.set(hx, 0, hz);
      house.lookAt(cx, 0, cz);
      this.group.add(house);
    }

    // eave string lights around the house
    const n = Math.floor(((bx1 - bx0) + (bz1 - bz0)) * 2 * 3);
    const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffffff, emissiveIntensity: 3 }), n);
    const pal = ['#ff4d5e', '#ffd166', '#06d6a0', '#4cc9f0', '#ffffff'].map((c) => new THREE.Color(c));
    const per = [(bx1 - bx0), (bz1 - bz0), (bx1 - bx0), (bz1 - bz0)];
    const total = per.reduce((s, v) => s + v, 0);
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      let u = (i / n) * total;
      let side = 0;
      while (u > per[side]) { u -= per[side]; side++; }
      const sag = Math.sin((u % 1) * Math.PI) * 0.12;
      const y = 2.72 - sag;
      let x = 0, z = 0;
      if (side === 0) { x = bx0 + u; z = bz0 - 0.35; }
      else if (side === 1) { x = bx1 + 0.35; z = bz0 + u; }
      else if (side === 2) { x = bx1 - u; z = bz1 + 0.35; }
      else { x = bx0 - 0.35; z = bz1 - u; }
      mtx.setPosition(x, y, z);
      inst.setMatrixAt(i, mtx);
      const c = pal[i % pal.length];
      this.eaveColors.push(c);
      inst.setColorAt(i, c);
    }
    this.eaveLights = inst;
    this.group.add(inst);

    // snowfall
    const N = 5000;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = cx + (rnd() - 0.5) * 60;
      pos[i * 3 + 1] = rnd() * 14;
      pos[i * 3 + 2] = cz + (rnd() - 0.5) * 60;
      seed[i] = rnd();
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.snow = new THREE.Points(
      sg,
      new THREE.ShaderMaterial({
        vertexShader: snowVert,
        fragmentShader: snowFrag,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uCenter: { value: new THREE.Vector3(cx, 0, cz) },
          uHole: { value: new THREE.Vector4(bx0, bz0, bx1, bz1) },
          uScale: { value: window.innerHeight * 0.06 },
        },
      }),
    );
    this.snow.frustumCulled = false;
    this.group.add(this.snow);
    this.chimneySmoke = new THREE.Vector3(level.chimney[0], 5.2, level.chimney[2]);
  }

  update(dt: number, time: number, camPos: THREE.Vector3, fx?: import('../fx/particles').FX) {
    (this.sky.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
    this.sky.position.copy(camPos);
    const su = (this.snow.material as THREE.ShaderMaterial).uniforms;
    su.uTime.value = time;
    su.uCenter.value.set(camPos.x, 0, camPos.z);
    if (this.eaveLights) {
      const c = new THREE.Color();
      for (let i = 0; i < this.eaveColors.length; i++) {
        const on = (Math.floor(time * 1.5) + i) % 3 !== 0 ? 1 : 0.25;
        c.copy(this.eaveColors[i]).multiplyScalar(on);
        this.eaveLights.setColorAt(i, c);
      }
      this.eaveLights.instanceColor!.needsUpdate = true;
    }
    if (fx && this.chimneySmoke && Math.random() < dt * 6) {
      fx.smoke.emit({ pos: this.chimneySmoke, posJitter: 0.3, vel: new THREE.Vector3(0.25, 0.7, 0.05), spread: 0.15, life: [3, 5], size: [0.6, 1.0], endSize: 3, color: 0x8890a0, alpha: 0.35, spin: 0.3 });
    }
  }
}
