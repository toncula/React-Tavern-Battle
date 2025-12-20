
import React from 'react';
import { Crown, Infinity, LogOut } from 'lucide-react';

interface VictoryScreenProps {
  t: any;
  onContinue: () => void;
  onBackToMenu: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ t, onContinue, onBackToMenu }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-[#0f172a] to-black text-white flex-col gap-4">
      <Crown size={80} className="text-yellow-400 animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
      <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-700 pb-2 text-center px-4">
        {t.ui.game_won}
      </h1>
      <p className="text-yellow-100/80 text-xl font-medium tracking-wide text-center px-6 max-w-2xl">
        {t.ui.victory_desc}
      </p>
      
      <div className="flex flex-col gap-4 mt-8 w-full max-w-xs">
          <button 
              onClick={onContinue}
              className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 rounded-xl font-bold text-lg shadow-xl shadow-yellow-900/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-white"
          >
              <Infinity size={24} /> {t.ui.enter_infinite}
          </button>
          
          <button 
              onClick={onBackToMenu}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
              <LogOut size={18} /> {t.ui.back_menu}
          </button>
      </div>
    </div>
  );
};

export default VictoryScreen;
