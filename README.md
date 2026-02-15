# ⚔️ Fantasy Tactics

A 2D turn-based tactics game built with TypeScript and HTML5 Canvas.

![Fantasy Tactics](https://img.shields.io/badge/TypeScript-Canvas-blue)

## 🎮 How to Play

**Objective:** Defeat all enemy units!

### Controls
- **Click** a friendly unit to select it
- **Green tiles** show movement range — click to move
- **Red tiles** show basic attack range — click an enemy to attack
- Use **ability buttons** in the bottom panel for special attacks & heals
- **Purple tiles** show ability targeting range
- Click **End Unit** to skip a unit's remaining actions
- Click **⏩ End Turn** to pass the turn to the enemy

### Unit Types

| Unit | Emoji | HP | MP | ATK | DEF | SPD | RNG | Role |
|------|-------|----|----|-----|-----|-----|-----|------|
| Knight | ⚔️ | 120 | 30 | 25 | 15 | 3 | 1 | Tank / Melee |
| Mage | 🔮 | 70 | 80 | 15 | 5 | 2 | 3 | Ranged DPS / Healer |
| Archer | 🏹 | 80 | 40 | 22 | 8 | 3 | 4 | Ranged DPS |
| Rogue | 🗡️ | 85 | 45 | 28 | 7 | 4 | 1 | Fast Melee Assassin |

### Abilities

- **Knight:** Shield Bash (melee burst), War Cry (AoE team heal)
- **Mage:** Fireball (AoE), Ice Shard (long range), Arcane Heal (ally heal)
- **Archer:** Power Shot (high single-target), Rain of Arrows (AoE)
- **Rogue:** Backstab (massive melee), Smoke Bomb (AoE debuff)

### Terrain

- 🌲 **Forest:** +3 defense bonus, costs 2 movement
- 🌊 **Water:** Impassable
- 🪨 **Obstacles:** Impassable

### Tips
- Use terrain for cover — forest gives defense bonuses
- Mages are glass cannons — keep them behind your knight
- Rogues are fast — use them to flank enemies
- Mana regenerates 5 per turn — plan your ability usage
- Focus fire on one enemy at a time

## 🛠 Development

### Prerequisites
- Node.js 18+
- TypeScript 5+

### Build & Run

```bash
npm install
npm run build
# Open dist/index.html in your browser
# Or use a local server:
npx http-server dist -p 8080
```

### Development Mode

```bash
npm run dev
# TypeScript will watch for changes and recompile
```

## 📁 Project Structure

```
fantasy-tactics-game/
├── src/
│   ├── game.ts       # Complete game logic, AI, and rendering
│   └── index.html    # HTML shell with Canvas
├── dist/             # Compiled output (after build)
├── package.json
├── tsconfig.json
└── README.md
```

## 🏗 Architecture

- **Pure TypeScript** — no frameworks or dependencies
- **HTML5 Canvas** rendering with emoji-based sprites
- **BFS pathfinding** for movement range calculation
- **Simple AI** — enemies prioritize abilities, then attacks, then movement toward nearest player unit
- **State machine** game phases: SelectUnit → SelectAction → SelectTarget → EnemyTurn

## License

MIT
