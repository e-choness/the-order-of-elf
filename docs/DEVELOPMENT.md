<p align="center"><img src="../media-kit/art/banner-1920x480.png" alt="The Order of E.L.F." width="100%"></p>

# The Order of E.L.F. — Development guide

[![Play on itch.io](https://img.shields.io/badge/%E2%96%B6%20Play-itch.io-FA5C5C?style=flat-square&logo=itchdotio&logoColor=white)](https://echoness.itch.io/the-order-of-elf-remake)
![three.js](https://img.shields.io/github/package-json/dependency-version/e-choness/the-order-of-elf/three?filename=package.json&style=flat-square&logo=threedotjs&label=three.js&color=000000)
![postprocessing](https://img.shields.io/github/package-json/dependency-version/e-choness/the-order-of-elf/postprocessing?filename=package.json&style=flat-square&label=postprocessing)
![Vite](https://img.shields.io/github/package-json/dependency-version/e-choness/the-order-of-elf/dev/vite?filename=package.json&style=flat-square&logo=vite&logoColor=white&label=vite)
![TypeScript](https://img.shields.io/github/package-json/dependency-version/e-choness/the-order-of-elf/dev/typescript?filename=package.json&style=flat-square&logo=typescript&logoColor=white&label=typescript)

**Play now: [echoness.itch.io/the-order-of-elf-remake](https://echoness.itch.io/the-order-of-elf-remake)** · Press kit: [`../media-kit`](../media-kit/)

A browser remake of the ABK Jam Team 7 Unity game, rebuilt as a first-person
stealth **immersive sim** with Three.js. Sneak through houses on Christmas Eve,
gather evidence of what each child truly wants and how they behaved, then climb
back up the chimney and decide: **Santa’s Nice list or Krampus’s Naughty list?**

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/ (relative paths — ready for itch.io)
npm run preview
```

Requires Node 22.12+ (Node 24 LTS recommended — see `.nvmrc`). Play with keyboard and mouse in a desktop browser.

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
public       Kenney CC0 models, textures and audio + licence files
media-kit    press kit and the tools that render it
```

The original Unity 2021.3 project lives on at the
[last Unity commit (`ed82f37`)](https://github.com/e-choness/the-order-of-elf/tree/ed82f37).

Levels are plain data (`src/levels/*.ts`): rooms are integer rectangles, walls
and openings are generated automatically, and `/#validate` checks reachability
and prop/clue placement.

## Deploying

| Workflow | When it runs | What it does |
| --- | --- | --- |
| [`ci.yml`](../.github/workflows/ci.yml) | every push & pull request | `npm ci`, typecheck, build, upload the build as an artifact |
| [`deploy-itch.yml`](../.github/workflows/deploy-itch.yml) | pushes to `main` touching the game, `v*` tags, manual | builds and `butler push`es to **echoness/the-order-of-elf-remake:html5** |
| [`release.yml`](../.github/workflows/release.yml) | `v*` tags | creates a GitHub Release with a zipped build |
| [`deploy-pages.yml`](../.github/workflows/deploy-pages.yml) | opt-in (`ENABLE_PAGES=true` variable) or manual | optional GitHub Pages mirror |
| [`christmas-countdown.yml`](../.github/workflows/christmas-countdown.yml) | daily | refreshes the README countdown badge |

**itch.io setup (once)**
1. Create an API key at <https://itch.io/user/settings/api-keys>.
2. Add it to the repo as the Actions secret **`BUTLER_API_KEY`** (Settings → Secrets and variables → Actions).
3. After the first upload, open the itch.io edit page and tick *“This file will be played in the browser”* for the
   `html5` upload, with a viewport such as 1280×720 and the fullscreen button enabled.

**Shipping a version**

```bash
npm version minor            # bumps package.json, commits, tags v2.1.0
git push --follow-tags       # → itch.io deploy + GitHub Release
```

You can also deploy by hand with `npm run deploy:itch` (needs [butler](https://itch.io/docs/butler/) logged in), or
trigger *Deploy to itch.io* from the Actions tab (it has a dry-run option).

## Credits & licences

Code: MIT (see repository licence). 3D models, particles, sound effects and
jingles are by [Kenney](https://kenney.nl) under CC0 — licence files are in
`public/assets/licenses`. Fonts are under the SIL Open Font License.
