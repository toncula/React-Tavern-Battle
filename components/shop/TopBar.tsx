
import React, { useState } from 'react';
import { PlayerState } from '../../types';
import { Heart, Coins, Compass, LogOut, AlertTriangle } from 'lucide-react';
import { MAX_ADVENTURE_POINTS, INITIAL_PLAYER_HP } from '../../constants';

interface TopBarProps {
  player: PlayerState;
  round: number;
  language: string;
  onBackToMenu: () => void;
  onAbandon: () => void;
  phase: string;
  t: any;
}

const TopBar: React.FC<TopBarProps> = ({ player, round, t, onBackToMenu, onAbandon, phase }) => {
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  return (
    <>
    <div className="h-14 shrink-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 shadow-md z-30 sticky top-0">
        <div className="flex items-center gap-6">
            <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-500 drop-shadow-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={onBackToMenu}>
                {t.ui.start_title}
            </h1>
            <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-red-900/50 shadow-inner">
                    <Heart className="text-red-500 fill-red-500" size={16} />
                    <span className="font-bold text-sm">{player.hp}/{INITIAL_PLAYER_HP}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-yellow-900/50 shadow-inner" title="Gold / Income">
                    <Coins className="text-yellow-400 fill-yellow-400" size={16} />
                    <span className="font-bold text-sm">{player.gold}/{player.income}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-emerald-900/50 shadow-inner" title={t.ui.essence}>
                    <Compass className="text-emerald-400" size={16} />
                    <span className={`font-bold text-sm ${player.adventurePoints >= MAX_ADVENTURE_POINTS ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {player.adventurePoints}/{MAX_ADVENTURE_POINTS}
                    </span>
                </div>
                <div className="text-slate-500 font-bold uppercase tracking-wide text-[10px] bg-slate-800 px-2 py-1 rounded">
                    {t.ui.round} <span className="text-slate-200 text-sm ml-1">{round}</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-4">
            {phase !== 'START_MENU' && phase !== 'VICTORY' && phase !== 'GAME_OVER' && (
                <button 
                    onClick={() => setShowAbandonModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-800 transition-all text-xs font-bold"
                >
                    <LogOut size={14} />
                    <span className="hidden sm:inline">{t.ui.abandon}</span>
                </button>
            )}
        </div>
    </div>

    {showAbandonModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border border-red-500/50 rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center border border-red-500/30">
                        <AlertTriangle className="text-red-500" size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">{t.ui.abandon_title}</h2>
                        <p className="text-slate-400 text-sm">{t.ui.abandon_desc}</p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button 
                            onClick={() => setShowAbandonModal(false)}
                            className="flex-1 py-2.5 rounded-lg font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                        >
                            {t.ui.cancel}
                        </button>
                        <button 
                            onClick={() => {
                                setShowAbandonModal(false);
                                onAbandon();
                            }}
                            className="flex-1 py-2.5 rounded-lg font-bold bg-red-600 text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
                        >
                            {t.ui.confirm}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default TopBar;
