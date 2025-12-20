
import { UnitType } from '../types';
import { BattleEngine } from './BattleEngine';
import { isPowerUnit } from './unitHelpers';

export class BattleRenderer {
    static render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, engine: BattleEngine) {
        const { units, projectiles, battleTime, explosions, trails, particles, floatText } = engine;

        // 1. Draw Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const gridTime = battleTime * 0.5;
        ctx.save();
        
        // Grid Lines
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const gridSize = 50;
        
        const offset = gridTime % gridSize;
        
        for(let i=0; i<canvas.width; i+=gridSize) { 
            ctx.moveTo(i,0); ctx.lineTo(i, canvas.height); 
        }
        for(let i=0; i<canvas.height; i+=gridSize) { 
            ctx.moveTo(0, i + offset - gridSize); 
            ctx.lineTo(canvas.width, i + offset - gridSize); 
        }
        ctx.stroke();
        ctx.restore();

        // 2. Draw Explosions
        explosions.forEach(e => {
            ctx.save();
            ctx.globalAlpha = e.life / e.maxLife;
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            ctx.fill();
            // Simple ring
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius * (1.5 - (e.life/e.maxLife)*0.5), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });

        // 3. Draw Projectiles
        projectiles.forEach(p => {
            if (p.style === 'MAGIC') {
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(p.x, p.y + 5, 4, 2, 0, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(p.x, p.y + 8, 6, 3, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation || 0);
                
                ctx.fillStyle = '#64748b'; 
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 1;
                
                const size = 12;
                ctx.fillRect(-size/2, -size/2, size, size);
                ctx.strokeRect(-size/2, -size/2, size, size);
                
                ctx.restore();
            }
        });

        // 4. Draw Units
        units.forEach(unit => {
            if (unit.currentHp <= 0) return;

            ctx.save();
            ctx.translate(unit.x, unit.y);

            let offsetX = 0;
            let offsetY = 0;
            let rotation = 0;

            if (unit.lastTargetX !== undefined && unit.lastTargetY !== undefined) {
                 rotation = Math.atan2(unit.lastTargetY - unit.y, unit.lastTargetX - unit.x);
            }

            if (unit.animState === 'ATTACK' && unit.animTimer > 0) {
                let recoil = 0;
                if (unit.unitType === UnitType.RANGED || unit.unitType === UnitType.SPLASHER) {
                    const progress = unit.animTimer / 15;
                    const powerUnit = isPowerUnit(unit.templateId);
                        
                    const force = powerUnit ? 8 : 4;
                    recoil = -force * Math.sin(progress * Math.PI); 
                } else {
                    // Snappier Melee Lunge
                    const progress = 1 - (unit.animTimer / 15);
                    // Fast lunge out (0-0.3), slower pull back
                    let punch = 0;
                    if (progress < 0.3) {
                        punch = (progress / 0.3);
                    } else {
                        punch = 1 - ((progress - 0.3) / 0.7);
                    }
                    recoil = (unit.templateId === 'c_centurion' || unit.unitType === UnitType.HERO) ? 18 * punch : 12 * punch;
                }
                
                offsetX = Math.cos(rotation) * recoil;
                offsetY = Math.sin(rotation) * recoil;
            } 
            
            ctx.translate(offsetX, offsetY);
            ctx.rotate(rotation);
            
            if (unit.hitFlashTimer && unit.hitFlashTimer > 0) {
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#ffffff';
            } else {
                ctx.fillStyle = unit.team === 'PLAYER' ? unit.color : unit.unitType === UnitType.HERO ? '#7f1d1d' : '#ef4444'; 
                ctx.strokeStyle = unit.team === 'PLAYER' ? '#bae6fd' : '#fca5a5';
            }
            
            ctx.lineWidth = 2;

            ctx.beginPath();
            if (unit.unitType === UnitType.HERO) {
                const sides = 8;
                for (let i = 0; i < sides; i++) {
                    const theta = (i / sides) * Math.PI * 2;
                    const r = unit.radius;
                    const px = Math.cos(theta) * r;
                    const py = Math.sin(theta) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (unit.unitType === UnitType.BUFFER) {
                const sides = 6;
                for (let i = 0; i < sides; i++) {
                    const theta = (i / sides) * Math.PI * 2;
                    const r = unit.radius;
                    const px = Math.cos(theta) * r;
                    const py = Math.sin(theta) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (unit.unitType === UnitType.RANGED) {
                ctx.moveTo(unit.radius, 0);
                ctx.lineTo(-unit.radius * 0.6, unit.radius * 0.7);
                ctx.lineTo(-unit.radius * 0.3, 0); 
                ctx.lineTo(-unit.radius * 0.6, -unit.radius * 0.7);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (unit.unitType === UnitType.SPLASHER) {
                ctx.moveTo(unit.radius, 0);
                ctx.lineTo(0, unit.radius * 0.8);
                ctx.lineTo(-unit.radius, 0);
                ctx.lineTo(0, -unit.radius * 0.8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else {
                // Default / Melee
                ctx.arc(0, 0, unit.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Specific Template Decorations
                if (unit.templateId === 'c_shielder') {
                    // Shield Arc in front
                    ctx.save();
                    ctx.rotate(0); // Already rotated to target
                    ctx.strokeStyle = '#0ea5e9'; // Blue-500
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(0, 0, unit.radius + 3, -0.8, 0.8);
                    ctx.stroke();
                    ctx.restore();
                } else if (unit.templateId === 'c_centurion') {
                    // Armor Plating details
                    ctx.save();
                    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                    ctx.lineWidth = 1;
                    // Cross plating
                    ctx.beginPath();
                    ctx.moveTo(-unit.radius * 0.6, -unit.radius * 0.6);
                    ctx.lineTo(unit.radius * 0.6, unit.radius * 0.6);
                    ctx.moveTo(unit.radius * 0.6, -unit.radius * 0.6);
                    ctx.lineTo(-unit.radius * 0.6, unit.radius * 0.6);
                    ctx.stroke();
                    // Inner ring
                    ctx.beginPath();
                    ctx.arc(0, 0, unit.radius * 0.5, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
            }

            if (unit.buffRadius && unit.buffRadius > 0) {
                ctx.save();
                ctx.rotate(-rotation);
                ctx.strokeStyle = unit.team === 'PLAYER' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)';
                ctx.fillStyle = unit.team === 'PLAYER' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, unit.buffRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            if (unit.currentBuffs.damage > 0 || unit.currentBuffs.attackSpeed > 0 || unit.currentBuffs.range > 0) {
                 ctx.save();
                 ctx.rotate(-rotation); 
                 ctx.rotate(battleTime * 0.05);
                 ctx.strokeStyle = '#fbbf24'; 
                 ctx.lineWidth = 1.5;
                 ctx.setLineDash([3, 6]);
                 ctx.beginPath();
                 ctx.arc(0, 0, unit.radius + 6, 0, Math.PI * 2);
                 ctx.stroke();
                 ctx.restore();
            }

            ctx.restore();

            const barW = unit.unitType === UnitType.HERO ? 60 : 22; 
            const barH = unit.unitType === UnitType.HERO ? 5 : 3;
            const barX = unit.x - barW / 2;
            const barY = unit.y - unit.radius - 12;

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(barX, barY, barW, barH);
            
            const hpPercent = unit.currentHp / unit.maxHp;
            const hpColor = hpPercent > 0.6 ? '#22c55e' : hpPercent > 0.3 ? '#eab308' : '#ef4444';
            
            ctx.fillStyle = hpColor;
            ctx.fillRect(barX, barY, barW * hpPercent, barH);
            
            if (unit.unitType === UnitType.HERO) {
                 ctx.fillStyle = '#ef4444';
                 ctx.font = 'bold 11px sans-serif';
                 ctx.textAlign = 'center';
                 ctx.fillText(unit.name, unit.x, barY - 4);
            }
        });

        // 5. Draw Trails
        ctx.globalCompositeOperation = 'lighter'; 
        trails.forEach(t => {
            ctx.save();
            ctx.globalAlpha = t.life / t.maxLife;
            ctx.strokeStyle = t.color;
            ctx.lineWidth = t.width;
            ctx.beginPath();
            ctx.moveTo(t.x1, t.y1);
            ctx.lineTo(t.x2, t.y2);
            ctx.stroke();
            ctx.restore();
        });
        ctx.globalCompositeOperation = 'source-over';

        // 6. Draw Particles
        particles.forEach(p => {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;

        // 7. Draw Floating Text
        ctx.textAlign = "center";
        ctx.font = "bold 13px monospace";
        floatText.forEach(t => {
            ctx.save();
            const lifePercent = t.life / t.maxLife;
            ctx.globalAlpha = lifePercent;
            ctx.translate(t.x, t.y);
            const scale = 1 + (1 - lifePercent) * 0.5;
            ctx.scale(scale, scale);
            
            ctx.fillStyle = t.color; 
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';
            ctx.strokeText(t.text, 0, 0);
            ctx.fillText(t.text, 0, 0);
            ctx.restore();
        });
        ctx.globalAlpha = 1;
    }
}
