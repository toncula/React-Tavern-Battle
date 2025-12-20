
import React, { useState, useEffect } from 'react';
import { PlayerState, CardData, AdventureOption, UnitType, Rarity, Mood, OracleOmen } from '../../types';
import { Language, getTranslation, getCardText } from '../../translations';
import { useCardEffects } from '../../hooks/useCardEffects';
import { generateRandomCard, ADVENTURE_COST, ADVENTURE_REFUND, REFRESH_COST, getBaseTavernCost, MAX_ADVENTURE_POINTS } from '../../constants';
import ShopPanel from '../shop/ShopPanel';
import ArmyPanel from '../shop/cards/ArmyPanel';
import AdventureModal from '../modals/AdventureModal';
import AdventureResultModal from '../modals/AdventureResultModal';
import DiscoveryModal from '../modals/DiscoveryModal';
import { SoundType, playSound } from '../../services/audioService';
import { generateAdventureEvent, getAdventureRarity, generateOracleMood } from '../../services/adventureService';

interface ShopScreenProps {
  player: PlayerState;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>;
  shopCards: CardData[];
  setShopCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  isShopLocked: boolean;
  setIsShopLocked: React.Dispatch<React.SetStateAction<boolean>>;
  refreshShop: (tierOverride?: number) => void;
  enemyConfig: CardData[];
  round: number;
  isTransitioning: boolean;
  onStartCombat: () => void;
  onCardHover: (card: CardData, rect: DOMRect) => void;
  onCardLeave: () => void;
  setNotifications: React.Dispatch<React.SetStateAction<string[]>>;
  playSound: (type: SoundType) => void;
  handleInteraction: () => void;
  language: Language;
  t: any;
}

const ShopScreen: React.FC<ShopScreenProps> = ({
  player, setPlayer, shopCards, setShopCards,
  isShopLocked, setIsShopLocked, refreshShop,
  enemyConfig, round, isTransitioning, onStartCombat,
  onCardHover, onCardLeave, setNotifications,
  playSound, handleInteraction, language, t
}) => {
  // Local UI State
  const [shopViewMode, setShopViewMode] = useState<'SHOP' | 'INTEL'>('SHOP');
  
  // Adventure Interaction State
  const [pendingAdventureCardId, setPendingAdventureCardId] = useState<string | null>(null);
  const [adventureEvent, setAdventureEvent] = useState<string>("");
  const [adventureOptions, setAdventureOptions] = useState<AdventureOption[]>([]);
  const [adventureLoading, setAdventureLoading] = useState(false);
  const [adventureRarity, setAdventureRarity] = useState<Rarity>('COMMON');
  const [consultingMood, setConsultingMood] = useState(false);
  const [oracleOmen, setOracleOmen] = useState<OracleOmen | null>(null);
  
  // Adventure Result State
  const [selectedAdventureOption, setSelectedAdventureOption] = useState<AdventureOption | null>(null);

  const [cardsSoldThisTurn, setCardsSoldThisTurn] = useState(0);
  const [discoveryOptions, setDiscoveryOptions] = useState<CardData[] | null>(null);

  const { applyBuyEffects, applySellEffects, applyTavernUpgradeEffects } = useCardEffects(language);

  // Reset local turn stats when round changes
  useEffect(() => {
      setCardsSoldThisTurn(0);
  }, [round]);

  // --- Handlers ---

  const handleBuyCard = (card: CardData) => {
    handleInteraction();
    if (isTransitioning) return;
    if (player.gold < 3) {
        playSound('error');
        return;
    }

    const existingCopies = player.hand.filter(c => c !== null && c.templateId === card.templateId && !c.isGolden);
    
    if (existingCopies.length >= 2) {
        playSound('upgrade'); 
        playSound('victory');
        
        const copy1 = existingCopies[0]!;
        const copy2 = existingCopies[1]!;
        
        const handWithoutCopies = player.hand.map(c => (c && c.id === copy1.id) || (c && c.id === copy2.id) ? null : c);
        
        let insertIndex = player.hand.indexOf(copy1);
        if (insertIndex === -1) insertIndex = player.hand.indexOf(copy2);
        if (insertIndex === -1) insertIndex = handWithoutCopies.findIndex(c => c === null);

        const goldenCard: CardData = {
            ...card,
            id: `golden_${Date.now()}`,
            unitCount: copy1.unitCount + copy2.unitCount + card.unitCount,
            value: copy1.value + copy2.value + card.value, 
            traits: [...copy1.traits, ...copy2.traits, ...card.traits],
            isGolden: true,
            justBought: Date.now(),
            upgrades: []
        };

        const newHand = [...handWithoutCopies];
        newHand[insertIndex] = goldenCard;

        setPlayer(prev => ({
            ...prev,
            gold: prev.gold - 3,
            hand: newHand
        }));
        
        setShopCards(prev => prev.filter(c => c.id !== card.id));
        onCardLeave();

        const rewardTier = Math.min(4, player.tavernTier + 1);
        const rewards = [
            generateRandomCard(rewardTier, rewardTier),
            generateRandomCard(rewardTier, rewardTier),
            generateRandomCard(rewardTier, rewardTier)
        ];
        setDiscoveryOptions(rewards);

    } else {
        const emptyIndex = player.hand.findIndex(c => c === null);
        if (emptyIndex === -1) {
          alert(t.adventure.army_full);
          playSound('error');
          return;
        }

        playSound('buy');
        
        let purchasedCard: CardData = { 
            ...card, 
            id: `p_${Date.now()}_${Math.random()}`,
            justBought: Date.now(),
            upgrades: []
        };
        const result = applyBuyEffects(purchasedCard, player.hand);
        purchasedCard = result.card;
        
        if (result.notification) {
            setNotifications(prev => [...prev, result.notification!]);
        }

        const newHand = [...player.hand];
        newHand[emptyIndex] = purchasedCard;

        if (result.extraCards && result.extraCards.length > 0) {
            result.extraCards.forEach(extra => {
                const nextEmpty = newHand.findIndex(c => c === null);
                if (nextEmpty !== -1) {
                    newHand[nextEmpty] = { ...extra, justBought: Date.now() };
                }
            });
        }
        
        if (purchasedCard.specialEffect === 'MELEE_BUFF_ON_ENTER') {
            const multiplier = purchasedCard.isGolden ? 2 : 1;
            newHand.forEach((c, idx) => {
                if (c && c.unitType === UnitType.MELEE) {
                    newHand[idx] = { ...c, unitCount: c.unitCount + (1 * multiplier) };
                }
            });
        }

        setPlayer(prev => ({
          ...prev,
          gold: prev.gold - 3,
          hand: newHand
        }));
        setShopCards(prev => prev.filter(c => c.id !== card.id));
        onCardLeave();
    }
  };

  const handleSellCard = (card: CardData) => {
    handleInteraction();
    if (isTransitioning) return;
    playSound('sell');
    const index = player.hand.findIndex(c => c && c.id === card.id);
    const handWithGap = player.hand.map(c => (c && c.id === card.id ? null : c));

    const { newHand, notifications: sellNotes } = applySellEffects(card, index, handWithGap, cardsSoldThisTurn);
    
    if (sellNotes.length > 0) {
        setNotifications(prev => [...prev, ...sellNotes]);
    }

    setCardsSoldThisTurn(prev => prev + 1);

    setPlayer(prev => ({
      ...prev,
      gold: prev.gold + 1,
      hand: newHand
    }));
    onCardLeave();
  };

  const handleSelectDiscovery = (card: CardData) => {
      handleInteraction();
      if (isTransitioning) return;
      playSound('upgrade');
      
      const emptyIndex = player.hand.findIndex(c => c === null);
      if (emptyIndex === -1) {
          alert(t.adventure.army_full_reward);
          return;
      }
      
      let rewardCard: CardData = { 
          ...card, 
          id: `reward_${Date.now()}`,
          justBought: Date.now(),
          upgrades: []
      };
      const result = applyBuyEffects(rewardCard, player.hand);
      rewardCard = result.card;

      if (result.notification) {
         setNotifications(prev => [...prev, result.notification!]);
      }
      
      const newHand = [...player.hand];
      newHand[emptyIndex] = rewardCard;
      
      if (result.extraCards && result.extraCards.length > 0) {
        result.extraCards.forEach(extra => {
            const nextEmpty = newHand.findIndex(c => c === null);
            if (nextEmpty !== -1) {
                newHand[nextEmpty] = { ...extra, justBought: Date.now() };
            }
        });
      }

      setPlayer(prev => ({
          ...prev,
          hand: newHand
      }));
      setDiscoveryOptions(null);
      onCardLeave();
  };

  const handleRefreshShopInternal = () => {
    handleInteraction();
    if (isTransitioning) return;
    if (player.gold < REFRESH_COST) {
        playSound('error');
        return;
    }
    playSound('click');
    setPlayer(prev => ({ ...prev, gold: prev.gold - REFRESH_COST }));
    setIsShopLocked(false); 
    refreshShop();
  };

  const handleToggleLock = () => {
      handleInteraction();
      if (isTransitioning) return;
      playSound('click');
      setIsShopLocked(!isShopLocked);
  };

  const handleLevelUpTavern = () => {
    handleInteraction();
    if (isTransitioning) return;
    const cost = player.tavernUpgradeCost;
    if (player.gold < cost || player.tavernTier >= 4) {
        playSound('error');
        return;
    }
    playSound('upgrade');

    const { newHand, notifications: upgradeNotes } = applyTavernUpgradeEffects(player.hand);

    if (upgradeNotes.length > 0) {
        setNotifications(prev => [...prev, ...upgradeNotes]);
    }

    setPlayer(prev => ({
      ...prev,
      gold: prev.gold - cost,
      tavernTier: prev.tavernTier + 1,
      tavernUpgradeCost: getBaseTavernCost(prev.tavernTier + 1),
      hand: newHand
    }));
  };

  const handleRequestAdventure = (card: CardData) => {
    handleInteraction();
    if (isTransitioning) return;
    if (player.adventurePoints < ADVENTURE_COST) {
        playSound('error');
        return;
    }
    
    // Pay cost immediately
    setPlayer(prev => ({ ...prev, adventurePoints: prev.adventurePoints - ADVENTURE_COST }));
    playSound('click');
    setPendingAdventureCardId(card.id);
    const rarity = getAdventureRarity(card);
    setAdventureRarity(rarity);
    setOracleOmen(null);
    setConsultingMood(false);
    setAdventureOptions([]);
    setAdventureEvent("");
  };

  const handleConsultOracle = async () => {
    handleInteraction();
    const card = player.hand.find(c => c && c.id === pendingAdventureCardId);
    if (!card) return;

    setConsultingMood(true);
    playSound('click');
    try {
        const omen = await generateOracleMood(card, round, player.hp, language);
        setOracleOmen(omen);
    } catch (e) {
        console.error(e);
        cancelAdventure();
    } finally {
        setConsultingMood(false);
    }
  };

  const handleProceedToAdventure = () => {
    handleInteraction();
    const card = player.hand.find(c => c && c.id === pendingAdventureCardId);
    if (!card || !oracleOmen) return;
    playSound('upgrade');
    startAdventureGeneration(card, oracleOmen.mood, oracleOmen.text, oracleOmen.tongue);
  };

  const startAdventureGeneration = async (card: CardData, mood: Mood, omenText: string, tongue: string) => {
    setAdventureLoading(true);
    try {
        const result = await generateAdventureEvent(card, language, mood, omenText, tongue);
        setAdventureEvent(result.event);
        setAdventureOptions(result.options);
    } catch (e) {
        console.error(e);
        cancelAdventure();
    } finally {
        setAdventureLoading(false);
    }
  };

  const handleSelectAdventureOption = (option: AdventureOption) => {
    playSound('click');
    setSelectedAdventureOption(option);
  };

  const confirmAdventureResult = () => {
    if (!pendingAdventureCardId || !selectedAdventureOption) return;
    
    playSound('upgrade');
    const newHand = player.hand.map(c => {
        if (c && c.id === pendingAdventureCardId) {
            const newTraits = [...c.traits, { name: selectedAdventureOption.traitName, rarity: adventureRarity }];
            
            let updatedCard: CardData = {
                ...c,
                traits: newTraits,
                lastAdventureEvent: adventureEvent,
                lastAdventureDescription: selectedAdventureOption.description
            };

            if (selectedAdventureOption.outcomeType === 'CHANGE' && selectedAdventureOption.statChange) {
                updatedCard = { 
                    ...updatedCard, 
                    baseStats: { 
                        ...c.baseStats, 
                        hp: selectedAdventureOption.statChange.hp, 
                        damage: selectedAdventureOption.statChange.damage,
                        attackCooldown: selectedAdventureOption.statChange.attackCooldown
                    }
                };
            } else if (selectedAdventureOption.outcomeType === 'PROMOTION' && selectedAdventureOption.promotionUnit) {
                updatedCard = {
                    ...updatedCard,
                    templateId: `promoted_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    name: selectedAdventureOption.promotionUnit.name,
                    description: selectedAdventureOption.promotionUnit.description,
                    unitType: selectedAdventureOption.promotionUnit.unitType,
                    baseStats: { 
                        ...selectedAdventureOption.promotionUnit.baseStats,
                        color: selectedAdventureOption.promotionUnit.baseStats.color
                    },
                    specialEffect: selectedAdventureOption.promotionUnit.specialEffect || c.specialEffect,
                    value: Math.round(c.value * 1.5)
                };
            }
            return updatedCard;
        }
        return c;
    });
    setPlayer(prev => ({
      ...prev,
      hand: newHand
    }));
    
    setPendingAdventureCardId(null);
    setSelectedAdventureOption(null);
    setOracleOmen(null);
    setAdventureOptions([]);
  };

  const cancelAdventure = () => {
    if (pendingAdventureCardId) {
        playSound('click');
        let refund = ADVENTURE_COST;
        if (oracleOmen) {
            refund = ADVENTURE_REFUND; // 1
        }
        
        setPlayer(prev => ({ ...prev, adventurePoints: Math.min(prev.adventurePoints + refund, MAX_ADVENTURE_POINTS) }));
        setPendingAdventureCardId(null);
        setSelectedAdventureOption(null);
        setOracleOmen(null);
        setAdventureOptions([]);
    }
  };

  const nextEmptySlotIndex = player.hand.findIndex(c => c === null);
  const playerArmyValue = player.hand.reduce((total, card) => total + (card ? card.value : 0), 0);
  const unitCount = player.hand.filter(c => c !== null).length;

  return (
    <>
        <ShopPanel 
            player={player} 
            shopCards={shopCards} 
            isShopLocked={isShopLocked}
            shopViewMode={shopViewMode}
            isTransitioning={isTransitioning}
            nextEnemies={enemyConfig}
            t={t}
            language={language}
            refreshCost={REFRESH_COST}
            onLevelUpTavern={handleLevelUpTavern}
            onToggleLock={handleToggleLock}
            onRefreshShop={handleRefreshShopInternal}
            onToggleViewMode={() => setShopViewMode(prev => prev === 'SHOP' ? 'INTEL' : 'SHOP')}
            onStartCombat={onStartCombat}
            onBuyCard={handleBuyCard}
            onCardHover={onCardHover}
            onCardLeave={onCardLeave}
        />
        
        <ArmyPanel 
            player={player}
            playerArmyValue={playerArmyValue}
            unitCount={unitCount}
            language={language}
            t={t}
            UPGRADE_COST={ADVENTURE_COST}
            isTransitioning={isTransitioning}
            nextEmptySlotIndex={nextEmptySlotIndex}
            onSellCard={handleSellCard}
            onRequestUpgrade={handleRequestAdventure}
            onCardHover={onCardHover}
            onCardLeave={onCardLeave}
        />

        {pendingAdventureCardId && !selectedAdventureOption && (() => {
            const card = player.hand.find(c => c && c.id === pendingAdventureCardId);
            if (!card) return null;
            return (
                <AdventureModal 
                    card={card} 
                    event={adventureEvent}
                    options={adventureOptions} 
                    rarity={adventureRarity}
                    loading={adventureLoading}
                    language={language}
                    onSelect={handleSelectAdventureOption} 
                    onCancel={cancelAdventure}
                    onConsult={handleConsultOracle}
                    onProceed={handleProceedToAdventure}
                    consulting={consultingMood}
                    omen={oracleOmen}
                />
            );
        })()}

        {pendingAdventureCardId && selectedAdventureOption && (() => {
             const card = player.hand.find(c => c && c.id === pendingAdventureCardId);
             if (!card) return null;
             return (
                 <AdventureResultModal
                    card={card}
                    option={selectedAdventureOption}
                    rarity={adventureRarity}
                    language={language}
                    onConfirm={confirmAdventureResult}
                 />
             )
        })()}

        {discoveryOptions && (
            <DiscoveryModal 
                options={discoveryOptions} 
                language={language}
                onSelect={handleSelectDiscovery} 
                onHover={onCardHover}
                onLeave={onCardLeave}
            />
        )}
    </>
  );
};

export default ShopScreen;
