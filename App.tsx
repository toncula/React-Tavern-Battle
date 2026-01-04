import React, { useState, useEffect, useMemo } from 'react';
import {
  PlayerState,
  CardData,
  GamePhase,
  RoundSummary,
  EnergyType
} from './types';
import {
  INITIAL_ENERGY,
  INITIAL_INCOME,
  MAX_INCOME, // 假设最大收入上限仍沿用此常量名，代表最大长度 (例如 10)
  INITIAL_ADVENTURE_POINTS,
  MAX_ADVENTURE_POINTS,
  INITIAL_PLAYER_HP,
  generateRandomCard,
  getBaseTavernCost,
  MAX_ROUNDS,
  BATTLE_START_DELAY
} from './constants';
import BattleCanvas from './components/battle/BattleCanvas';
import CardInfoPanel from './components/shop/cards/CardInfoPanel';
import { Language, getTranslation } from './translations';
import { initAudio, playSound } from './services/audioService';
import { getEnemyComposition } from './data/enemySettings';
import { useCardEffects } from './hooks/useCardEffects';
import { ChevronUp } from 'lucide-react';

// Imported Sub-Components
import TopBar from './components/shop/TopBar';
import StartMenu from './components/screens/StartMenu';
import Codex from './components/screens/Codex';
import ShopScreen from './components/screens/ShopScreen';
import GameOverScreen from './components/screens/GameOverScreen';
import VictoryScreen from './components/screens/VictoryScreen';
import RoundOverScreen from './components/screens/RoundOverScreen';

// 引入 EnergyQueue 组件
//import EnergyQueue from './components/shop/EnergyQueue';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START_MENU);
  const [round, setRound] = useState(1);
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);

  // 核心修改: Income 现在是 EnergyType[]，初始化时需要展开复制
  const [player, setPlayer] = useState<PlayerState>({
    hp: INITIAL_PLAYER_HP,
    energyQueue: [...INITIAL_ENERGY],
    income: [...INITIAL_INCOME], // 复制初始收入数组
    adventurePoints: INITIAL_ADVENTURE_POINTS,
    tavernTier: 1,
    tavernUpgradeCost: getBaseTavernCost(1),
    hand: Array(7).fill(null)
  });

  const [shopCards, setShopCards] = useState<CardData[]>([]);
  const [isShopLocked, setIsShopLocked] = useState(false);

  const [enemyConfig, setEnemyConfig] = useState<CardData[]>([]);
  const [roundSummary, setRoundSummary] = useState<RoundSummary | null>(null);

  const [hoveredCardInfo, setHoveredCardInfo] = useState<{ card: CardData, rect: DOMRect } | null>(null);

  const [language, setLanguage] = useState<Language>('en');
  const t = getTranslation(language);

  const [notifications, setNotifications] = useState<string[]>([]);

  // Transition & Effect States
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingTurnEffects, setPendingTurnEffects] = useState<{ gold: number, effects: string[] } | null>(null);

  // Custom Hooks
  const { calculateTurnEndEffects } = useCardEffects(language);

  // Initialize Audio Context on first interaction
  const [audioInited, setAudioInited] = useState(false);
  const handleInteraction = () => {
    if (!audioInited) {
      initAudio();
      setAudioInited(true);
    }
  };

  const refreshShop = (tierOverride?: number) => {
    const tier = tierOverride !== undefined ? tierOverride : player.tavernTier;
    const newShop: CardData[] = [];
    const count = Math.min(6, 3 + tier);
    for (let i = 0; i < count; i++) {
      newShop.push(generateRandomCard(tier));
    }
    setShopCards(newShop);
  };

  const handleStartGame = () => {
    handleInteraction();
    playSound('click');
    const initialTier = 1;
    setPlayer({
      hp: INITIAL_PLAYER_HP,
      energyQueue: [...INITIAL_ENERGY],
      income: [...INITIAL_INCOME], // 重置为初始数组
      adventurePoints: INITIAL_ADVENTURE_POINTS,
      tavernTier: initialTier,
      tavernUpgradeCost: getBaseTavernCost(initialTier),
      hand: Array(7).fill(null)
    });
    setRound(1);
    setIsInfiniteMode(false);
    setRoundSummary(null);
    setEnemyConfig([]);
    setNotifications([]);
    setIsShopLocked(false);
    setPendingTurnEffects(null);
    setIsTransitioning(false);

    refreshShop(initialTier);
    setPhase(GamePhase.SHOP);
  };

  const handleOpenCodex = () => {
    handleInteraction();
    playSound('click');
    setPhase(GamePhase.CODEX);
  };

  const handleBackToMenu = () => {
    handleInteraction();
    playSound('click');
    setPhase(GamePhase.START_MENU);
  };

  const handleCardHover = (card: CardData, rect: DOMRect) => {
    handleInteraction();
    setHoveredCardInfo({ card, rect });
  };

  const handleCardLeave = () => {
    setHoveredCardInfo(null);
  };

  const nextEnemies = useMemo(() => getEnemyComposition(round), [round]);

  const playerArmyValue = useMemo(() => {
    return player.hand.reduce((total, card) => total + (card ? card.value : 0), 0);
  }, [player.hand]);

  const enemyArmyValue = useMemo(() => {
    return enemyConfig.reduce((total, card) => total + card.value, 0);
  }, [enemyConfig]);

  const startCombat = () => {
    handleInteraction();
    if (isTransitioning) return;

    playSound('click');
    setNotifications([]);
    setHoveredCardInfo(null);
    setIsTransitioning(true);

    const { newHand, goldGenerated, summaryEffects } = calculateTurnEndEffects(player.hand);

    // 安全检查：确保 goldGenerated 是数字（它代表额外生成的白色能量数量）
    const safeGoldGenerated = Number.isNaN(Number(goldGenerated)) ? 0 : Number(goldGenerated);

    setPlayer(prev => ({
      ...prev,
      hand: newHand
    }));

    if (summaryEffects.length > 0) {
      playSound('upgrade');
    }

    setPendingTurnEffects({
      gold: safeGoldGenerated,
      effects: summaryEffects
    });

    setTimeout(() => {
      setEnemyConfig(nextEnemies);
      setPhase(GamePhase.COMBAT);
      setIsTransitioning(false);
      setHoveredCardInfo(null);
    }, BATTLE_START_DELAY);
  };

  const handleBattleEnd = (winner: 'PLAYER' | 'ENEMY') => {
    if (winner === 'PLAYER' && round === MAX_ROUNDS && !isInfiniteMode) {
      setPhase(GamePhase.VICTORY);
      return;
    }

    let damage = 0;
    if (winner === 'ENEMY') {
      damage = 1;
      const newHp = player.hp - damage;
      setPlayer(prev => ({ ...prev, hp: newHp }));

      if (newHp <= 0) {
        setPhase(GamePhase.GAME_OVER);
        return;
      }
    }

    // --- 预测下一回合的收入（用于展示） ---
    // 复制当前收入数组
    const nextIncomeQueue = [...player.income];
    // 如果长度还没到上限，并且不是无限模式的特定限制，预测会增加一个白色能量
    if (nextIncomeQueue.length < MAX_INCOME) {
      nextIncomeQueue.push(EnergyType.WHITE);
    }

    const effectEnergyCount = Number(pendingTurnEffects?.gold) || 0;
    const effectTexts = pendingTurnEffects?.effects || [];

    setRoundSummary({
      winner,
      damageTaken: damage,
      baseIncome: nextIncomeQueue, // 传递整个数组给 Summary 界面
      effectGold: effectEnergyCount,
      adventurePointsEarned: 1,
      effects: Array.from(new Set(effectTexts))
    });
    setPhase(GamePhase.ROUND_OVER);
  };

  const handleEnterInfiniteMode = () => {
    setIsInfiniteMode(true);
    handleBattleEnd('PLAYER');
  };

  const handleNextRound = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleInteraction();
    playSound('click');

    const won = roundSummary?.winner === 'PLAYER';
    const nextRound = won ? round + 1 : round;
    setRound(nextRound);

    // 1. 获取额外能量的数量（来自卡牌特效）
    const effectEnergyCount = Math.max(0, Math.floor(Number(pendingTurnEffects?.gold) || 0));

    // 2. 计算新的收入数组（Income Growth）
    const nextIncomeQueue = [...player.income];
    if (nextIncomeQueue.length < MAX_INCOME) {
      nextIncomeQueue.push(EnergyType.WHITE); // 每回合增加一个白色能量上限
    }

    // 3. 生成本回合的能量供给
    // 基础收入 + 特效生成的白色能量
    const generatedIncome = [...nextIncomeQueue];
    const generatedEffects = Array(effectEnergyCount).fill(EnergyType.WHITE);

    const newEnergyBatch = [...generatedIncome, ...generatedEffects];

    setPlayer(prev => ({
      ...prev,
      // 将新生成的能量添加到现有队列的末尾
      energyQueue: [...prev.energyQueue, ...newEnergyBatch],
      income: nextIncomeQueue, // 更新玩家的收入属性（已成长）
      adventurePoints: Math.min(prev.adventurePoints + 1, MAX_ADVENTURE_POINTS),
      tavernUpgradeCost: Math.max(0, prev.tavernUpgradeCost - 1),
    }));

    setEnemyConfig([]);
    setPendingTurnEffects(null);
    setRoundSummary(null);

    if (!isShopLocked) {
      refreshShop();
    } else {
      setIsShopLocked(false);
    }
    setPhase(GamePhase.SHOP);
  };

  const toggleLanguage = () => {
    handleInteraction();
    playSound('click');
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const handleRestart = () => {
    handleInteraction();
    playSound('click');
    setPhase(GamePhase.START_MENU);
    setRound(1);
    setIsInfiniteMode(false);
    setPlayer({
      hp: INITIAL_PLAYER_HP,
      energyQueue: [...INITIAL_ENERGY],
      income: [...INITIAL_INCOME], // 确保重置为初始数组
      adventurePoints: INITIAL_ADVENTURE_POINTS,
      tavernTier: 1,
      tavernUpgradeCost: getBaseTavernCost(1),
      hand: Array(7).fill(null)
    });
    setShopCards([]);
    setIsShopLocked(false);
    setEnemyConfig([]);
    setRoundSummary(null);
    setHoveredCardInfo(null);
    setNotifications([]);
    setPendingTurnEffects(null);
    setIsTransitioning(false);
  };

  if (phase === GamePhase.START_MENU) {
    return <StartMenu t={t} onStartGame={handleStartGame} onOpenCodex={handleOpenCodex} onToggleLanguage={toggleLanguage} onInteraction={handleInteraction} />;
  }

  if (phase === GamePhase.CODEX) {
    return (
      <>
        <Codex
          language={language}
          t={t}
          onBackToMenu={handleBackToMenu}
          onInteraction={handleInteraction}
          onHover={handleCardHover}
          onLeave={handleCardLeave}
        />
        {hoveredCardInfo && (
          <CardInfoPanel
            card={hoveredCardInfo.card}
            rect={hoveredCardInfo.rect}
            language={language}
          />
        )}
      </>
    );
  }

  if (phase === GamePhase.GAME_OVER) {
    return <GameOverScreen t={t} round={round} onRestart={handleRestart} />;
  }

  if (phase === GamePhase.VICTORY) {
    return <VictoryScreen t={t} onContinue={handleEnterInfiniteMode} onBackToMenu={handleBackToMenu} />;
  }

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black text-slate-100 font-sans flex flex-col h-screen overflow-hidden" onClick={handleInteraction}>
      <TopBar
        player={player}
        round={round}
        t={t}
        language={language}
        onBackToMenu={handleBackToMenu}
        onAbandon={handleRestart}
        phase={phase}
      />

      <div className="flex-1 flex flex-col relative min-h-0">
        {(phase === GamePhase.COMBAT || phase === GamePhase.ROUND_OVER) && (
          <div className="flex-1 p-6 flex items-center justify-center relative bg-slate-900">
            {phase === GamePhase.COMBAT && (
              <div className="w-full h-full flex items-center justify-center p-4">
                <div className="w-full max-w-6xl aspect-video relative shadow-2xl rounded-xl overflow-hidden border border-slate-700">
                  <BattleCanvas
                    playerHand={player.hand}
                    enemyConfig={enemyConfig}
                    playerValue={playerArmyValue}
                    enemyValue={enemyArmyValue}
                    language={language}
                    onBattleEnd={handleBattleEnd}
                    phase={phase}
                  />
                </div>
              </div>
            )}
            {phase === GamePhase.ROUND_OVER && roundSummary && (
              <RoundOverScreen summary={roundSummary} t={t} onNextRound={handleNextRound} />
            )}
          </div>
        )}

        {phase === GamePhase.SHOP && (
          <ShopScreen
            player={player}
            setPlayer={setPlayer}
            shopCards={shopCards}
            setShopCards={setShopCards}
            isShopLocked={isShopLocked}
            setIsShopLocked={setIsShopLocked}
            refreshShop={refreshShop}
            enemyConfig={nextEnemies}
            round={round}
            isTransitioning={isTransitioning}
            onStartCombat={startCombat}
            onCardHover={handleCardHover}
            onCardLeave={handleCardLeave}
            setNotifications={setNotifications}
            playSound={playSound}
            handleInteraction={handleInteraction}
            language={language}
            t={t}
          />
        )}

        <div className="fixed bottom-32 right-8 flex flex-col gap-2 pointer-events-none z-50">
          {notifications.map((note, i) => (
            <div key={i} className="bg-slate-900/90 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-right fade-in duration-300 flex items-center gap-3 backdrop-blur-md">
              <ChevronUp className="text-green-500" size={16} />
              <span className="font-bold text-sm">{note}</span>
            </div>
          ))}
        </div>

        {hoveredCardInfo && phase === GamePhase.SHOP && (
          <CardInfoPanel
            card={hoveredCardInfo.card}
            rect={hoveredCardInfo.rect}
            language={language}
          />
        )}
      </div>
    </div>
  );
};

export default App;