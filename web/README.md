<p align="center"><img src="../media-kit/art/banner-1920x480.png" alt="The Order of E.L.F." width="100%"></p>

# The Order of E.L.F. — Web Edition

[![Play on itch.io](https://img.shields.io/badge/%E2%96%B6%20Play-itch.io-FA5C5C?style=flat-square&logo=itchdotio&logoColor=white)](https://echoness.itch.io/the-order-of-elf-remake)
![three.js](https://img.shields.io/github/package-json/dependency-version/e-choness/the-order-of-elf/three?filename=web%2Fpackage.json&style=flat-square&logo=threedotjs&label=three.js&color=000000)
![postprocessing](https://img.shields.io/github/package-json/dependency-version/e-choness/the-order-of-elf/postprocessing?filename=web%2Fpackage.json&style=flat-square&label=postprocessing)
![Vite](https://img.shields.io/github/package-json/dependency-version/e-choness/the-order-of-elf/dev/vite?filename=web%2Fpackage.json&style=flat-square&logo=vite&logoColor=white&label=vite)
![TypeScript](https://img.shields.io/github/package-json/dependency-version/e-choness/the-order-of-elf/dev/typescript?filename=web%2Fpackage.json&style=flat-square&logo=typescript&logoColor=white&label=typescript)

**Play now: [echoness.itch.io/the-order-of-elf-remake](https://echoness.itch.io/the-order-of-elf-remake)** · Press kit: [`../media-kit`](../media-kit/)

A browser remake of the ABK Jam Team 7 Unity game, rebuilt as a first-person
stealth **immersive sim** with Three.js. Sneak through houses on Christmas Eve,
gather evidence of what each child truly wants and how they behaved, then climb
back up the chimney and decide: **Santa’s Nice list or Krampus’s Naughty list?**

## Run it

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in web/dist (works from any sub-folder — zip it for itch.io)
npm run preview
```

Requires Node 20.19+ / 22.12+. Play with keyboard and mouse in a desktop browser.

## What’s in the remake

**Missions** — Elf Academy (guided tutorial), The Johnson House (the original
jam level, expanded), Frostbrook Cabin and Whitmore Manor. Each has its own
family, routines, conversations, 5–12 clues with decoys, and a gift shortlist.

**Stealth systems**
- Light gem: real light-level sampling with line-of-sight to every lamp, the
  fireplace, NPC torches and moonbeams through windows. Switch lamps off — but
  people notice and switch them back on.
- Vision cones with peripheral vision, distance and stance falloff; floor decals
  show where people are looking (toggle in Settings).
- Sound: surface-aware footsteps (carpet/wood/tile), squeaky floorboards,
  landing noise, doors, thrown objects and shattering ornaments all propagate to
  NPC hearing, muffled by walls and closed doors. A noise meter shows how loud you were.
- NPC states: routine → suspicious → investigate → alert/chase → search, plus
  stunned, asleep / woken, fixing things, conversations and befriended pets.
- Dogs smell you through Shimmer; cats and robot vacuums raise the alarm;
  kids sleep-talk and wake to loud noises; Grandpa patrols with a torch.

**Elf toolkit** — Shimmer (invisibility), Morph (become a nutcracker), Second
Sight (see through toys, tag people through walls), Jingle Lure (new) and
Christmas Cheer dust (sleep stun + hiding cloud). Hide in closets, under beds,
behind curtains, among presents or inside a cardboard box. Pick up and throw
ornaments, books, cans and dog biscuits. Clamber onto furniture. Nibble Santa’s
cookies to restore magic.

**Presentation** — pmndrs postprocessing (N8AO ambient occlusion, mip-mapped
bloom, SMAA, AgX tone mapping) plus a custom grading pass for spell states,
detection pulses and frosty vignettes; moonlit shadows, twinkling fairy lights,
fire and snow particles, an aurora sky. Public-domain carols (Silent Night,
Carol of the Bells, Deck the Halls) are synthesised live with Web Audio and
intensify when you’re spotted; HRTF-positioned sound effects. UI typography uses
Fraunces, Nunito, Caveat (handwritten notes), Special Elite (dossiers) and
Mountains of Christmas.

**Quality of life** — four graphics presets, FOV/sensitivity/invert, subtitle
size, reduce-motion and vision-cone toggles, a
journal with evidence / household / gift shortlist, star ranks, medals and saved
progress.

## Controls

| Key | Action |
| --- | --- |
| `W A S D` / mouse | Move / look |
| `Shift` | Sprint (loud) |
| `Q` or `C` | Crouch (toggle) |
| `Space` | Jump / climb onto furniture |
| `E` | Interact, pick up, read, hide (hold to search drawers) |
| `Left click` | Throw Christmas Cheer, or throw the held item |
| `Right click` | Drop held item |
| `1` / `2` | Cast your chosen spells |
| `F` | Tag a person during Second Sight |
| `3` | Jump to the report once every clue is found |
| `Tab` / `Esc` | Journal & pause |

## Code tour

```
src/core     renderer + post FX, input, audio & music engine, assets, settings, save
src/world    house builder, props, lights, decor, environment, physics, navigation
src/game     game loop, player, NPC bodies & AI, abilities, interactables
src/ui       HUD, overlays, menus, journal, report and results screens
src/levels   mission data (rooms, props, NPC routines, clues, conversations…)
src/dev      level validator and viewer (open /#validate or /#viewer?level=johnson)
```

Levels are plain data (`src/levels/*.ts`): rooms are integer rectangles, walls
and openings are generated automatically, and `/#validate` checks reachability
and prop/clue placement.

## Credits & licences

Code: MIT (see repository licence). 3D models, particles, sound effects and
jingles are by [Kenney](https://kenney.nl) under CC0 — licence files are in
`public/assets/licenses`. Fonts are under the SIL Open Font License.
