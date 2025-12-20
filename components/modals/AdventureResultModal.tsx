
import React from 'react';
import { CardData, AdventureOption, Rarity } from '../../types';
import { Sword, Shield, Compass, CheckCircle, TrendingUp, TrendingDown, RefreshCw, Sparkles, Zap, ArrowRight, Star } from 'lucide-react';
import { Language, getTranslation } from '../../translations';

interface AdventureResultModalProps {
  card: CardData;
  option: AdventureOption;
  rarity: Rarity;
  language: Language;
  onConfirm: () => void;
}

const AdventureResultModal: React.FC<AdventureResultModalProps> = ({ 
    card, option, rarity, language, onConfirm 
}) => {
  const t = getTranslation(language);
  
  const getRarityStyles = () => {
    switch(rarity) {
        case 'LEGENDARY': return {
            border: 'border-amber-500',
            bg: 'bg-slate-900',
            glow: 'shadow-[0_0_60px_rgba(245,158,11,0.2)]',
            text: 'text-amber-400',
            iconBg: 'bg-amber-500',
            btn: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500'
        };
        case 'RARE': return {
            border: 'border-blue-500',
            bg: 'bg-slate-900',
            glow: 'shadow-[0_0_60px_rgba(59,130,246,0.2)]',
            text: 'text-blue-400',
            iconBg: 'bg-blue-500',
            btn: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
        };
        default: return {
            border: 'border-slate-500',
            bg: 'bg-slate-900',
            glow: 'shadow-[0_0_60px_rgba(148,163,184,0.1)]',
            text: 'text-slate-300',
            iconBg: 'bg-slate-500',
            btn: 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500'
        };
    }
  };
  const styles = getRarityStyles();

  const calculateDelta = (current: number, next: number, inverse: boolean = false) => {
      const diff = next - current;
      if (diff === 0) return null;
      
      const isPositive = inverse ? diff < 0 : diff > 0;
      
      return (
          <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${isPositive ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
              {isPositive ? <TrendingUp size={10} className="mr-1"/> : <TrendingDown size={10} className="mr-1"/>}
              {diff > 0 ? '+' : ''}{diff}
          </div>
      );
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[110] flex items-center justify-center p-4 backdrop-blur-xl">
      <div className={`${styles.bg} border-2 ${styles.border} rounded-3xl max-w-lg w-full p-0 shadow-2xl relative animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 overflow-hidden ${styles.glow}`}>
        
        {/* Header Section */}
        <div className="relative p-8 pb-12 flex flex-col items-center text-center">
            <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-${rarity === 'LEGENDARY' ? 'amber' : rarity === 'RARE' ? 'blue' : 'slate'}-900/40 to-transparent pointer-events-none`} />
            
            <div className={`relative z-10 w-20 h-20 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-xl mb-4 ${styles.iconBg} text-white`}>
                {option.outcomeType === 'PROMOTION' ? (
                    <RefreshCw className="w-10 h-10 animate-spin-slow" />
                ) : (
                    <CheckCircle className="w-10 h-10" />
                )}
            </div>

            <h2 className="relative z-10 text-3xl font-black text-white uppercase tracking-tighter mb-2">
                {option.outcomeType === 'PROMOTION' 
                    ? t.adventure.unit_ascended
                    : t.adventure.adventure_complete
                }
            </h2>
            
            <div className={`relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/50 border border-white/10 text-[10px] font-bold uppercase tracking-widest ${styles.text}`}>
                <Compass size={12} /> {option.traitName}
            </div>
        </div>

        {/* Content Body */}
        <div className="px-8 pb-8 space-y-6">
            
            {/* Story Box */}
            <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl relative shadow-inner">
                 <Sparkles className={`absolute top-3 right-3 w-4 h-4 opacity-30 ${styles.text}`} />
                 <p className="text-slate-200 text-lg leading-relaxed italic font-serif text-center">
                    "{option.resultFlavor}"
                </p>
            </div>

            {/* Promotion UI */}
            {option.outcomeType === 'PROMOTION' && option.promotionUnit && (
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
                    <div className="relative z-10 w-14 h-14 rounded-full border-2 border-amber-400 bg-slate-900 flex items-center justify-center shadow-lg">
                        <Star className="text-amber-400 w-8 h-8 fill-amber-400 animate-pulse" />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-0.5">{t.adventure.legendary_form}</div>
                        <div className="text-xl font-black text-white">{option.promotionUnit.name}</div>
                        <div className="text-xs text-amber-200/60 line-clamp-1">{option.promotionUnit.description}</div>
                    </div>
                </div>
            )}

            {/* Stats UI - NOW HANDLES PROMOTION TOO */}
            {((option.outcomeType === 'CHANGE' && option.statChange) || (option.outcomeType === 'PROMOTION' && option.promotionUnit)) && (
                (() => {
                    const nextHp = option.outcomeType === 'CHANGE' ? option.statChange!.hp : option.promotionUnit!.baseStats.hp;
                    const nextDmg = option.outcomeType === 'CHANGE' ? option.statChange!.damage : option.promotionUnit!.baseStats.damage;
                    const nextCd = option.outcomeType === 'CHANGE' ? option.statChange!.attackCooldown : option.promotionUnit!.baseStats.attackCooldown;

                    return (
                        <div className="grid grid-cols-3 gap-3">
                            {/* Damage */}
                            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
                                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                                    <Sword size={12} /> {t.ui.damage}
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-black text-white">{nextDmg}</span>
                                    {calculateDelta(card.baseStats.damage, nextDmg)}
                                </div>
                            </div>
                            {/* HP */}
                            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
                                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                                    <Shield size={12} /> {t.ui.hp}
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-black text-white">{nextHp}</span>
                                    {calculateDelta(card.baseStats.hp, nextHp)}
                                </div>
                            </div>
                            {/* Speed */}
                            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
                                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                                    <Zap size={12} /> Speed
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-black text-white">{(nextCd / 60).toFixed(1)}s</span>
                                    {calculateDelta(card.baseStats.attackCooldown, nextCd, true)}
                                </div>
                            </div>
                        </div>
                    );
                })()
            )}

            {/* Action Button */}
            <button
                onClick={onConfirm}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] border border-white/10 flex items-center justify-center gap-2 group text-white ${styles.btn}`}
            >
                <span>{t.adventure.continue_journey}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdventureResultModal;
