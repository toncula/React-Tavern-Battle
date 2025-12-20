
import React from 'react';
import { PlayerState, CardData } from '../../types';
import { Language } from '../../translations';
import { ArrowUpCircle, Lock, LockOpen, RefreshCw, Store, Skull, PlayCircle, Banknote } from 'lucide-react';
import UnitCard from './cards/UnitCard';

interface ShopPanelProps {
  player: PlayerState;
  shopCards: CardData[];
  isShopLocked: boolean;
  shopViewMode: 'SHOP' | 'INTEL';
  isTransitioning: boolean;
  nextEnemies: CardData[];
  t: any;
  language: Language;
  onLevelUpTavern: () => void;
  onToggleLock: () => void;
  onRefreshShop: () => void;
  onToggleViewMode: () => void;
  onStartCombat: () => void;
  onBuyCard: (card: CardData) => void;
  onCardHover: (card: CardData, rect: DOMRect) => void;
  onCardLeave: () => void;
  refreshCost: number;
}

const ShopPanel: React.FC<ShopPanelProps> = ({ 
    player, shopCards, isShopLocked, shopViewMode, isTransitioning, nextEnemies, t, language,
    onLevelUpTavern, onToggleLock, onRefreshShop, onToggleViewMode, onStartCombat, onBuyCard, onCardHover, onCardLeave, refreshCost 
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-900/60 z-10 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
        
        {/* COMMAND BAR */}
        <div className="w-full h-20 px-8 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5 shadow-lg shrink-0">
            {/* LEFT: TAVERN CONTROL */}
            <div className="flex items-center gap-4 justify-start">
                    <div className="bg-black/30 p-1.5 rounded-lg border border-white/5 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{t.ui.shop_tier.replace('{0}', '')}</span>
                    <div className="flex items-center gap-1">
                        {[1,2,3,4].map(lvl => (
                            <div key={lvl} className={`h-1.5 w-5 rounded-sm transition-all duration-300 ${player.tavernTier >= lvl ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-700'}`} />
                        ))}
                    </div>
                    </div>
                
                <button 
                    onClick={onLevelUpTavern}
                    disabled={player.tavernTier >= 4 || player.gold < player.tavernUpgradeCost || isTransitioning}
                    className={`
                        relative overflow-hidden group px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 active:scale-95 disabled:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed
                        ${player.tavernTier >= 4 
                            ? 'border-slate-800 bg-slate-900/50 text-slate-600 cursor-default' 
                            : player.gold >= player.tavernUpgradeCost 
                                ? 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-400' 
                                : 'border-slate-700 bg-slate-800/40 text-slate-500'}
                    `}
                >
                    <ArrowUpCircle size={18} className={`${player.gold >= player.tavernUpgradeCost && player.tavernTier < 4 ? 'text-blue-400' : 'text-slate-600'}`} />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">{t.ui.level_up}</span>
                        {player.tavernTier < 4 && <span className="text-sm font-mono font-bold">{player.tavernUpgradeCost}<span className="text-[10px] ml-0.5 text-yellow-500">G</span></span>}
                        {player.tavernTier >= 4 && <span className="text-xs font-bold text-slate-500">{t.ui.max}</span>}
                    </div>
                </button>
            </div>

            {/* CENTER: REFRESH & LOCK */}
            <div className="flex justify-center items-center gap-2">
                    {/* LOCK BUTTON */}
                    {shopViewMode === 'SHOP' && (
                    <button
                        onClick={onToggleLock}
                        disabled={isTransitioning}
                        className={`
                            h-10 w-10 rounded-lg border transition-all flex items-center justify-center active:scale-95 shadow-md disabled:opacity-50
                            ${isShopLocked
                                ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'}
                        `}
                        title={isShopLocked ? "Unlock Shop" : "Lock Shop (Freeze for 1 round)"}
                    >
                        {isShopLocked ? <Lock size={16} /> : <LockOpen size={16} />}
                    </button>
                    )}

                {shopViewMode === 'SHOP' && (
                    <button 
                        onClick={onRefreshShop}
                        disabled={player.gold < refreshCost || isTransitioning}
                        className={`
                            group relative px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all border
                            active:scale-95 disabled:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed
                            ${player.gold >= refreshCost 
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                                : 'bg-slate-800 text-slate-500 border-slate-700'}
                        `}
                    >
                        <RefreshCw size={16} className={`transition-transform duration-500 ${player.gold >= refreshCost ? 'group-hover:rotate-180' : ''}`} />
                        <div className="flex flex-col items-start leading-none">
                            <span className="uppercase tracking-widest text-xs">{t.ui.refresh}</span>
                            <span className="text-[10px] font-normal opacity-70">{refreshCost} {t.ui.gold}</span>
                        </div>
                    </button>
                )}
            </div>

            {/* RIGHT: BATTLE & INTEL */}
            <div className="flex items-center gap-3 justify-end">
                    <button
                    onClick={onToggleViewMode}
                    disabled={isTransitioning}
                    className={`
                        h-10 w-10 rounded-lg border transition-all flex items-center justify-center disabled:opacity-50
                        ${shopViewMode === 'INTEL' 
                            ? 'bg-red-950/30 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(220,38,38,0.2)]' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
                    `}
                    title={shopViewMode === 'INTEL' ? t.ui.view_shop : t.ui.view_intel}
                >
                    {shopViewMode === 'INTEL' ? <Store size={18}/> : <Skull size={18}/>}
                </button>
                
                <button 
                    onClick={onStartCombat}
                    disabled={isTransitioning}
                    className={`
                        bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 
                        text-white px-6 py-2.5 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-all 
                        shadow-lg hover:shadow-red-900/50 border border-red-500/20 active:scale-95
                        group disabled:opacity-50 disabled:cursor-wait
                    `}
                >
                    {isTransitioning ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-sm">{t.ui.buffing}</span>
                        </>
                    ) : (
                        <>
                            <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
                                <PlayCircle size={14} className="fill-white/90 text-transparent" />
                            </div>
                            <span className="text-sm drop-shadow-md">{t.ui.battle}</span>
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* SHOP CONTENT AREA */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative z-0">
            <div className={`flex-1 flex items-center justify-center p-8 transition-all duration-300 ${isShopLocked ? 'bg-cyan-950/10 shadow-[inset_0_0_50px_rgba(6,182,212,0.1)]' : ''}`}>
                {isShopLocked && (
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[6px] border-cyan-500/20 z-0 animate-pulse" />
                )}

                {shopViewMode === 'INTEL' ? (
                    <div className="w-full text-center relative z-10">
                        <div className="text-red-400 font-bold uppercase tracking-widest text-xs mb-8 flex items-center gap-2 justify-center opacity-80">
                            <div className="h-px w-12 bg-red-800"/>
                            <Skull size={14} /> {t.ui.enemy_intel}
                            <div className="h-px w-12 bg-red-800"/>
                        </div>
                        <div className="flex gap-4 justify-center flex-wrap animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {nextEnemies.map((card, i) => (
                                <div key={i} className="hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                                    <UnitCard
                                        card={card}
                                        location="SHOP"
                                        variant="enemy"
                                        readOnly
                                        language={language}
                                        onHover={onCardHover}
                                        onLeave={onCardLeave}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-6 items-center justify-center flex-wrap animate-in fade-in slide-in-from-bottom-4 duration-300 w-full relative z-10">
                        {shopCards.map(card => (
                            <UnitCard 
                                key={card.id} 
                                card={card} 
                                location="SHOP" 
                                language={language}
                                canAfford={player.gold >= 3 && !isTransitioning}
                                onBuy={onBuyCard}
                                onHover={onCardHover}
                                onLeave={onCardLeave}
                            />
                        ))}
                        {shopCards.length === 0 && (
                            <div className="text-slate-500 italic text-lg">{t.ui.empty_shop}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ShopPanel;
