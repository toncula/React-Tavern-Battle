
import { CardData, UnitType } from '../types';

// Updated type to Omit traits to avoid missing property errors in template definitions
export const CARD_TEMPLATES: Omit<CardData, 'id' | 'upgrades' | 'traits'>[] = [
  // --- TIER 1 ---
  {
    templateId: 'c_militia',
    name: 'Militia',
    description: 'The kingdom\'s last line of defense, armed with pitchforks and unwavering courage.',
    cost: 3,
    tier: 1,
    value: 10,
    unitType: UnitType.MELEE,
    unitCount: 3,
    specialEffect: 'MILITIA_GROWTH',
    baseStats: { hp: 35, damage: 3, range: 10, attackCooldown: 40, moveSpeed: 1.5, color: '#94a3b8' }
  },
  {
    templateId: 'c_archers',
    name: 'Archers',
    description: 'Trained in the high towers, their synchronized volleys can blot out the sun.',
    cost: 3,
    tier: 1,
    value: 15,
    unitType: UnitType.RANGED,
    unitCount: 2,
    specialEffect: 'TAVERN_GROWTH',
    baseStats: { hp: 35, damage: 8, range: 125, attackCooldown: 45, moveSpeed: 1.2, color: '#22c55e' }
  },
  {
    templateId: 'c_ranger',
    name: 'Ranger',
    description: 'A solitary hunter who passes his survival techniques to his kin before vanishing into the wild.',
    cost: 3,
    tier: 1,
    value: 20,
    unitType: UnitType.RANGED,
    unitCount: 1,
    specialEffect: 'SELL_BUFF_RIGHT',
    baseStats: { hp: 120, damage: 45, range: 100, attackCooldown: 135, moveSpeed: 1.4, color: '#f59e0b' }
  },
  {
    templateId: 'c_ballista',
    name: 'Ballista',
    description: 'Heavy siege weaponry that is so valuable it requires a dedicated guard detail to operate.',
    cost: 3,
    tier: 1,
    value: 18,
    unitType: UnitType.SPLASHER,
    unitCount: 1,
    specialEffect: 'SUMMON_ESCORT',
    baseStats: { hp: 80, damage: 16, range: 140, attackCooldown: 110, moveSpeed: 0.8, color: '#ea580c', aoeRadius: 30 }
  },

  // --- TIER 2 ---
  {
    templateId: 'c_shielder',
    name: 'Shielder',
    description: 'Their shield wall is impenetrable, growing stronger with every soldier standing shoulder-to-shoulder.',
    cost: 3,
    tier: 2,
    value: 25,
    unitType: UnitType.MELEE,
    unitCount: 2,
    specialEffect: 'ADJACENT_GROWTH',
    baseStats: { hp: 90, damage: 4, range: 10, attackCooldown: 60, moveSpeed: 1.0, color: '#0ea5e9' }
  },
  {
    templateId: 'c_scouts',
    name: 'Scouts',
    description: 'They traverse the borders ahead of the main force, returning with gold seized from enemy supply lines.',
    cost: 3,
    tier: 2,
    value: 22,
    unitType: UnitType.RANGED,
    unitCount: 3,
    specialEffect: 'PASSIVE_GOLD',
    baseStats: { hp: 35, damage: 6, range: 90, attackCooldown: 30, moveSpeed: 1.6, color: '#14b8a6' }
  },
  {
    templateId: 'c_mage',
    name: 'Mage',
    description: 'An arcanist who draws power from the diversity of the legion, weaving it into arcane storms.',
    cost: 3,
    tier: 2,
    value: 30,
    unitType: UnitType.SPLASHER,
    unitCount: 1,
    specialEffect: 'ENTRY_TYPE_GROWTH',
    baseStats: { hp: 50, damage: 8, range: 110, attackCooldown: 80, moveSpeed: 1.0, color: '#8b5cf6', aoeRadius: 50 }
  },
  {
    templateId: 'c_veteran',
    name: 'Veteran',
    description: 'Old scars tell stories of survival. His presence rallies the troops whenever the ranks are thinned.',
    cost: 3,
    tier: 2,
    value: 40,
    unitType: UnitType.BUFFER,
    unitCount: 1,
    specialEffect: 'SELL_TRIGGER_GROWTH',
    baseStats: { 
        hp: 160, damage: 8, range: 15, attackCooldown: 50, moveSpeed: 1.1, color: '#e11d48',
        buffRadius: 75,
        buffStats: { damage: 1, attackSpeed: 0 } 
    }
  },

  // --- TIER 3 ---
  {
    templateId: 'c_centurion',
    name: 'Centurion',
    description: 'A disciplined commander who strengthens the vanguard simply by arriving on the field.',
    cost: 3,
    tier: 3,
    value: 35,
    unitType: UnitType.MELEE,
    unitCount: 2,
    specialEffect: 'MELEE_BUFF_ON_ENTER',
    baseStats: { hp: 110, damage: 8, range: 12, attackCooldown: 50, moveSpeed: 1.2, color: '#b91c1c' }
  },
  {
    templateId: 'c_crossbow',
    name: 'Crossbowmen',
    description: 'Wielding heavy bolts that can pierce armor, they recruit more soldiers with the spoils of war.',
    cost: 3,
    tier: 3,
    value: 32,
    unitType: UnitType.RANGED,
    unitCount: 2,
    specialEffect: 'GROWTH_ON_SELL',
    baseStats: { hp: 40, damage: 14, range: 130, attackCooldown: 70, moveSpeed: 1.0, color: '#4d7c0f' }
  },
  {
    templateId: 'c_mangonel',
    name: 'Mangonel',
    description: 'A mobile catapult that wreaks havoc. Its crew expands significantly when a large legion is disbanded.',
    cost: 3,
    tier: 3,
    value: 45,
    unitType: UnitType.SPLASHER,
    unitCount: 1,
    specialEffect: 'GROWTH_ON_LARGE_SELL',
    baseStats: { hp: 120, damage: 25, range: 150, attackCooldown: 130, moveSpeed: 0.7, color: '#c2410c', aoeRadius: 40 }
  },
  {
    templateId: 'c_observer',
    name: 'Observer',
    description: 'A mystical eye that hovers above, granting immense range to its allies and strengthening the vanguard.',
    cost: 3,
    tier: 3,
    value: 50,
    unitType: UnitType.BUFFER,
    unitCount: 1,
    specialEffect: 'LEFTMOST_GROWTH',
    baseStats: { 
        hp: 80, damage: 5, range: 200, attackCooldown: 60, moveSpeed: 1.5, color: '#06b6d4', 
        buffRadius: 100, // Reduced from 500
        buffStats: { damage: 0, attackSpeed: 0, range: 100 } // +100 Range Buff
    }
  },

  // --- TIER 4 ---
  {
    templateId: 'c_commander',
    name: 'High Commander',
    description: 'A legendary hero who leads from the front, inspiring all melee units to limitless growth.',
    cost: 3,
    tier: 4,
    value: 80,
    unitType: UnitType.HERO,
    unitCount: 1,
    specialEffect: 'ALL_MELEE_GROWTH',
    baseStats: { hp: 300, damage: 25, range: 20, attackCooldown: 40, moveSpeed: 1.3, color: '#facc15' }
  },
  {
    templateId: 'c_merc',
    name: 'Mercenary',
    description: 'Soldiers of fortune who absorb the manpower of dismissed squads.',
    cost: 3,
    tier: 4,
    value: 60,
    unitType: UnitType.MELEE,
    unitCount: 3,
    specialEffect: 'INHERIT_HALF_ON_SELL',
    baseStats: { hp: 90, damage: 10, range: 12, attackCooldown: 35, moveSpeed: 1.4, color: '#3f3f46' }
  },
  {
    templateId: 'c_arcanist',
    name: 'Arcanist',
    description: 'A master of arcane arts who calls down destruction from the skies. Requires a diverse army to channel his power.',
    cost: 3,
    tier: 4,
    value: 75,
    unitType: UnitType.SPLASHER,
    unitCount: 1,
    specialEffect: 'ENTRY_TYPE_GROWTH', // Reusing Mage effect
    baseStats: { hp: 80, damage: 8, range: 200, attackCooldown: 80, moveSpeed: 0.5, color: '#1e3a8a', aoeRadius: 70 }
  },
  {
    templateId: 'c_musketeer',
    name: 'Musketeer',
    description: 'Armed with black powder weapons. They value the quality of equipment over quantity of men.',
    cost: 3,
    tier: 4,
    value: 70,
    unitType: UnitType.RANGED,
    unitCount: 5,
    specialEffect: 'GROWTH_ON_UPGRADED_SELL',
    baseStats: { hp: 60, damage: 55, range: 140, attackCooldown: 160, moveSpeed: 1.0, color: '#1e293b' }
  },

    // --- TOKEN (Tier 0) ---
  {
    templateId: 'c_escort',
    name: 'Escort',
    description: 'Handpicked soldiers sworn to protect the legion\'s heavy artillery at all costs.',
    cost: 0,
    tier: 0, 
    value: 5,
    unitType: UnitType.MELEE,
    unitCount: 1,
    baseStats: { hp: 50, damage: 4, range: 10, attackCooldown: 45, moveSpeed: 1.3, color: '#57534e' }
  },
];
