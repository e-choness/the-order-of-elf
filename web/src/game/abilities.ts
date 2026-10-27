// Elf magic: Shimmer (invisibility), Morph (become a toy), Second Sight
// (see through a toy's eyes) and Jingle Lure (new: a bell that draws people
// away) — plus Christmas Cheer dust, the non-lethal stun from the original.

import * as THREE from 'three';
import type { Game } from './game';
import { audio } from '../core/audio';
import type { SightToy } from './interact';
import { F } from '../world/physics';
import { nutcracker } from './interact';

export type AbilityId = 'shimmer' | 'morph' | 'sight' | 'lure';

export const ABILITIES: Record<AbilityId, { name: string; icon: string; color: string; desc: string; detail: string }> = {
  shimmer: {
    name: 'Shimmer',
    icon: '✨',
    color: '#9be7ff',
    desc: 'Turn invisible for 6 seconds.',
    detail: 'Humans can’t see you. Dogs can still smell you up close, and you still make noise.',
  },
  morph: {
    name: 'Morph',
    icon: '🎎',
    color: '#ffb36b',
    desc: 'Become a toy nutcracker. Move to change back.',
    detail: 'Completely undetectable while still. Magic won’t recharge while morphed.',
  },
  sight: {
    name: 'Second Sight',
    icon: '🔮',
    color: '#b18cff',
    desc: 'See through the eyes of a toy (look at it and cast).',
    detail: 'Toys are marked with blue diamonds. While watching, people are revealed through walls and nearby clues sparkle. Press [F] to tag a person.',
  },
  lure: {
    name: 'Jingle Lure',
    icon: '🔔',
    color: '#ffd36e',
    desc: 'Toss a magic sleigh bell that jingles to draw people away.',
    detail: 'Lands where you aim and rings after a moment. Everyone nearby comes to investigate.',
  },
};

export class Abilities {
  maxCharges = 3;
  charges = 3;
  regen = 0;
  regenTime = 9;
  cheer = 3;
  cheerMax = 3;
  cheerRegen = 0;
  cheerTime = 6.5;
  active: AbilityId | null = null;
  activeTime = 0;
  private morphMesh: THREE.Object3D | null = null;
  private morphYaw = 0;
  private morphPitch = -0.3;
  sightToy: SightToy | null = null;
  private sightYaw = 0;
  private sightPitch = 0;
  private bells: { mesh: THREE.Object3D; vel: THREE.Vector3; landed: boolean; t: number; ring: number }[] = [];
  private darts: { pos: THREE.Vector3; vel: THREE.Vector3; t: number }[] = [];
  private savedCam: { pos: THREE.Vector3; yaw: number; pitch: number } | null = null;
  tagged = new Map<string, number>();
  flash = 0;

  constructor(private g: Game, public slots: [AbilityId, AbilityId]) {}

  keyFor(id: AbilityId): string | null {
    const i = this.slots.indexOf(id);
    return i < 0 ? null : String(i + 1);
  }

  addCharge() {
    this.charges = Math.min(this.maxCharges, this.charges + 1);
  }

  private spend() {
    if (this.charges <= 0) {
      audio.play('sfx/ui_error', { bus: 'ui', volume: 0.4 });
      this.g.toast('Out of magic — it recharges over time (or find Santa’s cookies).', 'muted');
      return false;
    }
    this.charges--;
    this.g.stats.spells++;
    return true;
  }

  update(dt: number) {
    const g = this.g;
    const inp = g.input;
    // recharge (not while a sustained spell is active, like the original)
    if (this.charges < this.maxCharges && this.active !== 'morph' && this.active !== 'sight') {
      this.regen += dt;
      if (this.regen >= this.regenTime) {
        this.regen = 0;
        this.charges++;
        audio.chime(88, 3, 0.05, 0.08);
      }
    } else if (this.charges >= this.maxCharges) this.regen = 0;
    if (this.cheer < this.cheerMax) {
      this.cheerRegen += dt;
      if (this.cheerRegen >= this.cheerTime) {
        this.cheerRegen = 0;
        this.cheer++;
      }
    }

    if (g.canAct()) {
      if (inp.wasPressed('Digit1')) this.cast(this.slots[0]);
      if (inp.wasPressed('Digit2')) this.cast(this.slots[1]);
      if (inp.wasPressed('Mouse0') && !g.carrying && !this.active) this.throwCheer();
    }

    // active spells
    if (this.active === 'shimmer') {
      this.activeTime -= dt;
      g.renderer.stealth.set('uInvisible', Math.min(1, this.activeTime * 2, 1));
      if (Math.random() < dt * 30) g.fx.glitter.emit({ pos: g.player.chest.add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4)), vel: new THREE.Vector3(0, 0.3, 0), life: [0.5, 1], size: [0.02, 0.04], color: [0x9be7ff, 0xffffff] });
      if (this.activeTime <= 0) this.endActive();
    } else if (this.active === 'morph') {
      this.updateMorph(dt);
    } else if (this.active === 'sight') {
      this.updateSight(dt);
    }
    this.updateBells(dt);
    this.updateDarts(dt);
    for (const [k, v] of this.tagged) {
      if (v - dt <= 0) this.tagged.delete(k);
      else this.tagged.set(k, v - dt);
    }
  }

  cast(id: AbilityId) {
    const g = this.g;
    if (this.active) {
      // pressing again cancels sustained spells
      if (this.active === id && (id === 'morph' || id === 'sight')) this.endActive();
      return;
    }
    if (id === 'sight') {
      const toy = g.focusedSightToy();
      if (!toy) {
        g.toast('Look at a toy marked with a blue diamond to use Second Sight.', 'muted');
        audio.play('sfx/ui_error', { bus: 'ui', volume: 0.3 });
        return;
      }
      this.trySight(toy);
      return;
    }
    if (!this.spend()) return;
    g.player.cast();
    if (id === 'shimmer') {
      this.active = 'shimmer';
      this.activeTime = 6;
      audio.whoosh(0.9, true, 0.3);
      audio.chime(84, 6, 0.05, 0.12);
      g.fx.burst(g.player.chest, [0x9be7ff, 0xffffff, 0xb18cff], 40, 2);
      g.player.wandGlow.set(0x9be7ff);
    } else if (id === 'morph') {
      this.active = 'morph';
      this.activeTime = 0;
      audio.whoosh(0.6, false, 0.3);
      audio.chime(76, 4, 0.07, 0.12);
      g.fx.smoke.emit({ pos: g.player.chest, count: 14, posJitter: 0.4, spread: 0.8, life: [0.8, 1.4], size: [0.3, 0.5], endSize: 2, color: 0xf0e6ff, alpha: 0.6 });
      g.fx.burst(g.player.chest, [0xffb36b, 0xffffff], 30, 1.6);
      const m = nutcracker();
      m.scale.setScalar(2.2);
      m.position.copy(g.player.pos);
      m.rotation.y = g.player.yaw + Math.PI;
      g.scene.add(m);
      this.morphMesh = m;
      this.morphYaw = g.player.yaw;
      this.morphPitch = -0.25;
      this.savedCam = { pos: g.player.pos.clone(), yaw: g.player.yaw, pitch: g.player.pitch };
      g.player.viewmodel.visible = false;
      g.player.frozen = true;
      g.renderer.stealth.set('uMorph', 1);
    } else if (id === 'lure') {
      this.throwBell();
    }
    g.hud.flashSlot(this.slots.indexOf(id));
  }

  trySight(toy: SightToy) {
    const g = this.g;
    if (this.active) return;
    if (!this.keyFor('sight')) return;
    if (!g.world.lineClear(g.player.eyePos, toy.pos, F.SIGHT) && toy.pos.distanceTo(g.player.eyePos) > 2) {
      g.toast('You need a clear line of sight to the toy.', 'muted');
      return;
    }
    if (!this.spend()) return;
    g.player.cast();
    this.active = 'sight';
    this.sightToy = toy;
    this.sightYaw = toy.yaw;
    this.sightPitch = -0.1;
    this.savedCam = { pos: g.player.pos.clone(), yaw: g.player.yaw, pitch: g.player.pitch };
    g.player.frozen = true;
    g.player.viewmodel.visible = false;
    audio.whoosh(1.1, true, 0.28);
    audio.chime(79, 5, 0.09, 0.14);
    g.fx.burst(toy.pos.clone(), [0xb18cff, 0x9be7ff], 30, 1.2);
    g.renderer.stealth.set('uSight', 1);
    g.hud.flashSlot(this.slots.indexOf('sight'));
  }

  private updateMorph(dt: number) {
    const g = this.g;
    const inp = g.input;
    this.morphYaw -= inp.mouseDX * 0.003;
    this.morphPitch = THREE.MathUtils.clamp(this.morphPitch - inp.mouseDY * 0.003, -1.2, 0.3);
    const cam = g.player.camera;
    const center = g.player.pos.clone().setY(g.player.pos.y + 0.4);
    const off = new THREE.Vector3(Math.sin(this.morphYaw) * Math.cos(this.morphPitch), -Math.sin(this.morphPitch), Math.cos(this.morphYaw) * Math.cos(this.morphPitch)).multiplyScalar(1.6);
    const dir = off.clone().normalize();
    const hit = g.world.raycast(center, dir, 1.6, F.CAMERA);
    const dist = hit ? Math.max(0.3, hit.dist - 0.1) : 1.6;
    cam.position.copy(center).addScaledVector(dir, dist);
    cam.lookAt(center);
    if (g.input.anyPressed('KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space')) this.endActive();
    void dt;
  }

  private updateSight(dt: number) {
    const g = this.g;
    const toy = this.sightToy!;
    const inp = g.input;
    this.sightYaw -= inp.mouseDX * 0.0022;
    this.sightPitch = THREE.MathUtils.clamp(this.sightPitch - inp.mouseDY * 0.0022, -1.2, 1.0);
    const cam = g.player.camera;
    cam.position.copy(toy.eye);
    cam.rotation.set(this.sightPitch, this.sightYaw, 0);
    // tag people in view
    if (inp.wasPressed('KeyF')) {
      const fwd = new THREE.Vector3();
      cam.getWorldDirection(fwd);
      let best: { id: string; d: number } | null = null;
      for (const n of g.npcs) {
        const to = n.body.headWorld().sub(cam.position);
        const d = to.length();
        const dot = to.normalize().dot(fwd);
        if (dot > 0.96 && (!best || d < best.d)) best = { id: n.def.id, d };
      }
      if (best) {
        this.tagged.set(best.id, 45);
        audio.play('sfx/pluck', { bus: 'ui', volume: 0.6 });
        g.toast(`Tagged ${g.npcs.find((n) => n.def.id === best!.id)!.name} — visible through walls for 45s.`);
      }
    }
    // sparkle clues near the toy
    if (Math.random() < dt * 6) g.revealCluesNear(toy.pos, 7);
    if (g.input.anyPressed('KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Escape')) this.endActive();
  }

  endActive() {
    const g = this.g;
    const was = this.active;
    this.active = null;
    g.player.wandGlow.set(0xffe9a8);
    if (was === 'shimmer') {
      g.renderer.stealth.set('uInvisible', 0);
      audio.whoosh(0.5, false, 0.18);
    } else if (was === 'morph') {
      if (this.morphMesh) {
        g.fx.smoke.emit({ pos: this.morphMesh.position.clone().setY(0.4), count: 10, posJitter: 0.3, spread: 0.6, life: [0.6, 1.1], size: [0.3, 0.45], endSize: 2, color: 0xf0e6ff, alpha: 0.6 });
        g.scene.remove(this.morphMesh);
      }
      this.morphMesh = null;
      g.renderer.stealth.set('uMorph', 0);
      audio.whoosh(0.4, true, 0.2);
      g.player.frozen = false;
      g.player.viewmodel.visible = true;
    } else if (was === 'sight') {
      g.renderer.stealth.set('uSight', 0);
      audio.whoosh(0.6, false, 0.2);
      g.player.frozen = false;
      g.player.viewmodel.visible = true;
      this.sightToy = null;
    }
    if (this.savedCam && (was === 'morph' || was === 'sight')) {
      g.player.yaw = this.savedCam.yaw;
      g.player.pitch = this.savedCam.pitch;
      g.player.updateCamera(0);
    }
    this.savedCam = null;
    g.input.clear();
  }

  // ---------------------------------------------------------------- cheer dust

  private throwCheer() {
    const g = this.g;
    if (this.cheer <= 0) {
      audio.play('sfx/ui_error', { bus: 'ui', volume: 0.3 });
      return;
    }
    this.cheer--;
    g.stats.cheer++;
    g.player.cast();
    const dir = g.player.lookDir();
    const from = g.player.eyePos.clone().addScaledVector(dir, 0.3).add(new THREE.Vector3(0, -0.1, 0));
    this.darts.push({ pos: from, vel: dir.multiplyScalar(11), t: 0 });
    audio.play('sfx/sparkle', { volume: 0.5 });
    audio.chime(91, 4, 0.03, 0.08);
  }

  private updateDarts(dt: number) {
    const g = this.g;
    for (let i = this.darts.length - 1; i >= 0; i--) {
      const d = this.darts[i];
      d.t += dt;
      const step = d.vel.clone().multiplyScalar(dt);
      const len = step.length();
      const hit = g.world.raycast(d.pos, step.clone().normalize(), len, F.MOVE);
      let hitNpc = null as import('./npc').NPC | null;
      for (const n of g.npcs) {
        const c = n.pos.clone().setY(n.body.height * 0.6);
        if (c.distanceTo(d.pos) < 0.55 + n.body.height * 0.25) hitNpc = n;
      }
      g.fx.cheer.emit({ pos: d.pos, count: 2, posJitter: 0.08, vel: d.vel.clone().multiplyScalar(0.05), spread: 0.3, life: [0.3, 0.6], size: [0.06, 0.12], endSize: 0.3, color: [0xfff2a8, 0xff8fa3, 0x9be7ff, 0xb6ffb0], spin: 6 });
      if (hitNpc || hit || d.t > 0.9) {
        const at = hit ? hit.point : d.pos.clone();
        this.cloud(at, hitNpc);
        this.darts.splice(i, 1);
        continue;
      }
      d.pos.add(step);
    }
  }

  private cloud(at: THREE.Vector3, npc: import('./npc').NPC | null) {
    const g = this.g;
    g.fx.burst(at, [0xfff2a8, 0xff8fa3, 0x9be7ff, 0xb6ffb0], 50, 2.2);
    g.fx.smoke.emit({ pos: at, count: 18, posJitter: 0.6, spread: 0.4, life: [3.5, 5], size: [0.5, 0.9], endSize: 2.2, color: [0xffe6f0, 0xe6f4ff, 0xfff6d8], alpha: 0.5, spin: 0.4 });
    audio.play('sfx/sparkle', { pos: at, volume: 0.6 });
    g.addCheerCloud(at.clone().setY(0), 5.5);
    if (npc) {
      npc.stunFor(npc.isPet ? 9 : 7);
      g.stats.dusted++;
      g.onNpcDusted(npc);
    } else {
      // anyone standing in the cloud gets drowsy too
      for (const n of g.npcs) if (n.pos.distanceTo(at) < 1.3) { n.stunFor(5); g.stats.dusted++; }
    }
  }

  // ---------------------------------------------------------------- jingle lure

  private throwBell() {
    const g = this.g;
    const bell = new THREE.Group();
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), new THREE.MeshStandardMaterial({ color: 0xe8c062, metalness: 0.9, roughness: 0.25, emissive: 0x3a2a00 }));
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.012, 6, 12), new THREE.MeshStandardMaterial({ color: 0xc0182c }));
    bow.position.y = 0.055;
    bell.add(b, bow);
    const dir = g.player.lookDir();
    bell.position.copy(g.player.eyePos).addScaledVector(dir, 0.3);
    g.scene.add(bell);
    this.bells.push({ mesh: bell, vel: dir.multiplyScalar(8).add(new THREE.Vector3(0, 2.2, 0)), landed: false, t: 0, ring: 0 });
    audio.whoosh(0.4, true, 0.15);
  }

  private updateBells(dt: number) {
    const g = this.g;
    for (let i = this.bells.length - 1; i >= 0; i--) {
      const b = this.bells[i];
      b.t += dt;
      if (!b.landed) {
        b.vel.y -= 9.8 * dt;
        const step = b.vel.clone().multiplyScalar(dt);
        const hit = g.world.raycast(b.mesh.position, step.clone().normalize(), step.length() + 0.05, F.MOVE);
        if (hit || b.mesh.position.y + step.y < 0.05) {
          if (hit && hit.normal.y < 0.5) {
            b.vel.reflect(hit.normal).multiplyScalar(0.3);
            continue;
          }
          b.landed = true;
          b.t = 0;
          if (hit) b.mesh.position.copy(hit.point).add(new THREE.Vector3(0, 0.05, 0));
          else b.mesh.position.y = 0.05;
          audio.play('sfx/bell', { pos: b.mesh.position, volume: 0.5 });
        } else b.mesh.position.add(step);
      } else {
        // after a short delay: ring for 4.5 s
        if (b.t > 0.8 && b.t < 5.3) {
          b.ring -= dt;
          b.mesh.rotation.z = Math.sin(b.t * 30) * 0.4;
          if (b.ring <= 0) {
            b.ring = 1.1;
            audio.sleighBells(b.mesh.position, 1.1, 0.7);
            g.noise(b.mesh.position.clone(), 10, 'bell', false);
            g.fx.sparkle.emit({ pos: b.mesh.position, count: 10, spread: 1, life: [0.4, 0.9], size: [0.04, 0.08], color: [0xffd36e, 0xffffff], gravity: 0.5 });
          }
        }
        if (b.t > 6) {
          g.fx.burst(b.mesh.position, [0xffd36e, 0xffffff], 20, 1);
          g.scene.remove(b.mesh);
          this.bells.splice(i, 1);
        }
      }
    }
  }
}
