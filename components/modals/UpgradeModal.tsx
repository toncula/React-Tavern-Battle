
import React from 'react';
import { UpgradeOption, CardData } from '../../types';
import { ArrowUpCircle, XCircle, Sword, Shield, Crosshair, Zap } from 'lucide-react';
import { Language, getTranslation, getCardText, getUpgradeText } from '../../translations';

interface UpgradeModalProps {
  card: CardData;
  options: UpgradeOption[];
  language: Language;
  onSelect: (upgrade: UpgradeOption) => void;
  onCancel: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ card, options, language, onSelect, onCancel }) => {
  const t = getTranslation(language);
  const cardText = getCardText(card, language);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border-2 border-purple-500 rounded-xl max-w-4xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ArrowUpCircle className="text-purple-400" />
              {t.ui.upgrade_modal_title} <span className="text-purple-300">{cardText.name}</span>
            </h2>
            <p className="text-slate-400 text-sm">{t.ui.upgrade_modal_desc}</p>
          </div>
          <div className="text-right">
             <p className="text-xs text-slate-500 uppercase tracking-wide">{t.ui.cost}</p>
             <p className="font-bold text-purple-400 text-xl">2 {t.ui.essence}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option) => {
            const opText = getUpgradeText(option, language);
            return (
                <button
                key={option.id}
                onClick={() => onSelect(option)}
                className={`
                    flex flex-col p-4 rounded-lg border-2 transition-all hover:scale-105 text-left
                    ${option.rarity === 'LEGENDARY' ? 'bg-amber-900/30 border-amber-500 hover:bg-amber-900/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 
                    option.rarity === 'RARE' ? 'bg-blue-900/30 border-blue-500 hover:bg-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 
                    'bg-slate-700 border-slate-500 hover:bg-slate-600 shadow-lg'}
                `}
                >
                <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest
                    ${option.rarity === 'LEGENDARY' ? 'bg-amber-500 text-black' : 
                        option.rarity === 'RARE' ? 'bg-blue-500 text-white' : 
                        'bg-slate-500 text-white'}
                    `}>
                    {option.rarity === 'LEGENDARY' ? t.ui.rarity_legendary : option.rarity === 'RARE' ? t.ui.rarity_rare : t.ui.rarity_common}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{option.unitType}</span>
                </div>

                <h3 className="text-xl font-black text-white mb-1">{opText.name}</h3>
                <p className="text-xs text-slate-400 mb-4 h-8 line-clamp-2 leading-tight">"{opText.desc}"</p>
                
                <div className="grid grid-cols-2 gap-2 w-full mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-red-300 font-bold">
                        <Sword size={12}/> {option.baseStats.damage}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-green-300 font-bold">
                        <Shield size={12}/> {option.baseStats.hp}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-blue-300 font-bold">
                        <Crosshair size={12}/> {option.baseStats.range > 30 ? option.baseStats.range : 'Melee'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-yellow-300 font-bold">
                        <Zap size={12}/> {(option.baseStats.attackCooldown / 60).toFixed(1)}s
                    </div>
                </div>

                <div className="mt-4 w-full py-2 bg-black/30 rounded text-center text-xs font-bold text-slate-300 group-hover:bg-black/50 transition-colors uppercase tracking-widest">
                    {t.ui.select}
                </div>
                </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-400 hover:text-white px-6 py-2 rounded-full border border-slate-600 hover:border-slate-400 transition-all"
          >
            <XCircle size={18} />
            {t.ui.cancel_refund}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpgradeModal;
