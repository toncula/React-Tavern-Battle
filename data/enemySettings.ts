
import { CardData, UnitType } from '../types';

// Internal helper to create base templates
const createTemplate = (
    id: string,
    name: string, 
    type: UnitType, 
    value: number,
    stats: { 
        hp: number; 
        damage: number; 
        range: number; 
        cooldown: number; 
        speed: number; 
        color: string; 
        buffStats?: { damage: number, attackSpeed: number }, 
        buffRadius?: number, 
        aoeRadius?: number 
    }
): CardData => {
    return {
        id: `template_${id}`,
        templateId: id,
        name: name,
        description: 'Enemy Unit',
        cost: 0,
        tier: 1,
        value: value,
        unitType: type,
        unitCount: 1, // Default count
        baseStats: {
            hp: stats.hp,
            damage: stats.damage,
            range: stats.range,
            attackCooldown: stats.cooldown,
            moveSpeed: stats.speed,
            color: stats.color,
            buffRadius: stats.buffRadius,
            buffStats: stats.buffStats,
            aoeRadius: stats.aoeRadius
        },
        // Added traits property to fix missing property error
        traits: [],
        upgrades: []
    };
};

// --- ENEMY UNIT CONSTANTS (Templates) ---

export const E_GOBLIN_SCAVENGER = createTemplate('e_goblin_scavenger', 'Goblin Scavenger', UnitType.MELEE, 5, { hp: 20, damage: 2, range: 10, cooldown: 50, speed: 1.2, color: '#ef4444' });
export const E_ORC_GRUNT = createTemplate('e_orc_grunt', 'Orc Grunt', UnitType.MELEE, 12, { hp: 45, damage: 4, range: 10, cooldown: 60, speed: 1.0, color: '#b91c1c' });
export const E_GOBLIN_ARCHER = createTemplate('e_goblin_archer', 'Goblin Archer', UnitType.RANGED, 12, { hp: 15, damage: 4, range: 100, cooldown: 60, speed: 1.0, color: '#ea580c' });
export const E_KOBOLD_THIEF = createTemplate('e_kobold_thief', 'Kobold Thief', UnitType.MELEE, 20, { hp: 15, damage: 8, range: 10, cooldown: 20, speed: 2.8, color: '#fde047' });
export const E_ORC_DRUMMER = createTemplate('e_orc_drummer', 'Orc Drummer', UnitType.BUFFER, 30, { hp: 120, damage: 2, range: 10, cooldown: 70, speed: 0.8, color: '#7f1d1d', buffRadius: 100, buffStats: { damage: 2, attackSpeed: 0.1 } });
export const E_WARG_ALPHA = createTemplate('e_warg_alpha', 'Warg Impaler', UnitType.RANGED, 40, { hp: 120, damage: 35, range: 150, cooldown: 90, speed: 1.2, color: '#be185d' });
export const E_WARG_PACK = createTemplate('e_warg_pack', 'Warg Pack', UnitType.MELEE, 40, { hp: 40, damage: 4, range: 10, cooldown: 25, speed: 2.4, color: '#4b5563' });
export const E_SIEGE_BALLISTA = createTemplate('e_siege_ballista', 'Siege Ballista', UnitType.SPLASHER, 60, { hp: 80, damage: 15, range: 160, cooldown: 90, speed: 0.5, color: '#7f1d1d', aoeRadius: 40 });
export const E_ELITE_ARCHER = createTemplate('e_elite_archer', 'Elite Archer', UnitType.RANGED, 35, { hp: 30, damage: 8, range: 130, cooldown: 45, speed: 1.1, color: '#c2410c' });
export const E_SHIELD_BEARER = createTemplate('e_shield_bearer', 'Shield Bearer', UnitType.MELEE, 40, { hp: 120, damage: 3, range: 10, cooldown: 60, speed: 0.8, color: '#374151' });
export const E_GATEKEEPER = createTemplate('e_gatekeeper', 'THE GATEKEEPER', UnitType.HERO, 150, { hp: 700, damage: 25, range: 15, cooldown: 50, speed: 0.8, color: '#581c87' });
export const E_GATE_GUARD = createTemplate('e_gate_guard', 'Gate Guard', UnitType.MELEE, 40, { hp: 100, damage: 8, range: 10, cooldown: 55, speed: 0.9, color: '#6b21a8' });
export const E_VOID_MAGE = createTemplate('e_void_mage', 'Void Mage', UnitType.SPLASHER, 50, { hp: 40, damage: 12, range: 120, cooldown: 70, speed: 1.0, color: '#a855f7' });
export const E_VOIDLING_SWARM = createTemplate('e_voidling_swarm', 'Voidling Swarm', UnitType.MELEE, 10, { hp: 30, damage: 4, range: 10, cooldown: 40, speed: 1.5, color: '#a855f7' });
export const E_ASSASSIN = createTemplate('e_assassin', 'Assassin', UnitType.MELEE, 60, { hp: 50, damage: 15, range: 10, cooldown: 25, speed: 2.5, color: '#0f172a' });
export const E_SHADOW_DANCER = createTemplate('e_shadow_dancer', 'Shadow Dancer', UnitType.BUFFER, 50, { hp: 100, damage: 5, range: 10, cooldown: 40, speed: 1.5, color: '#1e293b', buffRadius: 100, buffStats: { damage: 0, attackSpeed: 0.3 } });
export const E_IRON_GOLEM = createTemplate('e_iron_golem', 'Iron Golem', UnitType.MELEE, 100, { hp: 400, damage: 15, range: 10, cooldown: 80, speed: 0.6, color: '#475569' });
export const E_SUPPORT_BOT = createTemplate('e_support_bot', 'Support Bot', UnitType.BUFFER, 60, { hp: 50, damage: 2, range: 100, cooldown: 60, speed: 1.0, color: '#cbd5e1', buffRadius: 500, buffStats: { damage: 3, attackSpeed: 0.15 } });
export const E_MUSKETEER_ENEMY = createTemplate('e_musketeer_enemy', 'Enemy Musketeer', UnitType.RANGED, 60, { hp: 40, damage: 15, range: 150, cooldown: 90, speed: 0.8, color: '#334155' });
export const E_GRAND_WIZARD = createTemplate('e_grand_wizard', 'Grand Wizard', UnitType.SPLASHER, 100, { hp: 150, damage: 40, range: 140, cooldown: 80, speed: 0.8, color: '#4338ca', aoeRadius: 70 });
export const E_MANA_WISP = createTemplate('e_mana_wisp', 'Mana Wisp', UnitType.BUFFER, 40, { hp: 20, damage: 1, range: 10, cooldown: 30, speed: 2.0, color: '#818cf8', buffRadius: 60, buffStats: { damage: 5, attackSpeed: 0 } });
export const E_SPELLBLADE = createTemplate('e_spellblade', 'Spellblade', UnitType.MELEE, 60, { hp: 90, damage: 15, range: 10, cooldown: 45, speed: 1.3, color: '#6366f1' });
export const E_LEGION_COMMANDER = createTemplate('e_legion_commander', 'Legion Commander', UnitType.BUFFER, 100, { hp: 300, damage: 20, range: 10, cooldown: 50, speed: 1.0, color: '#b91c1c', buffRadius: 100, buffStats: { damage: 5, attackSpeed: 0.1 } });
export const E_LEGIONNAIRE = createTemplate('e_legionnaire', 'Legionnaire', UnitType.MELEE, 60, { hp: 180, damage: 12, range: 10, cooldown: 55, speed: 1.0, color: '#991b1b' });
export const E_LEGION_ARCHER = createTemplate('e_legion_archer', 'Legion Archer', UnitType.RANGED, 60, { hp: 60, damage: 15, range: 140, cooldown: 50, speed: 1.0, color: '#c2410c' });
export const E_VOID_BEHEMOTH = createTemplate('e_void_behemoth', 'Void Behemoth', UnitType.MELEE, 200, { hp: 1000, damage: 40, range: 15, cooldown: 90, speed: 0.7, color: '#2e1065' });
// REMADE STYLE: Voidling is now a Ranged projectile shooter
export const E_VOIDLING = createTemplate('e_voidling', 'Voidling', UnitType.RANGED, 30, { hp: 45, damage: 14, range: 125, cooldown: 45, speed: 1.4, color: '#a855f7' });
export const E_WARLORD_SUPREME = createTemplate('e_warlord_supreme', 'THE WARLORD SUPREME', UnitType.HERO, 1000, { hp: 6000, damage: 80, range: 35, cooldown: 40, speed: 1.1, color: '#450a0a' });
export const E_ROYAL_GUARD_ELITE = createTemplate('e_royal_guard_elite', 'Royal Guard Elite', UnitType.BUFFER, 100, { hp: 400, damage: 20, range: 10, cooldown: 55, speed: 1.0, color: '#7f1d1d', buffRadius: 80, buffStats: { damage: 10, attackSpeed: 0 } });
export const E_WAR_MACHINE = createTemplate('e_war_machine', 'War Machine', UnitType.SPLASHER, 100, { hp: 200, damage: 40, range: 200, cooldown: 100, speed: 0.5, color: '#57534e', aoeRadius: 60 });
export const E_GRUNT_SWARM = createTemplate('e_grunt_swarm', 'Grunt Swarm', UnitType.MELEE, 20, { hp: 60, damage: 8, range: 10, cooldown: 50, speed: 1.3, color: '#b91c1c' });
export const E_ENDLESS_HORDE = createTemplate('e_endless_horde', 'Endless Horde', UnitType.MELEE, 20, { hp: 60, damage: 8, range: 10, cooldown: 50, speed: 1.3, color: '#b91c1c' });

// --- CODEX DATA ---

export const CODEX_ENEMIES: CardData[] = [
    { ...E_GOBLIN_SCAVENGER, unitCount: 8 },
    { ...E_ORC_GRUNT, unitCount: 6 },
    { ...E_GOBLIN_ARCHER, unitCount: 6 },
    { ...E_KOBOLD_THIEF, unitCount: 13 },
    { ...E_ORC_DRUMMER, unitCount: 2 },
    { ...E_WARG_ALPHA, unitCount: 3 },
    { ...E_WARG_PACK, unitCount: 17 },
    { ...E_SIEGE_BALLISTA, unitCount: 3 },
    { ...E_ELITE_ARCHER, unitCount: 10 },
    { ...E_SHIELD_BEARER, unitCount: 12 },
    { ...E_GATEKEEPER, unitCount: 1 },
    { ...E_GATE_GUARD, unitCount: 10 },
    { ...E_VOID_MAGE, unitCount: 5 },
    { ...E_VOIDLING_SWARM, unitCount: 15 },
    { ...E_ASSASSIN, unitCount: 20 },
    { ...E_SHADOW_DANCER, unitCount: 5 },
    { ...E_IRON_GOLEM, unitCount: 8 },
    { ...E_SUPPORT_BOT, unitCount: 5 },
    { ...E_MUSKETEER_ENEMY, unitCount: 22 },
    { ...E_GRAND_WIZARD, unitCount: 3 },
    { ...E_MANA_WISP, unitCount: 20 },
    { ...E_SPELLBLADE, unitCount: 17 },
    { ...E_LEGION_COMMANDER, unitCount: 4 },
    { ...E_LEGIONNAIRE, unitCount: 26 },
    { ...E_LEGION_ARCHER, unitCount: 20 },
    { ...E_VOID_BEHEMOTH, unitCount: 5 },
    { ...E_VOIDLING, unitCount: 55 },
    { ...E_WARLORD_SUPREME, unitCount: 1 },
    { ...E_ROYAL_GUARD_ELITE, unitCount: 10 },
    { ...E_WAR_MACHINE, unitCount: 5 },
    { ...E_GRUNT_SWARM, unitCount: 54 },
];

// --- WAVE GENERATION ---

export const getEnemyComposition = (round: number): CardData[] => {
    switch (round) {
        case 1:
            return [{ ...E_GOBLIN_SCAVENGER, id: 'r1_1', unitCount: 8 }];
        case 2:
            return [
                { ...E_ORC_GRUNT, id: 'r2_1', unitCount: 6 },
                { ...E_GOBLIN_ARCHER, id: 'r2_2', unitCount: 6 }
            ];
        case 3:
            return [
                { ...E_ORC_DRUMMER, id: 'r3_1', unitCount: 2 },
                { ...E_KOBOLD_THIEF, id: 'r3_2', unitCount: 13 }
            ];
        case 4:
            return [
                 { ...E_WARG_ALPHA, id: 'r4_1', unitCount: 3 },
                 { ...E_WARG_PACK, id: 'r4_2', unitCount: 17 }
            ];
        case 5:
            return [
                { ...E_SIEGE_BALLISTA, id: 'r5_1', unitCount: 3 },
                { ...E_ELITE_ARCHER, id: 'r5_2', unitCount: 10 },
                { ...E_SHIELD_BEARER, id: 'r5_3', unitCount: 12 }
            ];
        case 6:
            return [
                { ...E_GATEKEEPER, id: 'r6_1', unitCount: 1 },
                { ...E_GATE_GUARD, id: 'r6_2', unitCount: 10 },
                { ...E_VOID_MAGE, id: 'r6_3', unitCount: 5 },
                { ...E_VOIDLING_SWARM, id: 'r6_4', unitCount: 15 }
            ];
        case 7:
            return [
                { ...E_ASSASSIN, id: 'r7_1', unitCount: 20 },
                { ...E_SHADOW_DANCER, id: 'r7_2', unitCount: 5 }
            ];
        case 8:
            return [
                { ...E_IRON_GOLEM, id: 'r8_1', unitCount: 8 },
                { ...E_SUPPORT_BOT, id: 'r8_2', unitCount: 5 },
                { ...E_MUSKETEER_ENEMY, id: 'r8_3', unitCount: 22 }
            ];
        case 9:
            return [
                { ...E_GRAND_WIZARD, id: 'r9_1', unitCount: 3 },
                { ...E_MANA_WISP, id: 'r9_2', unitCount: 20 },
                { ...E_SPELLBLADE, id: 'r9_3', unitCount: 17 }
            ];
        case 10:
             return [
                 { ...E_LEGION_COMMANDER, id: 'r10_1', unitCount: 4 },
                 { ...E_LEGIONNAIRE, id: 'r10_2', unitCount: 26 },
                 { ...E_LEGION_ARCHER, id: 'r10_3', unitCount: 20 }
             ];
        case 11:
            return [
                { ...E_VOID_BEHEMOTH, id: 'r11_1', unitCount: 5 },
                { ...E_VOIDLING, id: 'r11_2', unitCount: 55 }
            ];
        case 12:
            return [
                { ...E_WARLORD_SUPREME, id: 'r12_1', unitCount: 1 },
                { ...E_ROYAL_GUARD_ELITE, id: 'r12_2', unitCount: 10 },
                { ...E_WAR_MACHINE, id: 'r12_3', unitCount: 5 },
                { ...E_GRUNT_SWARM, id: 'r12_4', unitCount: 54 }
            ];
        default:
            return [
                 { ...E_ENDLESS_HORDE, id: 'inf_1', unitCount: 30 + (round * 5), value: 50 + (round * 5), baseStats: { ...E_ENDLESS_HORDE.baseStats, hp: 50 + (round * 20), damage: 10 + round } }
            ];
    }
};
