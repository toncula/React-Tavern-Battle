
import React, { useState, useEffect } from 'react';
import { CardData, AdventureOption, Rarity, Mood, OracleOmen } from '../../types';
import { Sparkles, Loader2, Compass, ChevronRight, XCircle, BrainCircuit, Zap, Eye, Ghost, ArrowRight, Skull, Star, Flame, CloudRain, Quote, Dna, BookOpen, Crown } from 'lucide-react';
import { Language, getTranslation, getCardText } from '../../translations';

interface AdventureModalProps {
  card: CardData;
  event: string;
  options: AdventureOption[];
  rarity: Rarity;
  loading: boolean;
  language: Language;
  onSelect: (option: AdventureOption) => void;
  onCancel: () => void;
  onConsult: () => void;
  onProceed: () => void;
  consulting: boolean;
  omen: OracleOmen | null;
}

const AdventureModal: React.FC<AdventureModalProps> = ({ 
    card, event, options, rarity, loading, language, onSelect, onCancel, onConsult, onProceed, consulting, omen 
}) => {
  const t = getTranslation(language);
  const cardText = getCardText(card, language);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [typedOmen, setTypedOmen] = useState("");

  const getRarityConfig = () => {
      switch(rarity) {
          case 'LEGENDARY': return {
              border: 'border-amber-500/50',
              text: 'text-amber-400',
              bgGradient: 'from-amber-950/40 via-slate-900 to-slate-950',
              glow: 'shadow-[0_0_100px_rgba(245,158,11,0.15)]',
              iconColor: 'text-amber-500',
              buttonBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
              buttonShadow: 'shadow-amber-900/40',
              accent: 'bg-amber-500'
          };
          case 'RARE': return {
              border: 'border-blue-500/50',
              text: 'text-blue-400',
              bgGradient: 'from-blue-950/40 via-slate-900 to-slate-950',
              glow: 'shadow-[0_0_100px_rgba(59,130,246,0.15)]',
              iconColor: 'text-blue-500',
              buttonBg: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500',
              buttonShadow: 'shadow-blue-900/40',
              accent: 'bg-blue-500'
          };
          default: return {
              border: 'border-slate-600/50',
              text: 'text-slate-300',
              bgGradient: 'from-slate-800/40 via-slate-900 to-slate-950',
              glow: 'shadow-[0_0_100px_rgba(148,163,184,0.1)]',
              iconColor: 'text-slate-400',
              buttonBg: 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500',
              buttonShadow: 'shadow-slate-900/40',
              accent: 'bg-slate-500'
          };
      }
  };
  const config = getRarityConfig();

  // Typewriter effect for Omen
  useEffect(() => {
    if (omen && omen.text) {
        let i = 0;
        setTypedOmen("");
        const text = omen.text;
        const interval = setInterval(() => {
            const char = text[i];
            if (char) {
                setTypedOmen(prev => prev + char);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 20); // Slightly faster typing
        return () => clearInterval(interval);
    }
  }, [omen]);

  const getMoodIcon = (mood: Mood) => {
      switch(mood) {
          case 'SUPER_GOOD': return <Star className="w-4 h-4 text-amber-300 fill-amber-300 animate-spin-slow" />;
          case 'GOOD': return <Sparkles className="w-4 h-4 text-green-300" />;
          case 'BAD': return <Flame className="w-4 h-4 text-red-400" />;
          default: return <CloudRain className="w-4 h-4 text-slate-400" />;
      }
  };

  const getMoodStyles = (mood: Mood) => {
      switch(mood) {
          case 'SUPER_GOOD': return 'bg-amber-500/10 text-amber-200 border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]';
          case 'GOOD': return 'bg-green-500/10 text-green-200 border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.1)]';
          case 'BAD': return 'bg-red-500/10 text-red-200 border-red-500/30 shadow-[0_0_20px_rgba(248,113,113,0.1)]';
          default: return 'bg-slate-500/10 text-slate-200 border-slate-500/30';
      }
  };

  const getMoodLabel = (mood: Mood) => {
      const key = `mood_${mood.toLowerCase()}` as keyof typeof t.adventure;
      return t.adventure[key] || mood;
  };

  // =================================================================================================
  // STATE 1: INITIAL CONSULT (The Void Altar)
  // =================================================================================================
  if (!omen) {
    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <div className={`
                relative w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden border ${config.border} ${config.glow}
                animate-in fade-in zoom-in duration-500 flex flex-col items-center
            `}>
                {/* Background Atmosphere */}
                <div className={`absolute inset-0 bg-gradient-to-b ${config.bgGradient} opacity-80`} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
                
                {/* Top Section: Unit Info */}
                <div className="relative z-10 w-full p-8 pb-4 flex flex-col items-center text-center">
                    <div className="mb-6 relative group">
                        {/* Orbiting Ring */}
                        <div className={`absolute inset-0 rounded-full border border-dashed border-white/20 animate-spin-slow scale-150 group-hover:scale-125 transition-transform duration-700`} />
                        <div className={`absolute inset-0 rounded-full border border-white/10 animate-[spin_10s_linear_infinite_reverse] scale-[1.8]`} />
                        
                        {/* Central Eye */}
                        <div className={`
                            w-20 h-20 rounded-full bg-slate-950 border-2 ${config.border} flex items-center justify-center
                            shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-10 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-shadow
                        `}>
                            {consulting ? (
                                <Loader2 className={`w-8 h-8 animate-spin ${config.text}`} />
                            ) : (
                                <Eye className={`w-8 h-8 ${config.text} drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`} />
                            )}
                        </div>
                        
                        {/* Decorative Particles */}
                        <Sparkles className={`absolute -top-4 -right-4 w-5 h-5 ${config.text} animate-pulse opacity-50`} />
                        <Dna className={`absolute -bottom-2 -left-4 w-5 h-5 ${config.text} opacity-30 rotate-45`} />
                    </div>

                    <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2 drop-shadow-md">
                        {t.adventure.consult_title}
                    </h2>
                    <div className={`h-1 w-12 rounded-full mb-6 ${config.accent}`} />
                    
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
                        {t.adventure.consult_desc.replace('{0}', cardText.name)}
                    </p>
                </div>

                {/* Bottom Section: Actions */}
                <div className="relative z-10 w-full p-8 pt-4 space-y-4">
                     <button 
                        onClick={onConsult}
                        disabled={consulting}
                        className={`
                            group w-full py-4 rounded-xl relative overflow-hidden transition-all duration-300
                            ${consulting ? 'bg-slate-800 cursor-not-allowed' : `${config.buttonBg} shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
                        `}
                    >
                        {/* Shimmer Effect */}
                        {!consulting && <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />}
                        
                        <div className="flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-xs relative z-10">
                            {consulting ? (
                                <>
                                    <BrainCircuit className="w-4 h-4 animate-pulse" />
                                    <span>{t.adventure.communing}</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>{t.adventure.pay_essence}</span>
                                </>
                            )}
                        </div>
                    </button>

                    <button
                        onClick={onCancel}
                        disabled={consulting}
                        className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
                    >
                        <XCircle size={12} /> {t.ui.cancel}
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // =================================================================================================
  // STATE 2: OMEN REVEALED (The Prophecy Tablet)
  // =================================================================================================
  if ((omen && options.length === 0) || loading) {
      return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <div className={`
                relative w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden border ${config.border} ${config.glow}
                animate-in fade-in zoom-in duration-300 flex flex-col
            `}>
                <div className={`absolute inset-0 bg-gradient-to-b ${config.bgGradient} opacity-90`} />

                {/* Header */}
                <div className="relative z-10 p-8 pb-0 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4 opacity-70">
                        <Ghost size={16} className={config.text} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.text}`}>{t.adventure.the_omen}</span>
                    </div>

                    {omen.tongue && (
                        <div className="flex items-center gap-2 mb-6">
                            <Quote size={10} className="text-slate-500 rotate-180" />
                            <span className="text-xs font-bold text-slate-400 italic font-serif">{omen.tongue}</span>
                            <Quote size={10} className="text-slate-500" />
                        </div>
                    )}
                </div>

                {/* The Omen Text Box */}
                <div className="relative z-10 px-8">
                    <div className="relative bg-slate-950/50 border border-slate-800 p-8 rounded-xl shadow-inner min-h-[140px] flex items-center justify-center group">
                        {/* Corner Accents */}
                        <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${config.border} opacity-50`} />
                        <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${config.border} opacity-50`} />
                        <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${config.border} opacity-50`} />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${config.border} opacity-50`} />

                        <p className={`text-lg md:text-xl font-serif leading-relaxed text-center ${config.text} drop-shadow-sm`}>
                            {typedOmen}
                            <span className="animate-pulse ml-0.5 inline-block w-1.5 h-4 bg-current align-middle opacity-50" />
                        </p>
                    </div>
                </div>

                {/* Controls / Loading State */}
                <div className="relative z-10 p-8 pt-6">
                    {loading ? (
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <span>{t.adventure.manifesting}</span>
                                <span className="animate-pulse">...</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${config.accent} w-1/3 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent`} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                             <button
                                onClick={onProceed}
                                className={`
                                    w-full py-4 rounded-xl flex items-center justify-center gap-3 text-white transition-all duration-300
                                    ${config.buttonBg} shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                                `}
                            >
                                <span className="font-black uppercase tracking-[0.2em] text-xs">{t.adventure.reveal_destiny}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            
                            <button
                                onClick={onCancel}
                                className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-red-400/60 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors uppercase tracking-widest"
                            >
                                <Skull size={12} /> {t.adventure.flee}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // =================================================================================================
  // STATE 3: OPTIONS REVEALED (Full Modal) - REFINED
  // =================================================================================================
  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl overflow-y-auto">
      <div className={`bg-slate-900 border-2 rounded-3xl max-w-5xl w-full h-[500px] shadow-[0_0_80px_rgba(0,0,0,0.8)] relative animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 overflow-hidden flex flex-col md:flex-row ${config.border} ${config.glow}`}>
        
        {/* Background Ambience */}
        <div className={`absolute -top-20 -right-20 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none bg-gradient-to-br ${config.bgGradient}`} />

        {/* --- LEFT COLUMN: THE NARRATIVE --- */}
        <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/50 flex flex-col relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
            
            {/* Header / Mood */}
            <div className="p-6 pb-2 border-b border-white/5 relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 opacity-80">
                         <BookOpen size={16} className={config.text} />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.adventure.story_chapter}</span>
                    </div>
                    {/* MOOD BADGE */}
                    {omen && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md ${getMoodStyles(omen.mood)}`}>
                            {getMoodIcon(omen.mood)}
                            <span className="text-[9px] font-black uppercase tracking-wider">
                                {getMoodLabel(omen.mood)}
                            </span>
                        </div>
                    )}
                </div>
                <h2 className={`text-2xl font-black uppercase tracking-tighter leading-none ${config.text} drop-shadow-sm`}>
                    {t.adventure.destiny} {t.adventure.unfolds}
                </h2>
            </div>

            {/* Scrollable Story Content */}
            <div className="flex-1 overflow-y-auto p-6 relative z-10 custom-scrollbar">
                 {omen?.tongue && (
                    <div className="flex items-center gap-2 mb-4 opacity-70">
                        <span className="w-1 h-1 rounded-full bg-slate-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                            {t.ui.style}: {omen.tongue}
                        </span>
                    </div>
                )}
                
                <div className="prose prose-invert prose-sm">
                    <p className="text-slate-300 text-lg leading-relaxed font-serif italic border-l-2 border-slate-700 pl-4">
                        "{event}"
                    </p>
                </div>
            </div>

            {/* Footer Status */}
            <div className="p-4 border-t border-white/5 bg-slate-950/80 relative z-10 flex items-center gap-3 text-slate-500">
                 <XCircle size={14} className="text-red-500/50" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">{t.adventure.fate_sealed}</span>
            </div>
        </div>

        {/* --- RIGHT COLUMN: THE CHOICES --- */}
        <div className="w-full md:w-7/12 bg-slate-900/40 p-6 md:p-8 flex flex-col relative z-10">
             <div className="mb-6 flex items-center gap-3">
                 <div className={`p-2 rounded-lg bg-slate-800 border border-slate-700 ${config.text}`}>
                     <Compass size={20} />
                 </div>
                 <div>
                     <h3 className="text-white font-bold uppercase tracking-wide text-sm">{t.adventure.choose_path}</h3>
                     <p className="text-xs text-slate-500">Select one to determine the future</p>
                 </div>
             </div>

             <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {options.map((option, i) => {
                    const isHovered = hoveredId === i;
                    const isPromotion = option.outcomeType === 'PROMOTION';
                    
                    return (
                        <button
                            key={i}
                            onMouseEnter={() => setHoveredId(i)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => onSelect(option)}
                            className={`
                                group relative w-full p-0 rounded-2xl border-2 text-left transition-all duration-300 ease-out active:scale-[0.99] overflow-hidden
                                ${isHovered 
                                    ? `bg-slate-800 ${config.border} shadow-lg scale-[1.01] z-10` 
                                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'}
                            `}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            {/* Card Content */}
                            <div className="relative z-10 flex">
                                {/* Left Strip */}
                                <div className={`w-1.5 transition-colors duration-300 ${isPromotion ? 'bg-amber-500' : isHovered ? config.accent.replace('bg-', 'bg-') : 'bg-slate-700'}`} />
                                
                                <div className="p-4 flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col gap-0.5">
                                             <h4 className={`font-black uppercase tracking-wide text-sm transition-colors ${isPromotion ? 'text-amber-400' : isHovered ? 'text-white' : 'text-slate-300'}`}>
                                                {option.title}
                                            </h4>
                                            {isPromotion && (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-wider">
                                                    <Crown size={10} fill="currentColor" /> {t.adventure.ascend}
                                                </span>
                                            )}
                                        </div>
                                        {/* Trait Badge */}
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${isHovered ? 'bg-black/30 border-white/20 text-white' : 'bg-black/20 border-white/5 text-slate-500'}`}>
                                            {option.traitName}
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-snug transition-colors line-clamp-2">
                                        {option.description}
                                    </p>
                                </div>

                                {/* Arrow Action */}
                                <div className={`w-12 flex items-center justify-center border-l border-white/5 transition-colors duration-300 ${isHovered ? 'bg-white/5' : ''}`}>
                                     <ArrowRight size={18} className={`transition-all duration-300 ${isHovered ? `${config.text} translate-x-0 opacity-100` : 'text-slate-600 -translate-x-2 opacity-50'}`} />
                                </div>
                            </div>
                            
                            {/* Background Hover Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                        </button>
                    );
                })}
             </div>
        </div>

      </div>
    </div>
  );
};

export default AdventureModal;
