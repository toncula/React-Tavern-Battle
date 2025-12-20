
import React from 'react';
import { CardData } from '../../types';
import UnitCard from '../shop/cards/UnitCard';
import { Language, getTranslation } from '../../translations';
import { Sparkles } from 'lucide-react';

interface DiscoveryModalProps {
  options: CardData[];
  language: Language;
  onSelect: (card: CardData) => void;
  onHover: (card: CardData, rect: DOMRect) => void;
  onLeave: () => void;
}

const DiscoveryModal: React.FC<DiscoveryModalProps> = ({ options, language, onSelect, onHover, onLeave }) => {
  const t = getTranslation(language);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-800/90 border-2 border-yellow-500 rounded-2xl max-w-4xl w-full p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300 flex flex-col items-center">
        
        <div className="absolute -top-12 text-yellow-400 animate-bounce drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]">
            <Sparkles size={60} />
        </div>

        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-amber-600 mb-2 uppercase tracking-wide">
          {t.ui.triple_reward}
        </h2>
        <p className="text-yellow-100/70 text-lg mb-8 font-medium">
          {t.ui.discover_desc}
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          {options.map((card) => (
            <div key={card.id} className="hover:scale-105 transition-transform duration-200 shadow-xl">
               <UnitCard 
                 card={card} 
                 location="DISCOVERY" 
                 language={language} 
                 onSelect={onSelect}
                 onHover={onHover}
                 onLeave={onLeave}
               />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DiscoveryModal;
