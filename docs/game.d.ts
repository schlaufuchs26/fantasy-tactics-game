declare const GRID_COLS = 10;
declare const GRID_ROWS = 8;
declare const TILE_SIZE = 72;
declare const UI_HEIGHT = 180;
declare const CANVAS_W: number;
declare const CANVAS_H: number;
declare const COLORS: {
    bg: string;
    gridLine: string;
    tileLight: string;
    tileDark: string;
    highlight: string;
    moveRange: string;
    attackRange: string;
    abilityRange: string;
    player: string;
    enemy: string;
    hpBar: string;
    hpBarBg: string;
    manaBar: string;
    uiBg: string;
    uiText: string;
    uiActive: string;
    obstacle: string;
    water: string;
    forest: string;
};
declare enum Team {
    Player = 0,
    Enemy = 1
}
declare enum Phase {
    SelectUnit = 0,
    SelectAction = 1,
    SelectTarget = 2,
    EnemyTurn = 3,
    GameOver = 4
}
declare enum TileType {
    Floor = 0,
    Obstacle = 1,
    Water = 2,
    Forest = 3
}
interface Pos {
    x: number;
    y: number;
}
interface Ability {
    name: string;
    damage: number;
    range: number;
    manaCost: number;
    aoe: number;
    heal?: boolean;
    description: string;
}
interface UnitStats {
    maxHp: number;
    maxMana: number;
    attack: number;
    defense: number;
    speed: number;
    range: number;
}
interface Unit {
    id: number;
    name: string;
    className: string;
    team: Team;
    pos: Pos;
    stats: UnitStats;
    hp: number;
    mana: number;
    abilities: Ability[];
    hasMoved: boolean;
    hasActed: boolean;
    emoji: string;
    color: string;
    level: number;
}
declare function knightTemplate(): Omit<Unit, 'id' | 'team' | 'pos'>;
declare function mageTemplate(): Omit<Unit, 'id' | 'team' | 'pos'>;
declare function archerTemplate(): Omit<Unit, 'id' | 'team' | 'pos'>;
declare function rogueTemplate(): Omit<Unit, 'id' | 'team' | 'pos'>;
declare function generateMap(): TileType[][];
interface FloatingText {
    text: string;
    x: number;
    y: number;
    color: string;
    life: number;
    maxLife: number;
}
interface GameState {
    map: TileType[][];
    units: Unit[];
    phase: Phase;
    selectedUnit: Unit | null;
    selectedAbility: Ability | null;
    hoveredTile: Pos | null;
    moveTargets: Pos[];
    attackTargets: Pos[];
    abilityTargets: Pos[];
    turnNumber: number;
    currentTeam: Team;
    log: string[];
    winner: Team | null;
    floatingTexts: FloatingText[];
    animating: boolean;
    actionMenuOpen: boolean;
    uiButtons: UIButton[];
}
interface UIButton {
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    action: () => void;
    enabled: boolean;
    highlight?: boolean;
}
declare let nextId: number;
declare function makeUnit(template: Omit<Unit, 'id' | 'team' | 'pos'>, team: Team, pos: Pos): Unit;
declare function initState(): GameState;
declare function dist(a: Pos, b: Pos): number;
declare function posEq(a: Pos, b: Pos): boolean;
declare function inBounds(p: Pos): boolean;
declare function isWalkable(state: GameState, p: Pos): boolean;
declare function getMovementRange(state: GameState, unit: Unit): Pos[];
declare function getAttackRange(state: GameState, unit: Unit): Pos[];
declare function getAbilityRange(state: GameState, unit: Unit, ability: Ability): Pos[];
declare function addLog(state: GameState, msg: string): void;
declare function addFloatingText(state: GameState, text: string, pos: Pos, color: string): void;
declare function checkWinCondition(state: GameState): void;
declare function performAttack(state: GameState, attacker: Unit, target: Unit): void;
declare function performAbility(state: GameState, caster: Unit, targetPos: Pos, ability: Ability): void;
declare function runEnemyTurn(state: GameState): void;
declare function doEnemyAction(state: GameState, enemy: Unit): void;
declare function endTurn(state: GameState): void;
declare function handleClick(state: GameState, canvasX: number, canvasY: number): void;
declare function checkAllDone(state: GameState): void;
declare function drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, tileType: TileType): void;
declare function drawUnit(ctx: CanvasRenderingContext2D, unit: Unit, isSelected: boolean): void;
declare function drawHighlights(ctx: CanvasRenderingContext2D, tiles: Pos[], color: string): void;
declare function drawUI(ctx: CanvasRenderingContext2D, state: GameState): void;
declare function drawButton(ctx: CanvasRenderingContext2D, btn: UIButton, accent?: boolean): void;
declare function drawFloatingTexts(ctx: CanvasRenderingContext2D, state: GameState): void;
declare function drawHover(ctx: CanvasRenderingContext2D, state: GameState): void;
declare function render(ctx: CanvasRenderingContext2D, state: GameState): void;
declare function main(): void;
