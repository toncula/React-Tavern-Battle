
import React from 'react';
import { Skull } from 'lucide-react';

interface GameOverScreenProps {
  t: any;
  round: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ t, round, onRestart }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-white flex-col gap-4">
      <Skull size={64} className="text-red-500 animate-pulse" />
      <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">{t.ui.game_over}</h1>
      <p className="text-slate-400 text-lg">{t.ui.survived.replace('{0}', round.toString())}</p>
      <button 
          onClick={onRestart}
          className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold shadow-lg shadow-blue-900/40 transition-all hover:scale-105"
      >
          {t.ui.play_again}
      </button>
    </div>
  );
};

export default GameOverScreen;
