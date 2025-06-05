# The Order of E.L.F

---

## Welcome to the Order of E.L.F

**The game is now playable on [itch.io](https://solarlunareclipse.itch.io/order-of-elf), please check it out and give us feedback!**

[![The Order of E.L.F](README-img/elf.gif)](https://solarlunareclipse.itch.io/order-of-elf)

### Overview

The Order of E.L.F is a stealth-based adventure game where players use magic and cunning to gather intel on their child target during Christmas Eve. Your findings determine whether the child's list goes to Santa or Krampus.

### Development Details

---

#### Game Engine

- **Unity Version**: 2021.3.26f1  
  [Download Unity v2021.3.26f1](https://unity.com/releases/editor/whats-new/2021.3.26)

#### Asset Packages

- **Gold Player**: A Unity package for player movement and controls.  
  [Gold Player GitHub Repository](https://github.com/Hertzole/gold-player)

#### Project Structure

- **Assets/**: Contains game assets such as scripts, scenes, materials, and input configurations.
- **Packages/**: Unity package dependencies (`manifest.json` and `packages-lock.json`).
- **ProjectSettings/**: Unity project settings files (e.g., `GraphicsSettings.asset`, `InputManager.asset`).
- **README-img/**: Images used in the README (e.g., control schemes, magic abilities).

---

### Core Gameplay

- **Objective**: Gather all Christmas clues located throughout the house before time runs out.
- **Avoid Detection**: Stay hidden from AI enemies while hunting for clues.
- **Game Over**: If time runs out or detection reaches 100%.
- **Win Condition**: Submit your report after finding all clues.

### Win Criteria

- **ELF Promotion (True Win)**: Both gift and list are correct.
- **ELF Recognition (Partial Win)**: Either gift or list is correct, but not both.
- **ELF Demotion (Loss)**: Both gift and list are incorrect.

### Controls

![Control Schemes](README-img/control-scheme.png)

- `WASD`: Character movement
- `Mouse`: Move camera
- `Toggle Q`: Crouch (harder for Family and Pets to see you)
- `Spacebar`: Jump
- `Shift`: Sprint
- `Left Mouse Click`: Spread Christmas Cheer (distract enemies)
- `Keypad E`: Dialogue with parents/pets, pick up clues
- `Keypad 1`: Cast 1st magic ability
- `Keypad 2`: Cast 2nd magic ability
- `Tab`: Pause Game/Review Clues
- `Keypad 3`: Jump to final report (once all clues are found).

### Magic Abilities

![Magics](README-img/magic.png)

- **Second Sight**: Cast vision to nearby toys for better surveillance.
- **Morph**: Transform into a toy figure to hide.
- **Shimmer**: Brief invisibility.

### Tips for Gameplay

- Cheer smoke acts as a hiding spot while gathering clues.
- Dialogue opportunities are marked with star icons above human and pet heads.
- Second Sight objects are indicated by blue diamonds when using the ability.
- Human and pet detection states are visualized by the radius at their feet.

---

### Credits

#### ABK Jam Team 7

| Name              | Role                                              |
| ----------------- | ------------------------------------------------- |
| Shawn Wells       | Producer / Level Designer                         |
| Mondae Atughonu   | Gameplay and AI Programming                       |
| Echo (Beili) Yin  | Generalist Programmer                             |
| Jonathan Librizzi | UI Engineer                                       |
| Milton Clark      | Software Engineer                                 |
| Sara Zorns        | Concept Artist, 2D Artist, and Narrative Designer |
| Molly Carroll     | Environment Artist and 3D Modeler                 |
| Lu Xu             | Opening Cinematic Artist                          |
| Andre B           | Concept Artist                                    |

---

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
