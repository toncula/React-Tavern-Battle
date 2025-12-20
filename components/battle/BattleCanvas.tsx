
import React, { useRef, useEffect, useState } from 'react';
import { CardData, UnitType } from '../../types';
import { Language, getTranslation } from '../../translations';
import { playSound } from '../../services/audioService';
import { FastForward, Play, ChevronsRight, BarChart2, Pause } from 'lucide-react';
import { BattleEngine, DamageTracker } from '../../simulation/BattleEngine';
import { BattleRenderer } from '../../simulation/BattleRenderer';
import { FIXED_STEP, ENDING_PHASE_DELAY } from '../../constants';

interface BattleCanvasProps {
  playerHand: (CardData | null)[];
  enemyConfig: CardData[]; 
  playerValue: number;
  enemyValue: number;
  language: Language;
  onBattleEnd: (winner: 'PLAYER' | 'ENEMY') => void;
  phase?: string;
}

const UnitIcon: React.FC<{ type: UnitType; color: string; size?: number }> = ({ type, color, size = 12 }) => {
    switch (type) {
        case UnitType.MELEE:
            return (
                <svg width={size} height={size} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill={color} stroke="white" strokeWidth="2" />
                </svg>
            );
        case UnitType.RANGED:
            return (
                <svg width={size} height={size} viewBox="0 0 24 24">
                    <path d="M12 2 L22 20 L2 20 Z" fill={color} stroke="white" strokeWidth="2" />
                </svg>
            );
        case UnitType.BUFFER:
            return (
                <svg width={size} height={size} viewBox="0 0 24 24">
                    <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" fill={color} stroke="white" strokeWidth="2" />
                </svg>
            );
        case UnitType.SPLASHER:
            return (
                <svg width={size} height={size} viewBox="0 0 24 24">
                    <path d="M12 2 L22 12 L12 22 L2 12 Z" fill={color} stroke="white" strokeWidth="2" />
                </svg>
            );
        case UnitType.HERO:
            return (
                <svg width={size} height={size} viewBox="0 0 24 24">
                    <path d="M12 2 L19 5 L22 12 L19 19 L12 22 L5 19 L2 12 L5 5 Z" fill={color} stroke="white" strokeWidth="2" />
                </svg>
            );
        default:
            return null;
    }
};

const DamageStatsPanel: React.FC<{ stats: DamageTracker; title: string; align: 'left' | 'right'; language: Language }> = ({ stats, title, align, language }) => {
    const t = getTranslation(language);
    // Fix: Explicitly type the entries of DamageTracker to ensure TS recognizes properties like 'total', 'unitType', and 'color'
    const statsEntries = Object.entries(stats) as [string, DamageTracker[string]][];
    const sortedStats = statsEntries.sort((a, b) => b[1].total - a[1].total);
    const totalTeamDamage = sortedStats.reduce((acc, [_, data]) => acc + data.total, 0);

    return (
        <div className={`absolute top-20 ${align === 'left' ? 'left-4' : 'right-4'} w-44 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700 p-3 flex flex-col gap-2 z-20 shadow-2xl animate-in fade-in slide-in-from-${align}-4 duration-500`}>
            <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
                <div className="flex items-center gap-2">
                    <BarChart2 size={14} className={align === 'left' ? 'text-blue-400' : 'text-red-400'} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">{title}</span>
                </div>
            </div>
            
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto scrollbar-none pr-1">
                {sortedStats.map(([name, data]) => (
                    <div key={name} className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                            <div className="flex items-center gap-1.5 truncate max-w-[90px]">
                                <UnitIcon type={data.unitType} color={data.color} size={10} />
                                <span className="truncate">{name}</span>
                            </div>
                            <span className="text-slate-200">{Math.floor(data.total)}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full transition-all duration-300 ease-out"
                                style={{ 
                                    width: `${totalTeamDamage > 0 ? (data.total / totalTeamDamage) * 100 : 0}%`,
                                    backgroundColor: data.color,
                                    boxShadow: `0 0 4px ${data.color}80`
                                }}
                            />
                        </div>
                    </div>
                ))}
                
                {sortedStats.length === 0 && (
                    <div className="text-[9px] text-slate-600 italic text-center py-4">{t.ui.no_damage}</div>
                )}
            </div>

            {sortedStats.length > 0 && (
                <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-slate-500">{t.ui.total}</span>
                    <span className="text-[10px] font-bold text-slate-100">{Math.floor(totalTeamDamage)}</span>
                </div>
            )}
        </div>
    );
};

const BattleCanvas: React.FC<BattleCanvasProps> = ({ playerHand, enemyConfig, playerValue, enemyValue, language, onBattleEnd, phase }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  
  const playerBarRef = useRef<HTMLDivElement>(null);
  const enemyBarRef = useRef<HTMLDivElement>(null);
  const playerValTextRef = useRef<HTMLSpanElement>(null);
  const enemyValTextRef = useRef<HTMLSpanElement>(null);

  const engineRef = useRef<BattleEngine>(new BattleEngine());

  const [playerDamage, setPlayerDamage] = useState<DamageTracker>({});
  const [enemyDamage, setEnemyDamage] = useState<DamageTracker>({});

  const [timeScale, setTimeScale] = useState<0 | 1 | 2 | 4>(1);
  const timeScaleRef = useRef<number>(1); 
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  const t = getTranslation(language);

  useEffect(() => {
    timeScaleRef.current = timeScale;
  }, [timeScale]);

  useEffect(() => {
    if (phase && phase !== 'COMBAT') return;
    
    playSound('start_battle');
    const engine = engineRef.current;
    
    engine.shakeScreen = () => {
         if (canvasRef.current) {
            canvasRef.current.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
            setTimeout(() => {
                if (canvasRef.current) canvasRef.current.style.transform = 'none';
            }, 50);
        }
    };

    engine.init(playerHand, enemyConfig, language);
    setPlayerDamage({});
    setEnemyDamage({});
    
    lastTimeRef.current = performance.now();
    accumulatorRef.current = 0;
    setTimeScale(1);

  }, [playerHand, enemyConfig, phase, language]);

  const updateUI = () => {
      const engine = engineRef.current;
      let currentPVal = 0;
      let currentEVal = 0;
      
      engine.units.forEach(u => {
          if (u.currentHp > 0) {
              if (u.team === 'PLAYER') currentPVal += u.value;
              else currentEVal += u.value;
          }
      });
      
      if (playerValTextRef.current) playerValTextRef.current.innerText = Math.floor(currentPVal).toString();
      if (enemyValTextRef.current) enemyValTextRef.current.innerText = Math.floor(currentEVal).toString();

      const totalVal = currentPVal + currentEVal;
      let pct = 50;
      if (totalVal > 0) {
          pct = (currentPVal / totalVal) * 100;
      } else if (currentPVal === 0 && currentEVal > 0) {
          pct = 0;
      } else if (currentPVal > 0 && currentEVal === 0) {
          pct = 100;
      }
      
      if (playerBarRef.current) playerBarRef.current.style.width = `${pct}%`;
      if (enemyBarRef.current) enemyBarRef.current.style.width = `${100 - pct}%`;

      if (engine.battleTime % 10 === 0) {
        setPlayerDamage({...engine.playerDamageStats});
        setEnemyDamage({...engine.enemyDamageStats});
      }

      const playerAlive = engine.units.some(u => u.team === 'PLAYER' && u.currentHp > 0);
      const enemyAlive = engine.units.some(u => u.team === 'ENEMY' && u.currentHp > 0);
      const isGameOver = !playerAlive || !enemyAlive;

      if (isGameOver) {
        if (engine.battleTime > 60) {
           if (!engine.isEnding) {
               engine.isEnding = true;
               engine.endingDelay = ENDING_PHASE_DELAY; 
               if (playerAlive) playSound('victory');
               else playSound('defeat');
           }
        }
      }

      if (engine.endingDelay > 0) {
          engine.endingDelay--;
          if (engine.endingDelay <= 0) {
              onBattleEnd(playerAlive ? 'PLAYER' : 'ENEMY');
          }
      }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (timestamp: number) => {
      const dt = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const safeDt = Math.min(dt, 100); 
      accumulatorRef.current += safeDt * timeScaleRef.current;

      const engine = engineRef.current;

      while (accumulatorRef.current >= FIXED_STEP) {
          engine.update();
          updateUI();
          accumulatorRef.current -= FIXED_STEP;
      }

      BattleRenderer.render(ctx, canvas, engine);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []); 

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl ring-1 ring-slate-800 group">
      <div className="absolute top-0 left-0 w-full h-2 z-10 flex">
          <div 
            ref={playerBarRef}
            className="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_0_10px_#3b82f6]" 
            style={{ width: '50%' }}
          />
          <div 
            ref={enemyBarRef}
            className="h-full bg-red-600 transition-all duration-300 ease-out shadow-[0_0_10px_#dc2626]" 
            style={{ width: '50%' }}
          />
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-slate-900/80 px-4 py-1.5 rounded-b-lg border-x border-b border-slate-700 backdrop-blur-sm flex items-center gap-4 text-xs font-bold font-mono shadow-xl">
           <div className="text-blue-400 flex items-center gap-1">
               <span ref={playerValTextRef} className="text-blue-200 text-lg">{playerValue}</span>
           </div>
           <div className="text-slate-500">VS</div>
           <div className="text-red-400 flex items-center gap-1">
               <span ref={enemyValTextRef} className="text-red-200 text-lg">{enemyValue}</span>
           </div>
      </div>

      <DamageStatsPanel stats={playerDamage} title={t.ui.player_damage} align="left" language={language} />
      <DamageStatsPanel stats={enemyDamage} title={t.ui.enemy_damage} align="right" language={language} />

      <canvas 
        ref={canvasRef} 
        width={800} 
        height={500} 
        className="w-full h-full object-contain"
      />
      
      <div className="absolute top-4 right-4 bg-black/70 px-4 py-1.5 rounded-full text-blue-200 font-mono text-xs border border-blue-500/30 backdrop-blur-md pointer-events-none z-10 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
         <span className={`w-2 h-2 inline-block rounded-full ${timeScale === 0 ? 'bg-yellow-500' : 'bg-blue-500'} mr-2 ${timeScale > 0 ? 'animate-pulse' : ''} shadow-[0_0_5px_#3b82f6]`}></span>
         {timeScale === 0 ? t.ui.pause : t.ui.rts_active}
      </div>

      <div className="absolute top-4 left-4 flex gap-1 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700 backdrop-blur-sm shadow-lg z-10 transition-opacity opacity-70 hover:opacity-100">
          <button 
            onClick={() => setTimeScale(0)}
            className={`p-2 rounded transition-all ${timeScale === 0 ? 'bg-yellow-600 text-white shadow shadow-yellow-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            title={t.ui.pause}
          >
              <Pause size={16} fill="currentColor" />
          </button>
          <button 
            onClick={() => setTimeScale(1)}
            className={`p-2 rounded transition-all ${timeScale === 1 ? 'bg-blue-600 text-white shadow shadow-blue-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            title="Normal Speed"
          >
              <Play size={16} fill="currentColor" />
          </button>
          <button 
            onClick={() => setTimeScale(2)}
            className={`p-2 rounded transition-all ${timeScale === 2 ? 'bg-blue-600 text-white shadow shadow-blue-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            title="2x Speed"
          >
              <ChevronsRight size={16} />
          </button>
          <button 
            onClick={() => setTimeScale(4)}
            className={`p-2 rounded transition-all ${timeScale === 4 ? 'bg-blue-600 text-white shadow shadow-blue-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            title="4x Speed"
          >
              <FastForward size={16} fill="currentColor" />
          </button>
      </div>
    </div>
  );
};

export default BattleCanvas;
