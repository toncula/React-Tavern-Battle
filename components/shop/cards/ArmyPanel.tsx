
import React, { useState, useEffect } from 'react';
import { PlayerState, CardData } from '../../../types';
import { Language } from '../../../translations';
import { GripHorizontal, BarChart3, Plus, Coins } from 'lucide-react';
import UnitCard from './UnitCard';
import { SOLD_EFFECT_CLEANUP_DELAY } from '../../../constants';

interface ArmyPanelProps {
  player: PlayerState;
  playerArmyValue: number;
  unitCount: number;
  language: Language;
  t: any;
  UPGRADE_COST: number;
  isTransitioning: boolean;
  nextEmptySlotIndex: number;
  onSellCard: (card: CardData) => void;
  onRequestUpgrade: (card: CardData) => void;
  onCardHover: (card: CardData, rect: DOMRect) => void;
  onCardLeave: () => void;
}

const ArmyPanel: React.FC<ArmyPanelProps> = ({ 
    player, playerArmyValue, unitCount, language, t, UPGRADE_COST, isTransitioning, nextEmptySlotIndex,
    onSellCard, onRequestUpgrade, onCardHover, onCardLeave 
}) => {
  const [soldEffects, setSoldEffects] = useState<{index: number, id: number}[]>([]);

  // Cleanup sold effects using centralized delay
  useEffect(() => {
    if (soldEffects.length > 0) {
        const timer = setTimeout(() => {
            setSoldEffects(prev => prev.slice(1)); 
        }, SOLD_EFFECT_CLEANUP_DELAY);
        return () => clearTimeout(timer);
    }
  }, [soldEffects]);

  const handleSellClick = (card: CardData, index: number) => {
    // Add visual effect
    setSoldEffects(prev => [...prev, { index, id: Date.now() }]);
    // Propagate action
    onSellCard(card);
  };

  return (
    <div className="h-[340px] shrink-0 bg-[#0b0f19] border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 flex flex-col relative">
        <div className="px-6 py-2 bg-slate-900/80 border-b border-slate-800/50 flex items-center justify-between shrink-0">
            <h2 className="text-slate-400 font-bold flex items-center gap-3 text-sm uppercase tracking-widest">
                <GripHorizontal size={16} className="text-slate-600" />
                {t.ui.your_army} 
                <span className={`text-xs px-2 py-0.5 rounded font-mono ${unitCount >= 7 ? 'bg-red-900/50 text-red-200 border border-red-900' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                    {unitCount}/7
                </span>
            </h2>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wide bg-slate-950 px-3 py-1 rounded border border-slate-800">
                <BarChart3 size={12} className="text-blue-500"/>
                {t.ui.army_value}: <span className="text-blue-200 text-sm">{playerArmyValue}</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center px-6 gap-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <div className="flex gap-4 mx-auto py-4">
                {player.hand.map((card, index) => {
                    const isNextSlot = index === nextEmptySlotIndex;
                    const soldEffect = soldEffects.find(s => s.index === index);
                    
                    const borderStyle = !card 
                        ? (isNextSlot 
                            ? 'border-2 border-yellow-500/50 bg-yellow-900/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                            : 'border-2 border-white/5 bg-white/5 border-dashed')
                        : ''; 

                    return (
                        <div 
                            key={index}
                            className={`w-48 h-64 rounded-xl flex items-center justify-center relative transition-all group shrink-0 ${borderStyle}`}
                        >
                            {!card && !soldEffect && (
                                <div className={`absolute inset-0 flex flex-col items-center justify-center font-bold text-[10px] pointer-events-none gap-2 transition-opacity ${isNextSlot ? 'text-yellow-500/80 animate-pulse' : 'text-slate-700'}`}>
                                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${isNextSlot ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-slate-800'}`}>
                                        <Plus size={20}/>
                                    </div>
                                    {isNextSlot ? 'DEPLOY HERE' : ''}
                                </div>
                            )}

                            {/* SOLD VISUAL EFFECT */}
                            {!card && soldEffect && (
                                <div key={soldEffect.id} className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
                                    <div className="absolute inset-0 bg-yellow-500/10 animate-pulse rounded-xl" />
                                    {/* Coins icon rising */}
                                    <div className="flex items-center gap-1 text-yellow-400 font-bold text-2xl animate-[uc-pop-up_0.6s_ease-out_forwards]" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
                                        +1 <Coins size={24} fill="currentColor" />
                                    </div>
                                    {/* Dust */}
                                    {Array.from({length: 8}).map((_, i) => (
                                        <div key={i} className="absolute w-2 h-2 bg-slate-500/50 rounded-full animate-[uc-particle_0.6s_ease-out_forwards]"
                                            style={{
                                                top: '50%', left: '50%',
                                                '--tx': `${(Math.random()-0.5)*100}px`,
                                                '--ty': `${(Math.random()-0.5)*100}px`,
                                            } as React.CSSProperties}
                                        />
                                    ))}
                                </div>
                            )}

                            {card && (
                                <UnitCard 
                                    card={card} 
                                    location="HAND" 
                                    language={language}
                                    canUpgrade={player.adventurePoints >= UPGRADE_COST && !isTransitioning && card.traits.length < 3}
                                    onSell={(c) => handleSellClick(c, index)}
                                    onUpgradeRequest={onRequestUpgrade}
                                    onHover={onCardHover}
                                    onLeave={onCardLeave}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default ArmyPanel;
