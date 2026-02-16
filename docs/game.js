"use strict";
// ============================================================
// Fantasy Tactics — A 2D Turn-Based Tactics Game
// ============================================================
// ---------- constants & types ----------
const GRID_COLS = 10;
const GRID_ROWS = 8;
const TILE_SIZE = 72;
const UI_HEIGHT = 180;
const CANVAS_W = GRID_COLS * TILE_SIZE;
const CANVAS_H = GRID_ROWS * TILE_SIZE + UI_HEIGHT;
const COLORS = {
    bg: '#1a1a2e',
    gridLine: '#16213e44',
    tileLight: '#2a2a4a',
    tileDark: '#222244',
    highlight: 'rgba(100,200,255,0.35)',
    moveRange: 'rgba(80,220,120,0.30)',
    attackRange: 'rgba(255,80,80,0.30)',
    abilityRange: 'rgba(180,100,255,0.35)',
    player: '#4fc3f7',
    enemy: '#ef5350',
    hpBar: '#66bb6a',
    hpBarBg: '#333',
    manaBar: '#42a5f5',
    uiBg: '#0d1b2a',
    uiText: '#e0e0e0',
    uiActive: '#ffd54f',
    obstacle: '#5d4e37',
    water: '#1565c0',
    forest: '#2e7d32',
};
var Team;
(function (Team) {
    Team[Team["Player"] = 0] = "Player";
    Team[Team["Enemy"] = 1] = "Enemy";
})(Team || (Team = {}));
var Phase;
(function (Phase) {
    Phase[Phase["SelectUnit"] = 0] = "SelectUnit";
    Phase[Phase["SelectAction"] = 1] = "SelectAction";
    Phase[Phase["SelectTarget"] = 2] = "SelectTarget";
    Phase[Phase["EnemyTurn"] = 3] = "EnemyTurn";
    Phase[Phase["GameOver"] = 4] = "GameOver";
})(Phase || (Phase = {}));
var TileType;
(function (TileType) {
    TileType[TileType["Floor"] = 0] = "Floor";
    TileType[TileType["Obstacle"] = 1] = "Obstacle";
    TileType[TileType["Water"] = 2] = "Water";
    TileType[TileType["Forest"] = 3] = "Forest";
})(TileType || (TileType = {}));
// ---------- unit templates ----------
function knightTemplate() {
    return {
        name: 'Knight',
        className: 'Knight',
        emoji: '⚔️',
        color: '#90caf9',
        level: 1,
        stats: { maxHp: 120, maxMana: 30, attack: 25, defense: 15, speed: 3, range: 1 },
        hp: 120,
        mana: 30,
        hasMoved: false,
        hasActed: false,
        abilities: [
            { name: 'Shield Bash', damage: 30, range: 1, manaCost: 10, aoe: 0, description: 'Stun a nearby foe with your shield' },
            { name: 'War Cry', damage: 0, range: 0, manaCost: 15, aoe: 2, heal: true, description: 'Rally allies — heal 20 HP in radius 2' },
        ],
    };
}
function mageTemplate() {
    return {
        name: 'Mage',
        className: 'Mage',
        emoji: '🔮',
        color: '#ce93d8',
        level: 1,
        stats: { maxHp: 70, maxMana: 80, attack: 15, defense: 5, speed: 2, range: 3 },
        hp: 70,
        mana: 80,
        hasMoved: false,
        hasActed: false,
        abilities: [
            { name: 'Fireball', damage: 45, range: 4, manaCost: 20, aoe: 1, description: 'Hurl a fireball — AoE radius 1' },
            { name: 'Ice Shard', damage: 30, range: 5, manaCost: 12, aoe: 0, description: 'Pierce a distant target with ice' },
            { name: 'Arcane Heal', damage: 0, range: 3, manaCost: 25, aoe: 0, heal: true, description: 'Restore 35 HP to an ally' },
        ],
    };
}
function archerTemplate() {
    return {
        name: 'Archer',
        className: 'Archer',
        emoji: '🏹',
        color: '#a5d6a7',
        level: 1,
        stats: { maxHp: 80, maxMana: 40, attack: 22, defense: 8, speed: 3, range: 4 },
        hp: 80,
        mana: 40,
        hasMoved: false,
        hasActed: false,
        abilities: [
            { name: 'Power Shot', damage: 40, range: 5, manaCost: 15, aoe: 0, description: 'A devastating focused arrow' },
            { name: 'Rain of Arrows', damage: 25, range: 4, manaCost: 25, aoe: 1, description: 'Arrow volley — AoE radius 1' },
        ],
    };
}
function rogueTemplate() {
    return {
        name: 'Rogue',
        className: 'Rogue',
        emoji: '🗡️',
        color: '#ffcc80',
        level: 1,
        stats: { maxHp: 85, maxMana: 45, attack: 28, defense: 7, speed: 4, range: 1 },
        hp: 85,
        mana: 45,
        hasMoved: false,
        hasActed: false,
        abilities: [
            { name: 'Backstab', damage: 50, range: 1, manaCost: 18, aoe: 0, description: 'Massive damage from the shadows' },
            { name: 'Smoke Bomb', damage: 15, range: 2, manaCost: 12, aoe: 1, description: 'Blind foes in a cloud — AoE' },
        ],
    };
}
// ---------- map generation ----------
function generateMap() {
    const map = [];
    for (let y = 0; y < GRID_ROWS; y++) {
        map[y] = [];
        for (let x = 0; x < GRID_COLS; x++) {
            map[y][x] = TileType.Floor;
        }
    }
    // obstacles
    const obstacles = [
        { x: 3, y: 1 }, { x: 4, y: 2 }, { x: 5, y: 5 }, { x: 6, y: 6 }, { x: 2, y: 4 }, { x: 7, y: 3 }, { x: 8, y: 1 }, { x: 1, y: 6 },
    ];
    for (const o of obstacles)
        map[o.y][o.x] = TileType.Obstacle;
    // water
    const water = [{ x: 4, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 3 }, { x: 5, y: 3 }];
    for (const w of water)
        map[w.y][w.x] = TileType.Water;
    // forest
    const forests = [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 7, y: 5 }, { x: 8, y: 5 }, { x: 6, y: 1 }];
    for (const f of forests)
        map[f.y][f.x] = TileType.Forest;
    return map;
}
let nextId = 1;
function makeUnit(template, team, pos) {
    return { ...template, id: nextId++, team, pos: { ...pos }, hp: template.stats.maxHp, mana: template.stats.maxMana, hasMoved: false, hasActed: false };
}
function initState() {
    const map = generateMap();
    const units = [
        // player team — left side
        makeUnit(knightTemplate(), Team.Player, { x: 0, y: 1 }),
        makeUnit(mageTemplate(), Team.Player, { x: 0, y: 3 }),
        makeUnit(archerTemplate(), Team.Player, { x: 1, y: 5 }),
        makeUnit(rogueTemplate(), Team.Player, { x: 0, y: 6 }),
        // enemy team — right side
        makeUnit(knightTemplate(), Team.Enemy, { x: 9, y: 2 }),
        makeUnit(mageTemplate(), Team.Enemy, { x: 9, y: 4 }),
        makeUnit(archerTemplate(), Team.Enemy, { x: 8, y: 6 }),
        makeUnit(rogueTemplate(), Team.Enemy, { x: 9, y: 0 }),
    ];
    // rename enemies
    units.filter(u => u.team === Team.Enemy).forEach(u => u.name = 'Dark ' + u.name);
    return {
        map,
        units,
        phase: Phase.SelectUnit,
        selectedUnit: null,
        selectedAbility: null,
        hoveredTile: null,
        moveTargets: [],
        attackTargets: [],
        abilityTargets: [],
        turnNumber: 1,
        currentTeam: Team.Player,
        log: ['⚔️ Battle begins! Select a unit to move.'],
        winner: null,
        floatingTexts: [],
        animating: false,
        actionMenuOpen: false,
        uiButtons: [],
    };
}
// ---------- helpers ----------
function dist(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
function posEq(a, b) {
    return a.x === b.x && a.y === b.y;
}
function inBounds(p) {
    return p.x >= 0 && p.x < GRID_COLS && p.y >= 0 && p.y < GRID_ROWS;
}
function isWalkable(state, p) {
    if (!inBounds(p))
        return false;
    const tile = state.map[p.y][p.x];
    if (tile === TileType.Obstacle || tile === TileType.Water)
        return false;
    return !state.units.some(u => u.hp > 0 && posEq(u.pos, p));
}
function getMovementRange(state, unit) {
    const result = [];
    const speed = unit.stats.speed + (state.map[unit.pos.y][unit.pos.x] === TileType.Forest ? -1 : 0);
    // BFS
    const visited = new Map();
    const queue = [{ pos: unit.pos, cost: 0 }];
    visited.set(`${unit.pos.x},${unit.pos.y}`, 0);
    while (queue.length > 0) {
        const cur = queue.shift();
        if (cur.cost > 0)
            result.push(cur.pos);
        if (cur.cost >= speed)
            continue;
        for (const d of [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]) {
            const np = { x: cur.pos.x + d.x, y: cur.pos.y + d.y };
            const key = `${np.x},${np.y}`;
            const moveCost = state.map[np.y]?.[np.x] === TileType.Forest ? 2 : 1;
            const newCost = cur.cost + moveCost;
            if (isWalkable(state, np) && (!visited.has(key) || visited.get(key) > newCost) && newCost <= speed) {
                visited.set(key, newCost);
                queue.push({ pos: np, cost: newCost });
            }
        }
    }
    return result;
}
function getAttackRange(state, unit) {
    const result = [];
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            const p = { x, y };
            if (dist(unit.pos, p) <= unit.stats.range && !posEq(unit.pos, p)) {
                const target = state.units.find(u => u.hp > 0 && posEq(u.pos, p) && u.team !== unit.team);
                if (target)
                    result.push(p);
            }
        }
    }
    return result;
}
function getAbilityRange(state, unit, ability) {
    const result = [];
    if (ability.range === 0 && ability.heal) {
        // self-centered AoE heal
        result.push(unit.pos);
        return result;
    }
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            const p = { x, y };
            const d = dist(unit.pos, p);
            if (d <= ability.range && d > 0) {
                if (ability.heal) {
                    const ally = state.units.find(u => u.hp > 0 && posEq(u.pos, p) && u.team === unit.team);
                    if (ally)
                        result.push(p);
                }
                else {
                    const enemy = state.units.find(u => u.hp > 0 && posEq(u.pos, p) && u.team !== unit.team);
                    if (enemy)
                        result.push(p);
                }
            }
        }
    }
    return result;
}
function addLog(state, msg) {
    state.log.push(msg);
    if (state.log.length > 50)
        state.log.shift();
}
function addFloatingText(state, text, pos, color) {
    state.floatingTexts.push({
        text,
        x: pos.x * TILE_SIZE + TILE_SIZE / 2,
        y: pos.y * TILE_SIZE + TILE_SIZE / 2,
        color,
        life: 60,
        maxLife: 60,
    });
}
function checkWinCondition(state) {
    const playerAlive = state.units.some(u => u.team === Team.Player && u.hp > 0);
    const enemyAlive = state.units.some(u => u.team === Team.Enemy && u.hp > 0);
    if (!playerAlive) {
        state.phase = Phase.GameOver;
        state.winner = Team.Enemy;
        addLog(state, '💀 Defeat! The darkness prevails...');
    }
    else if (!enemyAlive) {
        state.phase = Phase.GameOver;
        state.winner = Team.Player;
        addLog(state, '🏆 Victory! The heroes triumph!');
    }
}
// ---------- actions ----------
function performAttack(state, attacker, target) {
    const baseDmg = attacker.stats.attack;
    const defense = target.stats.defense;
    const forestBonus = state.map[target.pos.y][target.pos.x] === TileType.Forest ? 3 : 0;
    const variance = Math.floor(Math.random() * 7) - 3;
    const dmg = Math.max(1, baseDmg - defense - forestBonus + variance);
    target.hp = Math.max(0, target.hp - dmg);
    attacker.hasActed = true;
    addLog(state, `${attacker.name} attacks ${target.name} for ${dmg} damage!`);
    addFloatingText(state, `-${dmg}`, target.pos, '#ff5252');
    if (target.hp <= 0) {
        addLog(state, `💀 ${target.name} has been slain!`);
        addFloatingText(state, '💀 KO', target.pos, '#ff8a80');
    }
    checkWinCondition(state);
}
function performAbility(state, caster, targetPos, ability) {
    caster.mana -= ability.manaCost;
    caster.hasActed = true;
    if (ability.heal) {
        // healing
        if (ability.range === 0) {
            // self-centered AoE heal
            const allies = state.units.filter(u => u.hp > 0 && u.team === caster.team && dist(caster.pos, u.pos) <= ability.aoe);
            for (const ally of allies) {
                const heal = 20 + Math.floor(Math.random() * 10);
                ally.hp = Math.min(ally.stats.maxHp, ally.hp + heal);
                addLog(state, `✨ ${caster.name}'s ${ability.name} heals ${ally.name} for ${heal}!`);
                addFloatingText(state, `+${heal}`, ally.pos, '#69f0ae');
            }
        }
        else {
            const target = state.units.find(u => u.hp > 0 && posEq(u.pos, targetPos) && u.team === caster.team);
            if (target) {
                const heal = 35 + Math.floor(Math.random() * 10);
                target.hp = Math.min(target.stats.maxHp, target.hp + heal);
                addLog(state, `✨ ${caster.name}'s ${ability.name} heals ${target.name} for ${heal}!`);
                addFloatingText(state, `+${heal}`, target.pos, '#69f0ae');
            }
        }
    }
    else {
        // damage
        if (ability.aoe > 0) {
            const targets = state.units.filter(u => u.hp > 0 && u.team !== caster.team && dist(targetPos, u.pos) <= ability.aoe);
            for (const t of targets) {
                const dmg = ability.damage + Math.floor(Math.random() * 8) - 4 - t.stats.defense;
                const finalDmg = Math.max(1, dmg);
                t.hp = Math.max(0, t.hp - finalDmg);
                addLog(state, `🔥 ${caster.name}'s ${ability.name} hits ${t.name} for ${finalDmg}!`);
                addFloatingText(state, `-${finalDmg}`, t.pos, '#ff9800');
                if (t.hp <= 0) {
                    addLog(state, `💀 ${t.name} has been slain!`);
                }
            }
        }
        else {
            const target = state.units.find(u => u.hp > 0 && posEq(u.pos, targetPos) && u.team !== caster.team);
            if (target) {
                const dmg = ability.damage + Math.floor(Math.random() * 8) - 4 - target.stats.defense;
                const finalDmg = Math.max(1, dmg);
                target.hp = Math.max(0, target.hp - finalDmg);
                addLog(state, `✨ ${caster.name}'s ${ability.name} hits ${target.name} for ${finalDmg}!`);
                addFloatingText(state, `-${finalDmg}`, target.pos, '#ff9800');
                if (target.hp <= 0) {
                    addLog(state, `💀 ${target.name} has been slain!`);
                }
            }
        }
        checkWinCondition(state);
    }
}
// ---------- AI (enemy turn) ----------
function runEnemyTurn(state) {
    state.phase = Phase.EnemyTurn;
    const enemies = state.units.filter(u => u.team === Team.Enemy && u.hp > 0);
    let delay = 400;
    for (const enemy of enemies) {
        setTimeout(() => doEnemyAction(state, enemy), delay);
        delay += 800;
    }
    setTimeout(() => {
        endTurn(state);
    }, delay + 200);
}
function doEnemyAction(state, enemy) {
    if (enemy.hp <= 0)
        return;
    const playerUnits = state.units.filter(u => u.team === Team.Player && u.hp > 0);
    if (playerUnits.length === 0)
        return;
    // find nearest player unit
    let nearest = playerUnits[0];
    let nearestDist = dist(enemy.pos, nearest.pos);
    for (const pu of playerUnits) {
        const d = dist(enemy.pos, pu.pos);
        if (d < nearestDist) {
            nearest = pu;
            nearestDist = d;
        }
    }
    // try to use ability first if in range and has mana
    for (const ability of enemy.abilities) {
        if (enemy.mana >= ability.manaCost && !ability.heal) {
            const targetsInRange = playerUnits.filter(u => dist(enemy.pos, u.pos) <= ability.range);
            if (targetsInRange.length > 0) {
                // prefer AoE if multiple targets
                const best = ability.aoe > 0
                    ? targetsInRange.reduce((a, b) => {
                        const aCount = playerUnits.filter(u => dist(a.pos, u.pos) <= ability.aoe).length;
                        const bCount = playerUnits.filter(u => dist(b.pos, u.pos) <= ability.aoe).length;
                        return bCount > aCount ? b : a;
                    })
                    : targetsInRange.reduce((a, b) => a.hp < b.hp ? a : b);
                performAbility(state, enemy, best.pos, ability);
                addLog(state, `🔴 ${enemy.name} uses ${ability.name}!`);
                return;
            }
        }
    }
    // basic attack if in range
    if (nearestDist <= enemy.stats.range) {
        performAttack(state, enemy, nearest);
        return;
    }
    // move toward nearest
    const moveRange = getMovementRange(state, enemy);
    if (moveRange.length > 0) {
        // find tile closest to nearest player unit
        let bestTile = moveRange[0];
        let bestDist = dist(bestTile, nearest.pos);
        for (const t of moveRange) {
            const d = dist(t, nearest.pos);
            if (d < bestDist) {
                bestTile = t;
                bestDist = d;
            }
        }
        enemy.pos = { ...bestTile };
        addLog(state, `🔴 ${enemy.name} moves.`);
        // attack after moving if possible
        if (dist(enemy.pos, nearest.pos) <= enemy.stats.range) {
            performAttack(state, enemy, nearest);
        }
    }
}
function endTurn(state) {
    if (state.phase === Phase.GameOver)
        return;
    // reset all units for the next team
    if (state.currentTeam === Team.Enemy) {
        state.currentTeam = Team.Player;
        state.turnNumber++;
        // regen mana for player
        state.units.filter(u => u.team === Team.Player && u.hp > 0).forEach(u => {
            u.hasMoved = false;
            u.hasActed = false;
            u.mana = Math.min(u.stats.maxMana, u.mana + 5);
        });
        state.phase = Phase.SelectUnit;
        addLog(state, `--- Turn ${state.turnNumber}: Your move ---`);
    }
    else {
        // reset enemies
        state.units.filter(u => u.team === Team.Enemy && u.hp > 0).forEach(u => {
            u.hasMoved = false;
            u.hasActed = false;
            u.mana = Math.min(u.stats.maxMana, u.mana + 5);
        });
        state.currentTeam = Team.Enemy;
        addLog(state, `--- Enemy Turn ---`);
        runEnemyTurn(state);
    }
}
// ---------- player input ----------
function handleClick(state, canvasX, canvasY) {
    if (state.phase === Phase.GameOver || state.phase === Phase.EnemyTurn) {
        if (state.phase === Phase.GameOver) {
            // restart
            Object.assign(state, initState());
        }
        return;
    }
    // check UI button clicks
    const gridH = GRID_ROWS * TILE_SIZE;
    if (canvasY >= gridH) {
        for (const btn of state.uiButtons) {
            if (btn.enabled && canvasX >= btn.x && canvasX <= btn.x + btn.w && canvasY >= btn.y && canvasY <= btn.y + btn.h) {
                btn.action();
                return;
            }
        }
        return;
    }
    const tileX = Math.floor(canvasX / TILE_SIZE);
    const tileY = Math.floor(canvasY / TILE_SIZE);
    if (!inBounds({ x: tileX, y: tileY }))
        return;
    const clickPos = { x: tileX, y: tileY };
    switch (state.phase) {
        case Phase.SelectUnit: {
            const unit = state.units.find(u => u.hp > 0 && u.team === Team.Player && posEq(u.pos, clickPos) && (!u.hasMoved || !u.hasActed));
            if (unit) {
                state.selectedUnit = unit;
                state.phase = Phase.SelectAction;
                state.actionMenuOpen = true;
                if (!unit.hasMoved) {
                    state.moveTargets = getMovementRange(state, unit);
                }
                if (!unit.hasActed) {
                    state.attackTargets = getAttackRange(state, unit);
                }
            }
            break;
        }
        case Phase.SelectAction: {
            // clicking on a move target
            if (state.selectedUnit && !state.selectedUnit.hasMoved && state.moveTargets.some(p => posEq(p, clickPos))) {
                state.selectedUnit.pos = { ...clickPos };
                state.selectedUnit.hasMoved = true;
                state.moveTargets = [];
                // refresh attack range from new position
                state.attackTargets = getAttackRange(state, state.selectedUnit);
                addLog(state, `${state.selectedUnit.name} moves to (${clickPos.x},${clickPos.y}).`);
                if (state.selectedUnit.hasActed) {
                    // done with this unit
                    state.selectedUnit = null;
                    state.phase = Phase.SelectUnit;
                    state.actionMenuOpen = false;
                    checkAllDone(state);
                }
                return;
            }
            // clicking on an attack target (basic attack)
            if (state.selectedUnit && !state.selectedUnit.hasActed && state.attackTargets.some(p => posEq(p, clickPos))) {
                const target = state.units.find(u => u.hp > 0 && posEq(u.pos, clickPos) && u.team !== state.selectedUnit.team);
                if (target) {
                    performAttack(state, state.selectedUnit, target);
                    state.selectedUnit.hasMoved = true; // can't move after attacking
                    state.attackTargets = [];
                    state.moveTargets = [];
                    state.selectedUnit = null;
                    state.phase = Phase.SelectUnit;
                    state.actionMenuOpen = false;
                    checkAllDone(state);
                }
                return;
            }
            // clicking on another player unit — switch selection
            const other = state.units.find(u => u.hp > 0 && u.team === Team.Player && posEq(u.pos, clickPos) && (!u.hasMoved || !u.hasActed));
            if (other && other !== state.selectedUnit) {
                state.selectedUnit = other;
                state.moveTargets = !other.hasMoved ? getMovementRange(state, other) : [];
                state.attackTargets = !other.hasActed ? getAttackRange(state, other) : [];
                state.abilityTargets = [];
                state.selectedAbility = null;
                return;
            }
            // clicking empty = deselect
            state.selectedUnit = null;
            state.phase = Phase.SelectUnit;
            state.moveTargets = [];
            state.attackTargets = [];
            state.abilityTargets = [];
            state.actionMenuOpen = false;
            state.selectedAbility = null;
            break;
        }
        case Phase.SelectTarget: {
            if (state.selectedUnit && state.selectedAbility) {
                if (state.abilityTargets.some(p => posEq(p, clickPos))) {
                    performAbility(state, state.selectedUnit, clickPos, state.selectedAbility);
                    state.selectedUnit.hasMoved = true;
                    state.moveTargets = [];
                    state.attackTargets = [];
                    state.abilityTargets = [];
                    state.selectedAbility = null;
                    state.selectedUnit = null;
                    state.phase = Phase.SelectUnit;
                    state.actionMenuOpen = false;
                    checkAllDone(state);
                }
                else {
                    // cancel ability
                    state.phase = Phase.SelectAction;
                    state.abilityTargets = [];
                    state.selectedAbility = null;
                    if (state.selectedUnit) {
                        state.moveTargets = !state.selectedUnit.hasMoved ? getMovementRange(state, state.selectedUnit) : [];
                        state.attackTargets = !state.selectedUnit.hasActed ? getAttackRange(state, state.selectedUnit) : [];
                    }
                }
            }
            break;
        }
    }
}
function checkAllDone(state) {
    if (state.phase === Phase.GameOver)
        return;
    const playerUnits = state.units.filter(u => u.team === Team.Player && u.hp > 0);
    const allDone = playerUnits.every(u => u.hasMoved && u.hasActed);
    if (allDone) {
        endTurn(state);
    }
}
// ---------- rendering ----------
function drawTile(ctx, x, y, tileType) {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    // base tile color
    const isLight = (x + y) % 2 === 0;
    switch (tileType) {
        case TileType.Floor:
            ctx.fillStyle = isLight ? COLORS.tileLight : COLORS.tileDark;
            break;
        case TileType.Obstacle:
            ctx.fillStyle = COLORS.obstacle;
            break;
        case TileType.Water:
            ctx.fillStyle = COLORS.water;
            break;
        case TileType.Forest:
            ctx.fillStyle = COLORS.forest;
            break;
    }
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    // grid line
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
    // decorations
    ctx.font = `${TILE_SIZE * 0.5}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (tileType === TileType.Obstacle) {
        ctx.fillStyle = '#8d6e63';
        ctx.fillText('🪨', px + TILE_SIZE / 2, py + TILE_SIZE / 2);
    }
    else if (tileType === TileType.Water) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#64b5f6';
        ctx.fillText('🌊', px + TILE_SIZE / 2, py + TILE_SIZE / 2);
        ctx.globalAlpha = 1;
    }
    else if (tileType === TileType.Forest) {
        ctx.globalAlpha = 0.6;
        ctx.fillText('🌲', px + TILE_SIZE / 2, py + TILE_SIZE / 2);
        ctx.globalAlpha = 1;
    }
}
function drawUnit(ctx, unit, isSelected) {
    if (unit.hp <= 0)
        return;
    const px = unit.pos.x * TILE_SIZE;
    const py = unit.pos.y * TILE_SIZE;
    const cx = px + TILE_SIZE / 2;
    const cy = py + TILE_SIZE / 2;
    // selection glow
    if (isSelected) {
        ctx.shadowColor = '#ffd54f';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6);
        ctx.shadowBlur = 0;
    }
    // team indicator ring
    ctx.beginPath();
    ctx.arc(cx, cy, TILE_SIZE * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = unit.team === Team.Player ? 'rgba(79,195,247,0.3)' : 'rgba(239,83,80,0.3)';
    ctx.fill();
    ctx.strokeStyle = unit.team === Team.Player ? COLORS.player : COLORS.enemy;
    ctx.lineWidth = 2;
    ctx.stroke();
    // emoji
    ctx.font = `${TILE_SIZE * 0.45}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(unit.emoji, cx, cy);
    // HP bar
    const barW = TILE_SIZE - 12;
    const barH = 5;
    const barX = px + 6;
    const barY = py + TILE_SIZE - 10;
    ctx.fillStyle = COLORS.hpBarBg;
    ctx.fillRect(barX, barY, barW, barH);
    const hpRatio = unit.hp / unit.stats.maxHp;
    ctx.fillStyle = hpRatio > 0.5 ? COLORS.hpBar : hpRatio > 0.25 ? '#ffa726' : '#ef5350';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);
    // mana bar (thin)
    const mBarY = barY + barH + 1;
    ctx.fillStyle = '#1a237e';
    ctx.fillRect(barX, mBarY, barW, 3);
    ctx.fillStyle = COLORS.manaBar;
    ctx.fillRect(barX, mBarY, barW * (unit.mana / unit.stats.maxMana), 3);
    // dim if exhausted
    if (unit.hasMoved && unit.hasActed && unit.team === Team.Player) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    }
}
function drawHighlights(ctx, tiles, color) {
    for (const t of tiles) {
        ctx.fillStyle = color;
        ctx.fillRect(t.x * TILE_SIZE, t.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}
function drawUI(ctx, state) {
    const uiY = GRID_ROWS * TILE_SIZE;
    ctx.fillStyle = COLORS.uiBg;
    ctx.fillRect(0, uiY, CANVAS_W, UI_HEIGHT);
    // border
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, uiY);
    ctx.lineTo(CANVAS_W, uiY);
    ctx.stroke();
    state.uiButtons = [];
    // left panel: selected unit info
    const unit = state.selectedUnit;
    if (unit) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${unit.emoji} ${unit.name}`, 10, uiY + 8);
        ctx.font = '13px monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`HP: ${unit.hp}/${unit.stats.maxHp}  MP: ${unit.mana}/${unit.stats.maxMana}`, 10, uiY + 30);
        ctx.fillText(`ATK: ${unit.stats.attack}  DEF: ${unit.stats.defense}  SPD: ${unit.stats.speed}  RNG: ${unit.stats.range}`, 10, uiY + 48);
        // action buttons
        if (state.phase === Phase.SelectAction || state.phase === Phase.SelectTarget) {
            let bx = 10;
            const by = uiY + 72;
            const bh = 30;
            // end unit turn button
            const endBtnW = 90;
            const endBtn = {
                label: 'End Unit',
                x: bx, y: by, w: endBtnW, h: bh,
                enabled: true,
                action: () => {
                    if (state.selectedUnit) {
                        state.selectedUnit.hasMoved = true;
                        state.selectedUnit.hasActed = true;
                    }
                    state.selectedUnit = null;
                    state.moveTargets = [];
                    state.attackTargets = [];
                    state.abilityTargets = [];
                    state.selectedAbility = null;
                    state.phase = Phase.SelectUnit;
                    state.actionMenuOpen = false;
                    checkAllDone(state);
                },
            };
            state.uiButtons.push(endBtn);
            drawButton(ctx, endBtn);
            bx += endBtnW + 8;
            // ability buttons
            for (const ab of unit.abilities) {
                const canUse = !unit.hasActed && unit.mana >= ab.manaCost;
                const isActive = state.selectedAbility === ab;
                const btnW = Math.max(ctx.measureText(ab.name).width + 20, 100);
                const btn = {
                    label: `${ab.name} (${ab.manaCost}MP)`,
                    x: bx, y: by, w: btnW, h: bh,
                    enabled: canUse,
                    highlight: isActive,
                    action: () => {
                        if (!canUse)
                            return;
                        state.selectedAbility = ab;
                        state.phase = Phase.SelectTarget;
                        state.abilityTargets = getAbilityRange(state, unit, ab);
                        state.moveTargets = [];
                        state.attackTargets = [];
                    },
                };
                state.uiButtons.push(btn);
                drawButton(ctx, btn);
                bx += btnW + 8;
            }
            // ability description
            if (state.selectedAbility) {
                ctx.font = '12px monospace';
                ctx.fillStyle = '#b0bec5';
                ctx.fillText(state.selectedAbility.description, 10, uiY + 110);
            }
        }
    }
    else {
        ctx.fillStyle = '#999';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        if (state.phase === Phase.SelectUnit) {
            ctx.fillText('Click a unit to select it. Green = move, Red = attack.', 10, uiY + 10);
        }
        else if (state.phase === Phase.EnemyTurn) {
            ctx.fillText('Enemy is thinking...', 10, uiY + 10);
        }
        else if (state.phase === Phase.GameOver) {
            ctx.fillStyle = state.winner === Team.Player ? '#69f0ae' : '#ef5350';
            ctx.font = 'bold 20px monospace';
            ctx.fillText(state.winner === Team.Player ? '🏆 VICTORY! Click to play again.' : '💀 DEFEAT! Click to try again.', 10, uiY + 10);
        }
    }
    // end turn button (right side)
    if (state.phase === Phase.SelectUnit || state.phase === Phase.SelectAction) {
        const etBtn = {
            label: '⏩ End Turn',
            x: CANVAS_W - 120, y: uiY + 8, w: 110, h: 34,
            enabled: true,
            action: () => {
                state.selectedUnit = null;
                state.moveTargets = [];
                state.attackTargets = [];
                state.abilityTargets = [];
                state.selectedAbility = null;
                state.actionMenuOpen = false;
                // mark all player units as done
                state.units.filter(u => u.team === Team.Player && u.hp > 0).forEach(u => {
                    u.hasMoved = true;
                    u.hasActed = true;
                });
                endTurn(state);
            },
        };
        state.uiButtons.push(etBtn);
        drawButton(ctx, etBtn, true);
    }
    // turn counter (top right)
    ctx.fillStyle = '#90a4ae';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Turn ${state.turnNumber}`, CANVAS_W - 10, uiY + 50);
    // log (right side)
    ctx.fillStyle = '#78909c';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    const logStart = Math.max(0, state.log.length - 5);
    for (let i = logStart; i < state.log.length; i++) {
        const ly = uiY + 70 + (i - logStart) * 16;
        ctx.fillText(state.log[i].substring(0, 50), CANVAS_W - 10, ly);
    }
}
function drawButton(ctx, btn, accent = false) {
    ctx.fillStyle = btn.highlight ? '#5c6bc0' : btn.enabled ? (accent ? '#37474f' : '#263238') : '#1a1a1a';
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
    ctx.strokeStyle = btn.highlight ? '#9fa8da' : btn.enabled ? '#546e7a' : '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
    ctx.fillStyle = btn.enabled ? '#e0e0e0' : '#555';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
}
function drawFloatingTexts(ctx, state) {
    state.floatingTexts = state.floatingTexts.filter(ft => ft.life > 0);
    for (const ft of state.floatingTexts) {
        const alpha = ft.life / ft.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const yOff = (1 - alpha) * 30;
        ctx.fillText(ft.text, ft.x, ft.y - yOff);
        ft.life--;
        ft.y -= 0.3;
        ctx.globalAlpha = 1;
    }
}
function drawHover(ctx, state) {
    if (!state.hoveredTile)
        return;
    const { x, y } = state.hoveredTile;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    // tooltip for hovered unit
    const unit = state.units.find(u => u.hp > 0 && posEq(u.pos, state.hoveredTile));
    if (unit) {
        const tx = x * TILE_SIZE + TILE_SIZE + 5;
        const ty = y * TILE_SIZE;
        ctx.fillStyle = 'rgba(13,27,42,0.92)';
        ctx.fillRect(tx, ty, 160, 52);
        ctx.strokeStyle = '#546e7a';
        ctx.strokeRect(tx, ty, 160, 52);
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${unit.emoji} ${unit.name}`, tx + 5, ty + 5);
        ctx.fillStyle = '#aaa';
        ctx.fillText(`HP:${unit.hp}/${unit.stats.maxHp} MP:${unit.mana}`, tx + 5, ty + 22);
        ctx.fillText(`ATK:${unit.stats.attack} DEF:${unit.stats.defense}`, tx + 5, ty + 36);
    }
}
function render(ctx, state) {
    // clear
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // tiles
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            drawTile(ctx, x, y, state.map[y][x]);
        }
    }
    // highlights
    drawHighlights(ctx, state.moveTargets, COLORS.moveRange);
    drawHighlights(ctx, state.attackTargets, COLORS.attackRange);
    drawHighlights(ctx, state.abilityTargets, COLORS.abilityRange);
    // units
    for (const u of state.units) {
        drawUnit(ctx, u, u === state.selectedUnit);
    }
    // hover
    drawHover(ctx, state);
    // floating text
    drawFloatingTexts(ctx, state);
    // UI
    drawUI(ctx, state);
}
// ---------- main ----------
function main() {
    const canvas = document.getElementById('game');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    const state = initState();
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        handleClick(state, x, y);
    });
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(y / TILE_SIZE);
        if (inBounds({ x: tileX, y: tileY })) {
            state.hoveredTile = { x: tileX, y: tileY };
        }
        else {
            state.hoveredTile = null;
        }
    });
    function gameLoop() {
        render(ctx, state);
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
}
window.addEventListener('DOMContentLoaded', main);
//# sourceMappingURL=game.js.map