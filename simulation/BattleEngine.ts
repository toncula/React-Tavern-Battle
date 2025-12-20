
import { CardData, CombatUnit, UnitType } from '../types';
import { 
    getEffectiveStats, 
    HIT_FLASH_TICKS, 
    ATTACK_ANIM_TICKS, 
    EXPLOSION_TICKS, 
    FLOAT_TEXT_TICKS,
    PARTICLE_BASE_LIFE,
    PROJECTILE_MIN_FLIGHT_FRAMES,
    FPS
} from '../constants';
import { getCardText, Language } from '../translations';
import { playSound } from '../services/audioService';
import { isMagicUnit, isPowerUnit } from './unitHelpers';

// Constants for projectile behavior
const MAGIC_WAVE_STRENGTH = 8;
const MAGIC_WAVE_FREQUENCY = 3;

// Visual Effects Types
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Explosion {
    x: number;
    y: number;
    radius: number;
    life: number;
    maxLife: number;
    color: string;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

export interface AttackTrail {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    life: number;
    maxLife: number;
    width: number;
}

export interface Projectile {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  progress: number;
  speed: number;
  damage: number;
  color: string;
  aoeRadius: number;
  team: 'PLAYER' | 'ENEMY';
  style: 'SIEGE' | 'MAGIC'; 
  rotation?: number;
  sourceName: string;
  sourceType: UnitType;
}

export interface DamageTracker {
    [unitName: string]: {
        total: number;
        color: string;
        unitType: UnitType;
    }
}

export class BattleEngine {
    units: CombatUnit[] = [];
    particles: Particle[] = [];
    explosions: Explosion[] = [];
    floatText: FloatingText[] = [];
    trails: AttackTrail[] = [];
    projectiles: Projectile[] = [];
    
    playerDamageStats: DamageTracker = {};
    enemyDamageStats: DamageTracker = {};

    battleTime: number = 0;
    endingDelay: number = 0;
    isEnding: boolean = false; 
    
    canvasWidth: number = 800;
    canvasHeight: number = 500;

    constructor() {}

    init(playerHand: (CardData | null)[], enemyConfig: CardData[], language: Language) {
        this.units = [];
        this.particles = [];
        this.explosions = [];
        this.floatText = [];
        this.trails = [];
        this.projectiles = [];
        this.playerDamageStats = {};
        this.enemyDamageStats = {};
        this.battleTime = 0;
        this.endingDelay = 0;
        this.isEnding = false;

        const spawnUnits = (cards: (CardData | null)[], team: 'PLAYER' | 'ENEMY') => {
            const teamUnits: CombatUnit[] = [];
            const activeCards = cards.filter((c): c is CardData => c !== null);

            activeCards.sort((a, b) => {
                const statsA = getEffectiveStats(a);
                const statsB = getEffectiveStats(b);
                if (Math.abs(statsA.range - statsB.range) < 10) {
                   return statsB.hp - statsA.hp; 
                }
                return statsA.range - statsB.range;
            });

            activeCards.forEach((card, index) => {
                const stats = getEffectiveStats(card);
                const safeIndex = Math.min(index, 6);
                const pos = this.getSlotPosition(safeIndex, team);
                const cardText = getCardText(card, language);

                const finalHp = stats.hp;
                const finalDmg = stats.damage;
                const finalMaxCooldown = stats.cooldownFrames;
                
                let radius = 10;
                if (stats.unitType === UnitType.BUFFER) radius = 14;
                if (stats.unitType === UnitType.HERO) radius = 28;

                const unitValue = stats.value / Math.max(1, card.unitCount);

                for (let i = 0; i < card.unitCount; i++) {
                    const spread = Math.min(20, 5 + (i * 5));
                    const angle = (Math.PI * 2 * i) / card.unitCount;
                    
                    teamUnits.push({
                        id: `${team}_${card.id}_${index}_${i}`,
                        templateId: card.templateId,
                        name: cardText.name,
                        team,
                        unitType: stats.unitType,
                        value: unitValue,
                        x: pos.x + Math.cos(angle) * spread, 
                        y: pos.y + Math.sin(angle) * spread,
                        radius,
                        maxHp: finalHp,
                        currentHp: finalHp,
                        baseDamage: finalDmg,
                        damage: finalDmg,
                        range: stats.range,
                        baseCooldown: finalMaxCooldown,
                        cooldown: Math.random() * finalMaxCooldown, 
                        maxCooldown: finalMaxCooldown,
                        moveSpeed: stats.moveSpeed,
                        color: stats.color,
                        targetId: null,
                        aoeRadius: stats.aoeRadius,
                        buffRadius: stats.buffRadius,
                        buffStats: stats.buffStats,
                        currentBuffs: { damage: 0, attackSpeed: 0, range: 0 },
                        animState: 'IDLE',
                        animTimer: 0
                    });
                }
            });
            return teamUnits;
        };

        this.units = [...spawnUnits(playerHand, 'PLAYER'), ...spawnUnits(enemyConfig, 'ENEMY')];
    }

    private getSlotPosition(index: number, team: 'PLAYER' | 'ENEMY') {
        const isPlayer = team === 'PLAYER';
        const baseX = isPlayer ? 200 : 600;
        const baseY = 250;
        
        let offsetX = 0;
        let offsetY = 0;

        if (index === 0) { offsetX = 50; offsetY = 0; }
        else if (index === 1) { offsetX = 50; offsetY = -80; }
        else if (index === 2) { offsetX = 50; offsetY = 80; }
        else if (index === 3) { offsetX = -20; offsetY = -40; }
        else if (index === 4) { offsetX = -20; offsetY = 40; }
        else if (index === 5) { offsetX = -90; offsetY = -60; }
        else if (index === 6) { offsetX = -90; offsetY = 60; }

        return {
            x: baseX + (isPlayer ? offsetX : -offsetX),
            y: baseY + offsetY
        };
    }

    private trackDamage(team: 'PLAYER' | 'ENEMY', unitName: string, amount: number, color: string, unitType: UnitType) {
        const stats = team === 'PLAYER' ? this.playerDamageStats : this.enemyDamageStats;
        if (!stats[unitName]) {
            stats[unitName] = { total: 0, color, unitType };
        }
        stats[unitName].total += amount;
    }

    spawnHitParticles(x: number, y: number, color: string, count: number = 5) {
        for(let i=0; i<count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2 + 0.5;
          this.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: PARTICLE_BASE_LIFE + Math.random() * 10,
            maxLife: PARTICLE_BASE_LIFE + 10,
            color: color,
            size: Math.random() * 2 + 1
          });
        }
    }

    spawnExplosion(x: number, y: number, radius: number, color: string) {
        this.explosions.push({
            x, y, radius, color, life: EXPLOSION_TICKS, maxLife: EXPLOSION_TICKS
        });
    }

    spawnDamageText(x: number, y: number, amount: number) {
        this.floatText.push({
            x: x + (Math.random() * 20 - 10),
            y: y - 15,
            text: amount.toString(),
            color: '#ffffff',
            life: FLOAT_TEXT_TICKS,
            maxLife: FLOAT_TEXT_TICKS,
            vy: -0.8
        });
    }

    shakeScreen: () => void = () => {};

    update() {
        this.battleTime++;

        // 1. Reset Buffs
        this.units.forEach(u => {
            u.currentBuffs = { damage: 0, attackSpeed: 0, range: 0 };
        });

        // 2. Apply Buffs
        this.units.forEach(source => {
            if (source.currentHp > 0 && source.buffRadius && source.buffStats) {
                this.units.forEach(target => {
                    if (target.id !== source.id && target.team === source.team && target.currentHp > 0) {
                        const dx = target.x - source.x;
                        const dy = target.y - source.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist <= source.buffRadius!) {
                            target.currentBuffs.damage += source.buffStats!.damage;
                            target.currentBuffs.attackSpeed += source.buffStats!.attackSpeed;
                            if (source.buffStats!.range) {
                               target.currentBuffs.range += source.buffStats!.range;
                            }
                        }
                    }
                });
            }
        });

        // 3. Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.progress += p.speed;

            if (p.progress >= 1) {
                // Impact
                this.spawnExplosion(p.targetX, p.targetY, p.aoeRadius, p.color);
                this.spawnHitParticles(p.targetX, p.targetY, p.color, 8);
                playSound('hit');
                this.shakeScreen();

                // Deal AOE Damage
                this.units.forEach(u => {
                    if (u.team !== p.team && u.currentHp > 0) {
                        const dx = u.x - p.targetX;
                        const dy = u.y - p.targetY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= p.aoeRadius + u.radius) {
                            const actualDamage = Math.min(u.currentHp, p.damage);
                            u.currentHp -= p.damage;
                            
                            this.trackDamage(p.team, p.sourceName, actualDamage, p.color, p.sourceType);

                            this.spawnDamageText(u.x, u.y, p.damage);
                            u.hitFlashTimer = HIT_FLASH_TICKS;
                            if (u.currentHp <= 0) {
                                this.spawnHitParticles(u.x, u.y, u.color, 15);
                                this.spawnExplosion(u.x, u.y, u.radius * 2, '#ffffff');
                            }
                        }
                    }
                });

                this.projectiles.splice(i, 1);
            } else {
                const distX = p.targetX - p.startX;
                const distY = p.targetY - p.startY;
                const baseX = p.startX + distX * p.progress;
                const baseY = p.startY + distY * p.progress;

                if (p.style === 'MAGIC') {
                    const dist = Math.sqrt(distX * distX + distY * distY);
                    const nx = -distY / (dist || 1);
                    const ny = distX / (dist || 1);
                    const wave = Math.sin(p.progress * Math.PI * MAGIC_WAVE_FREQUENCY) * MAGIC_WAVE_STRENGTH; 
                    p.x = baseX + nx * wave;
                    p.y = baseY + ny * wave;

                    if (Math.random() < 0.3) {
                         this.particles.push({
                            x: p.x, y: p.y,
                            vx: (Math.random() - 0.5), vy: (Math.random() - 0.5),
                            life: 10, maxLife: 10,
                            color: p.color, size: 2
                         });
                    }
                } else {
                    p.x = baseX;
                    p.y = baseY;
                    p.rotation = (p.rotation || 0) + 0.3;
                }
            }
        }

        // 4. Update Units
        this.units.forEach(unit => {
            if (unit.currentHp <= 0) return;

            if (unit.animTimer > 0) {
                unit.animTimer--;
            } else {
                unit.animState = 'IDLE';
            }

            unit.damage = unit.baseDamage + unit.currentBuffs.damage;
            unit.maxCooldown = Math.max(10, unit.baseCooldown / (1 + unit.currentBuffs.attackSpeed));

            if (unit.cooldown > 0) unit.cooldown--;
            if (unit.hitFlashTimer && unit.hitFlashTimer > 0) unit.hitFlashTimer--;

            let target = this.units.find(u => u.id === unit.targetId && u.currentHp > 0);
            
            if (!target) {
              let minDist = Infinity;
              let nearest: CombatUnit | null = null;
              
              this.units.forEach(other => {
                if (other.team !== unit.team && other.currentHp > 0) {
                  const dx = other.x - unit.x;
                  const dy = other.y - unit.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < minDist) {
                    minDist = dist;
                    nearest = other;
                  }
                }
              });
              
              if (nearest) {
                unit.targetId = (nearest as CombatUnit).id;
                target = nearest;
              }
            }

            if (target) {
                const dx = target.x - unit.x;
                const dy = target.y - unit.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= (unit.range + unit.currentBuffs.range) + unit.radius + target.radius) { 
                   unit.lastTargetX = target.x;
                   unit.lastTargetY = target.y;

                   if (unit.cooldown <= 0) {
                     unit.cooldown = unit.maxCooldown;
                     unit.animState = 'ATTACK';
                     unit.animTimer = ATTACK_ANIM_TICKS; 
                     
                     const finalDamage = unit.damage;

                     if (unit.unitType === UnitType.SPLASHER) {
                         const flightFrames = Math.max(PROJECTILE_MIN_FLIGHT_FRAMES, dist / 12); 
                         const speed = 1 / flightFrames;
                         const angle = Math.atan2(target.y - unit.y, target.x - unit.x);

                         this.projectiles.push({
                             x: unit.x, y: unit.y,
                             startX: unit.x, startY: unit.y,
                             targetX: target.x, targetY: target.y,
                             progress: 0,
                             speed: speed,
                             damage: finalDamage,
                             color: unit.color,
                             aoeRadius: unit.aoeRadius || 30,
                             team: unit.team,
                             style: isMagicUnit(unit.templateId, unit.name) ? 'MAGIC' : 'SIEGE',
                             rotation: angle,
                             sourceName: unit.name,
                             sourceType: unit.unitType
                         });
                         
                         playSound('attack_melee');
                     } else {
                         const executeHit = (attacker: CombatUnit, targetUnit: CombatUnit, damage: number, isSplash: boolean) => {
                             const actualDamage = Math.min(targetUnit.currentHp, damage);
                             targetUnit.currentHp -= damage;
                             targetUnit.hitFlashTimer = HIT_FLASH_TICKS;
                             
                             this.trackDamage(attacker.team, attacker.name, actualDamage, attacker.color, attacker.unitType);

                             if (!isSplash) {
                                  const isPlayer = attacker.team === 'PLAYER';
                                  const powerUnit = isPowerUnit(attacker.templateId);

                                  if (attacker.unitType === UnitType.MELEE || attacker.unitType === UnitType.HERO) {
                                      if (attacker.templateId === 'c_centurion' || attacker.unitType === UnitType.HERO) {
                                          this.shakeScreen();
                                      }
                                      this.spawnHitParticles(targetUnit.x, targetUnit.y, attacker.color, 6);
                                  }

                                  if (powerUnit) {
                                      const glowColor = isPlayer ? '#fbbf24' : '#f87171';
                                      const coreColor = '#ffffff';
                                      this.spawnExplosion(attacker.x, attacker.y, 12, glowColor);
                                      this.trails.push({
                                          x1: attacker.x, y1: attacker.y,
                                          x2: targetUnit.x, y2: targetUnit.y,
                                          color: coreColor,
                                          life: 10,
                                          maxLife: 10,
                                          width: 2
                                      });
                                      this.trails.push({
                                          x1: attacker.x, y1: attacker.y,
                                          x2: targetUnit.x, y2: targetUnit.y,
                                          color: glowColor,
                                          life: 15,
                                          maxLife: 15,
                                          width: 6
                                      });
                                  } else if (attacker.unitType === UnitType.RANGED) {
                                      this.trails.push({
                                          x1: attacker.x, y1: attacker.y,
                                          x2: targetUnit.x, y2: targetUnit.y,
                                          color: isPlayer ? '#60a5fa' : '#f87171',
                                          life: 8,
                                          maxLife: 8,
                                          width: 1.5
                                      });
                                  }
                                  
                                  this.spawnHitParticles(targetUnit.x, targetUnit.y, isSplash ? '#fbbf24' : '#fca5a5', 5);
                             }

                             this.spawnDamageText(targetUnit.x, targetUnit.y, damage);
                             
                             if (targetUnit.currentHp <= 0) {
                                 this.spawnHitParticles(targetUnit.x, targetUnit.y, targetUnit.color, 15);
                                 this.spawnExplosion(targetUnit.x, targetUnit.y, targetUnit.radius * 2, '#ffffff');
                                 this.shakeScreen();
                             }
                         };
                         
                         const powerUnit = isPowerUnit(unit.templateId);

                         if (powerUnit) {
                             playSound('power_shot'); 
                         } else {
                             if (unit.unitType === UnitType.RANGED) {
                                 playSound('attack_bow'); 
                             } else {
                                 playSound('attack_melee');
                             }
                         }

                         if (unit.aoeRadius && unit.aoeRadius > 0) {
                             this.spawnExplosion(target.x, target.y, unit.aoeRadius, unit.color);
                             this.units.forEach(u => {
                                 if (u.team !== unit.team && u.currentHp > 0) {
                                     const ex = u.x - target!.x;
                                     const ey = u.y - target!.y;
                                     const eDist = Math.sqrt(ex*ex + ey*ey);
                                     if (eDist <= (unit.aoeRadius! + u.radius)) {
                                         executeHit(unit, u, finalDamage, u.id !== target!.id);
                                     }
                                 }
                             });
                         } else {
                             executeHit(unit, target, finalDamage, false);
                         }
                     }
                   }
                } else {
                   const angle = Math.atan2(dy, dx);
                   unit.x += Math.cos(angle) * unit.moveSpeed;
                   unit.y += Math.sin(angle) * unit.moveSpeed;
                   
                   unit.lastTargetX = unit.x + Math.cos(angle) * 10;
                   unit.lastTargetY = unit.y + Math.sin(angle) * 10;

                   if (unit.animTimer === 0) {
                       unit.animState = 'MOVE';
                   }
                }
            }
        });

        // 5. Collision Resolution
        for(let i=0; i<this.units.length; i++) {
            const u1 = this.units[i];
            if(u1.currentHp <= 0) continue;

            u1.x = Math.max(u1.radius, Math.min(this.canvasWidth - u1.radius, u1.x));
            u1.y = Math.max(u1.radius, Math.min(this.canvasHeight - u1.radius, u1.y));

            for(let j=i+1; j<this.units.length; j++) {
                const u2 = this.units[j];
                if(u2.currentHp <= 0) continue;

                const dx = u2.x - u1.x;
                const dy = u2.y - u1.y;
                const distSq = dx*dx + dy*dy;
                const minDist = u1.radius + u2.radius;

                if (distSq < minDist * minDist) {
                    const dist = Math.sqrt(distSq);
                    let nx = 0, ny = 0;

                    if (dist === 0) {
                        const angle = Math.random() * Math.PI * 2;
                        nx = Math.cos(angle);
                        ny = Math.sin(angle);
                    } else {
                        nx = dx / dist;
                        ny = dy / dist;
                    }

                    const overlap = minDist - dist;
                    const strength = 0.5; 
                    
                    u1.x -= nx * overlap * strength;
                    u1.y -= ny * overlap * strength;
                    u2.x += nx * overlap * strength;
                    u2.y += ny * overlap * strength;
                }
            }
        }

        // 6. Update Visuals
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const e = this.explosions[i];
            e.life--;
            if (e.life <= 0) this.explosions.splice(i, 1);
        }

        for (let i = this.floatText.length - 1; i >= 0; i--) {
            const t = this.floatText[i];
            t.y += t.vy;
            t.life--;
            if (t.life <= 0) this.floatText.splice(i, 1);
        }
        
         for (let i = this.trails.length - 1; i >= 0; i--) {
            const t = this.trails[i];
            t.life--;
            if (t.life <= 0) this.trails.splice(i, 1);
        }
    }
}
