import React from 'react';
import { Swords, PlayCircle, BookOpen, Globe } from 'lucide-react';

interface StartMenuProps {
    t: any;
    onStartGame: () => void;
    onOpenCodex: () => void;
    onToggleLanguage: () => void;
    onInteraction: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ t, onStartGame, onOpenCodex, onToggleLanguage, onInteraction }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-white flex-col gap-8 relative overflow-hidden" onClick={onInteraction}>
        <div className="absolute inset-0 bg-slate-950 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div className="z-10 flex flex-col items-center gap-2">
            <Swords size={80} className="text-blue-500 mb-4 animate-pulse drop-shadow-2xl" />
            <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-cyan-500 to-pink-500 drop-shadow-sm">
                {t.ui.start_title}
            </h1>
            <p className="text-xl text-slate-400 font-light tracking-widest uppercase">{t.ui.start_subtitle}</p>
        </div>

        <div className="z-10 flex flex-col gap-4 w-64 mt-8">
            <button 
                onClick={onStartGame}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg font-bold text-lg shadow-lg shadow-blue-900/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
                <PlayCircle size={24} /> {t.ui.play_game}
            </button>
            <button 
                onClick={onOpenCodex}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-bold text-lg border border-slate-700 hover:border-slate-500 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
                <BookOpen size={24} /> {t.ui.codex}
            </button>
        </div>
        
        <div className="absolute bottom-8 right-8 z-10">
            <button
                onClick={onToggleLanguage}
                className="flex items-center gap-3 px-4 py-3 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
            >
                <span className="text-sm font-bold uppercase tracking-wider">{t.ui.select_language}</span>
                <Globe size={20} />
            </button>
        </div>
    </div>
  );
};

export default StartMenu;