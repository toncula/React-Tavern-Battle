
import React, { useLayoutEffect, useRef, useState } from 'react';
import { CardData, UnitType } from '../../../types';
import { Sword, Shield, Activity, Crosshair, Zap, Compass, Sparkles, CircleDashed, Wifi, Bomb, Crown } from 'lucide-react';
import { getEffectiveStats } from '../../../constants';
import { Language, getTranslation, getCardText, getUnitTypeText, getEffectText } from '../../../translations';

interface CardInfoPanelProps {
  card: CardData;
  rect: DOMRect;
  language: Language;
}

const CardInfoPanel: React.FC<CardInfoPanelProps> = ({ card, rect, language }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 }); // Start invisible to calculate position

  const stats = getEffectiveStats(card);
  const t = getTranslation(language);
  const cardText = getCardText(card, language);
  const effectText = card.specialEffect ? getEffectText(card.specialEffect, language) : null;

  useLayoutEffect(() => {
    if (!panelRef.current) return;

    const panel = panelRef.current;
    const { width, height } = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const GAP = 12; // Gap between target and panel
    const MARGIN = 16; // Minimum margin from screen edge

    let left = rect.right + GAP;
    let top = rect.top;

    // --- Horizontal Logic ---
    // Prefer placing to the RIGHT.
    // If it overflows right, try LEFT.
    if (left + width > viewportWidth - MARGIN) {
        left = rect.left - width - GAP;
    }

    // If it now overflows left (e.g. card is on left edge but right was blocked?), force keep on screen
    // or if the card covers the whole width (mobile?), center it or stick to an edge.
    if (left < MARGIN) {
        // If we are closer to the left side, stick to left margin
        if (rect.left < viewportWidth / 2) {
             left = MARGIN;
        } else {
             // Otherwise stick to right margin
             left = viewportWidth - width - MARGIN;
        }
    }
    
    // Final clamp to ensure it never goes off screen horizontally
    left = Math.max(MARGIN, Math.min(left, viewportWidth - width - MARGIN));


    // --- Vertical Logic ---
    // Prefer Top Alignment with the card.
    // Check if panel overflows bottom of screen.
    if (top + height > viewportHeight - MARGIN) {
        // If overflowing bottom, shift UP.
        // Try to align bottom of panel with bottom of card first, or just fit to screen bottom.
        // Let's fit to screen bottom for maximum visibility.
        top = viewportHeight - height - MARGIN;
    }

    // Check if it overflows top of screen (after shift)
    if (top < MARGIN) {
        top = MARGIN;
    }

    setStyle({
        top: `${top}px`,
        left: `${left}px`,
        opacity: 1,
        transition: 'opacity 0.1s ease-out'
    });

  }, [rect, card]); // Recalculate if rect moves or card changes

  return (
    <div 
      ref={panelRef}
      className="fixed z-[100] w-72 bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl overflow-hidden pointer-events-none"
      style={style}
    >
      <div className="p-4 border-b border-slate-800 bg-slate-950/50">
        <h3 className="text-xl font-bold text-white mb-1">{cardText.name}</h3>
        <p className="text-xs text-slate-400 leading-relaxed italic">"{cardText.desc}"</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Unit Type Info */}
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
                {card.unitType === UnitType.MELEE && <Sword size={18} className="text-red-400" />}
                {card.unitType === UnitType.RANGED && <Crosshair size={18} className="text-blue-400" />}
                {card.unitType === UnitType.BUFFER && <Activity size={18} className="text-green-400" />}
                {card.unitType === UnitType.SPLASHER && <Bomb size={18} className="text-orange-400" />}
                {card.unitType === UnitType.HERO && <Crown size={18} className="text-yellow-400" />}
            </div>
            <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.ui.type}</div>
                <div className="text-xs text-slate-200 font-medium">{getUnitTypeText(card.unitType, language)}</div>
            </div>
        </div>

        {/* Special Effect */}
        {card.specialEffect && effectText && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} className="text-purple-400" />
                    <span className="text-xs font-bold text-purple-200">{effectText.name}</span>
                </div>
                <p className="text-[10px] text-purple-300/80 leading-normal">{effectText.desc}</p>
            </div>
        )}

        {/* Buff Info if applicable */}
        {card.baseStats.buffRadius && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                    <Wifi size={14} className="text-blue-400" />
                    <span className="text-xs font-bold text-blue-200">{t.ui.buff_effect}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {card.baseStats.buffStats?.damage !== undefined && (
                        <div className="text-[10px] text-blue-300">+{card.baseStats.buffStats.damage} {t.ui.plus_damage}</div>
                    )}
                    {card.baseStats.buffStats?.attackSpeed !== undefined && (
                        <div className="text-[10px] text-blue-300">+{Math.round(card.baseStats.buffStats.attackSpeed * 100)}% {t.ui.plus_speed}</div>
                    )}
                </div>
            </div>
        )}

        {/* AOE Info if applicable */}
        {card.baseStats.aoeRadius && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                    <CircleDashed size={14} className="text-red-400" />
                    <span className="text-xs font-bold text-red-200">{t.ui.aoe_radius}</span>
                </div>
                <p className="text-[10px] text-red-300/80">{card.baseStats.aoeRadius}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CardInfoPanel;
