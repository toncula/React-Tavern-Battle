import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, ArrowLeft, ChevronLeft, ChevronRight, Store, Trophy, Info, BrainCircuit, Skull, Scroll, Swords, Zap } from 'lucide-react';
import { CARD_TEMPLATES } from '../../constants';
import { CODEX_ENEMIES } from '../../data/enemySettings';
import UnitCard from '../shop/cards/UnitCard';
import { Language, getCardText } from '../../translations';
import { CardData } from '../../types';

interface CodexProps {
    language: Language;
    t: any;
    onBackToMenu: () => void;
    onInteraction: () => void;
    onHover: (card: CardData, rect: DOMRect) => void;
    onLeave: () => void;
}

const Codex: React.FC<CodexProps> = ({ language, t, onBackToMenu, onInteraction, onHover, onLeave }) => {
    // Removed 'ADVENTURE' tab
    const [codexTab, setCodexTab] = useState<'CARDS' | 'ENEMIES' | 'RULES'>('CARDS');
    const [codexPage, setCodexPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        setCodexPage(1);
        setSearchTerm('');
    }, [codexTab]);

    const filteredItems = useMemo(() => {
        let source = codexTab === 'CARDS' ? CARD_TEMPLATES : CODEX_ENEMIES;
        if (codexTab === 'CARDS') {
            source = [...source].sort((a, b) => {
                const tierA = a.tier === 0 ? 99 : a.tier;
                const tierB = b.tier === 0 ? 99 : b.tier;
                return tierA - tierB;
            });
        }

        if (!searchTerm) return source;

        const lowerSearch = searchTerm.toLowerCase();

        return source.filter(item => {
            // Use getCardText to allow searching by localized name/description
            const { name, desc } = getCardText(item as CardData, language);

            return (
                name.toLowerCase().includes(lowerSearch) ||
                desc.toLowerCase().includes(lowerSearch) ||
                (item.unitType && item.unitType.toLowerCase().includes(lowerSearch))
            );
        });
    }, [codexTab, searchTerm, language]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const currentItems = filteredItems.slice((codexPage - 1) * ITEMS_PER_PAGE, codexPage * ITEMS_PER_PAGE);

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center items-center gap-4 mt-8 pb-8 animate-in fade-in slide-in-from-bottom-2">
                <button
                    onClick={() => {
                        onInteraction();
                        setCodexPage(p => Math.max(1, p - 1));
                    }}
                    disabled={codexPage === 1}
                    className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-300 hover:text-white hover:border-cyan-500/50 shadow-lg"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800">
                    <span className="text-sm font-bold text-slate-300">
                        {codexPage} <span className="text-slate-600">/</span> {totalPages}
                    </span>
                </div>

                <button
                    onClick={() => {
                        onInteraction();
                        setCodexPage(p => Math.min(totalPages, p + 1));
                    }}
                    disabled={codexPage === totalPages}
                    className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-300 hover:text-white hover:border-cyan-500/50 shadow-lg"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        );
    };

    const tabs = [
        { id: 'CARDS', label: t.ui.tab_cards, icon: Swords },
        { id: 'ENEMIES', label: t.ui.tab_enemies, icon: Skull },
        // Adventure Tab Removed
        { id: 'RULES', label: t.ui.tab_rules, icon: Scroll },
    ] as const;

    const rulesIcons = [<Store className="w-6 h-6" />, <Zap className="w-6 h-6" />, <BrainCircuit className="w-6 h-6" />, <Trophy className="w-6 h-6" />];

    const getTabInfo = () => {
        switch (codexTab) {
            case 'CARDS': return { title: t.ui.tab_cards, icon: Swords, desc: t.ui.codex_cards_desc };
            case 'ENEMIES': return { title: t.ui.tab_enemies, icon: Skull, desc: t.ui.codex_enemies_desc };
            case 'RULES': return { title: t.ui.tab_rules, icon: Scroll, desc: t.ui.codex_rules_desc };
            default: return { title: '', icon: Info, desc: '' };
        }
    };
    const tabInfo = getTabInfo();

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-cyan-500/30" onClick={onInteraction}>
            {/* Header */}
            <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onBackToMenu}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-500 transition-all group"
                            title={t.ui.back_menu}
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <BookOpen size={18} className="text-cyan-500" />
                                <h1 className="text-xl font-bold tracking-wide text-slate-100 uppercase">
                                    {t.ui.codex_title}
                                </h1>
                            </div>
                            <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">{t.ui.codex_subtitle}</p>
                        </div>
                    </div>

                    {/* Tab Navigation (Desktop) */}
                    <div className="hidden md:flex items-center p-1 bg-slate-900/50 border border-slate-800 rounded-full">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setCodexTab(tab.id)}
                                className={`
                                relative px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2
                                ${codexTab === tab.id
                                        ? 'bg-cyan-600/90 text-white shadow-lg shadow-cyan-900/20'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
                            `}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar (Only for Cards/Enemies) */}
                    <div className="w-64 h-10 relative hidden md:block opacity-0 transition-opacity duration-300 data-[visible=true]:opacity-100" data-visible={codexTab === 'CARDS' || codexTab === 'ENEMIES'}>
                        {(codexTab === 'CARDS' || codexTab === 'ENEMIES') && (
                            <>
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder={t.ui.search_placeholder}
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCodexPage(1);
                                    }}
                                    className="w-full h-full bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Tabs */}
                <div className="md:hidden flex items-center p-2 overflow-x-auto gap-2 border-t border-slate-800 scrollbar-none">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCodexTab(tab.id)}
                            className={`
                            px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0
                            ${codexTab === tab.id
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-slate-900 text-slate-400 border border-slate-800'}
                        `}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
                {(codexTab === 'CARDS' || codexTab === 'ENEMIES') && (
                    <div className="md:hidden p-2 border-t border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder={t.ui.search_short}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                <div className="max-w-7xl mx-auto w-full p-4 md:p-8 min-h-full">

                    {/* UNIFIED HEADER - UPDATED */}
                    <div className="text-center py-4 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        <div className="flex items-center justify-center gap-4 mb-2">
                            <h2 className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-200 to-white uppercase tracking-tighter drop-shadow-sm">
                                {tabInfo.title}
                            </h2>

                            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-900/50 border border-slate-800 shadow-lg relative group">
                                <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <tabInfo.icon size={24} className="text-cyan-400 relative z-10" />
                            </div>
                        </div>

                        <div className="h-0.5 w-16 bg-cyan-500/30 mx-auto rounded-full mb-3" />

                        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium">
                            {tabInfo.desc}
                        </p>
                    </div>

                    {(codexTab === 'CARDS' || codexTab === 'ENEMIES') && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {currentItems.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                                    {currentItems.map((template, i) => (
                                        <div key={i} className="group relative">
                                            <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="relative hover:scale-105 transition-transform duration-300 cursor-help">
                                                <UnitCard
                                                    card={{ ...template, id: `codex_${i}`, traits: [], upgrades: [] }}
                                                    location="SHOP"
                                                    variant={codexTab === 'ENEMIES' ? 'enemy' : 'default'}
                                                    language={language}
                                                    readOnly
                                                    onHover={onHover}
                                                    onLeave={onLeave}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                    <Search size={48} className="mb-4 opacity-50" />
                                    <p className="text-lg font-medium">{t.ui.no_units_found.replace('{0}', searchTerm)}</p>
                                </div>
                            )}
                            {renderPagination()}
                        </div>
                    )}

                    {codexTab === 'RULES' && (
                        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 pb-20">
                            <div className="grid gap-8">
                                {t.ui.rules_content.map((rule: string, i: number) => (
                                    <div key={i} className="group flex items-start gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:bg-slate-900 hover:border-cyan-500/30 transition-all shadow-lg hover:shadow-cyan-900/10">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-cyan-400 shadow-inner shrink-0 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all">
                                            {rulesIcons[i] || <Info size={28} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-black text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-widest group-hover:text-cyan-500 group-hover:border-cyan-500/20 transition-colors">
                                                    Step 0{i + 1}
                                                </span>
                                            </div>
                                            <p className="text-lg text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">
                                                {rule}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

// Add Search icon import if missing
import { Search } from 'lucide-react';

export default Codex;