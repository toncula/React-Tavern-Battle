
import { CardData, UnitType } from '../types';
import { CARD_TEMPLATES } from '../constants';
import { Language, getCardText, getTranslation } from '../translations';

export interface TurnEndResult {
    newHand: (CardData | null)[];
    goldGenerated: number;
    notifications: string[];
    summaryEffects: string[]; 
}

export interface BuyResult {
    card: CardData;
    notification?: string;
    extraCards?: CardData[];
}

export const useCardEffects = (language: Language) => {
    const t = getTranslation(language);

    /**
     * Applies effects that trigger immediately upon buying a card
     */
    const applyBuyEffects = (purchasedCard: CardData, currentHand: (CardData | null)[]): BuyResult => {
        let updatedCard = { ...purchasedCard };
        let notification = undefined;
        let extraCards: CardData[] = [];

        // MAGE / TREBUCHET Logic (ENTRY_TYPE_GROWTH)
        if (updatedCard.specialEffect === 'ENTRY_TYPE_GROWTH') {
            const uniqueTypes = new Set<UnitType>();
            // Count types currently in hand
            currentHand.forEach(c => {
                if(c) uniqueTypes.add(c.unitType);
            });
            // Include self
            uniqueTypes.add(updatedCard.unitType);
            
            const multiplier = updatedCard.isGolden ? 2 : 1;
            const bonus = uniqueTypes.size * multiplier;
            updatedCard.unitCount += bonus;
            
            // notification = `${t.ui.effect_trigger} ${updatedCard.name} (+${bonus} ${t.ui.count})`;
        }

        // BALLISTA Logic (SUMMON_ESCORT)
        if (updatedCard.specialEffect === 'SUMMON_ESCORT') {
            const emptySlots = currentHand.filter(c => c === null).length;
            if (emptySlots >= 2) { // 1 for self, 1 for escort
                 const escortTemplate = CARD_TEMPLATES.find(t => t.templateId === 'c_escort');
                 if (escortTemplate) {
                      const escortCard: CardData = {
                         ...escortTemplate,
                         id: `token_${Date.now()}_${Math.random()}`,
                         // Added traits property to fix missing property error
                         traits: [],
                         upgrades: []
                     };
                     extraCards.push(escortCard);
                     // notification = `${updatedCard.name} summoned Escort!`;
                 }
            } else {
                 notification = `${updatedCard.name}: No space for Escort!`;
            }
        }
        
        return { card: updatedCard, notification, extraCards };
    };

    /**
     * Applies effects that trigger when a card is sold
     */
    const applySellEffects = (
        soldCard: CardData, 
        soldIndex: number, 
        currentHand: (CardData | null)[], 
        cardsSoldThisTurn: number
    ): { newHand: (CardData | null)[], notifications: string[] } => {
        const newHand = [...currentHand];
        const notifications: string[] = [];
        const multiplier = soldCard.isGolden ? 2 : 1;
        const soldCardName = getCardText(soldCard, language).name;

        // 1. RANGER LOGIC (Legacy)
        if (soldCard.specialEffect === 'SELL_BUFF_RIGHT') {
            const bonus = 1 * multiplier;
            if (soldIndex !== -1 && soldIndex + 1 < newHand.length) {
                const rightCard = newHand[soldIndex + 1];
                if (rightCard) {
                    newHand[soldIndex + 1] = {
                        ...rightCard,
                        unitCount: rightCard.unitCount + bonus
                    };
                    // notifications.push(`${soldCardName} -> ${getCardText(rightCard, language).name} (+${bonus})`);
                }
            }
        }

        // Global Hand Iteration for Passive Observers (Veteran, Crossbow, Mangonel, Merc, Musketeer)
        newHand.forEach((c, i) => {
            if (!c) return;
            const cName = getCardText(c, language).name;
            const cMult = c.isGolden ? 2 : 1;

            // VETERAN (SELL_TRIGGER_GROWTH) - First sell only
            if (c.specialEffect === 'SELL_TRIGGER_GROWTH' && cardsSoldThisTurn === 0) {
                const bonus = 1 * cMult;
                newHand[i] = { ...c, unitCount: c.unitCount + bonus };
                // notifications.push(`${t.ui.effect_trigger} ${cName} (+${bonus})`);
            }

            // CROSSBOWMEN (GROWTH_ON_SELL) - Every sell
            if (c.specialEffect === 'GROWTH_ON_SELL') {
                const bonus = 1 * cMult;
                newHand[i] = { ...c, unitCount: c.unitCount + bonus };
                // notifications.push(`${t.ui.effect_trigger} ${cName} (+${bonus})`);
            }

            // MANGONEL (GROWTH_ON_LARGE_SELL) - Sell card with > 10 units
            if (c.specialEffect === 'GROWTH_ON_LARGE_SELL' && soldCard.unitCount > 10) {
                const bonus = 2 * cMult;
                newHand[i] = { ...c, unitCount: c.unitCount + bonus };
                // notifications.push(`${t.ui.effect_trigger} ${cName} (+${bonus})`);
            }

            // MERCENARY (INHERIT_HALF_ON_SELL) - Gain 50%
            if (c.specialEffect === 'INHERIT_HALF_ON_SELL') {
                const bonus = Math.floor(soldCard.unitCount * 0.5) * cMult;
                if (bonus > 0) {
                    newHand[i] = { ...c, unitCount: c.unitCount + bonus };
                    // notifications.push(`${t.ui.effect_trigger} ${cName} (+${bonus})`);
                }
            }

            // MUSKETEER (GROWTH_ON_UPGRADED_SELL) - +3 per upgrade
            if (c.specialEffect === 'GROWTH_ON_UPGRADED_SELL' && soldCard.upgrades.length > 0) {
                const bonus = (soldCard.upgrades.length * 3) * cMult;
                newHand[i] = { ...c, unitCount: c.unitCount + bonus };
                // notifications.push(`${t.ui.effect_trigger} ${cName} (+${bonus})`);
            }
        });

        return { newHand, notifications };
    };

    /**
     * Applies effects that trigger when the Tavern is leveled up
     */
    const applyTavernUpgradeEffects = (currentHand: (CardData | null)[]): { newHand: (CardData | null)[], notifications: string[] } => {
        const notifications: string[] = [];
        const newHand = currentHand.map(c => {
            if (c && c.specialEffect === 'TAVERN_GROWTH') {
                const multiplier = c.isGolden ? 2 : 1;
                const bonus = 2 * multiplier;
                // notifications.push(`${t.ui.effect_trigger} ${getCardText(c, language).name} (+${bonus})`);
                return { ...c, unitCount: c.unitCount + bonus };
            }
            return c;
        });

        return { newHand, notifications };
    };

    /**
     * Calculates all End of Turn / Start of Turn effects.
     */
    const calculateTurnEndEffects = (currentHand: (CardData | null)[]): TurnEndResult => {
        let newHand = [...currentHand];
        const notifications: string[] = [];
        const summaryEffects: string[] = [];
        let goldGenerated = 0;

        // Find Leftmost Index for Observer
        const leftmostIndex = newHand.findIndex(c => c !== null);

        for (let i = 0; i < newHand.length; i++) {
            const card = newHand[i];
            if (!card) continue;
            
            const multiplier = card.isGolden ? 2 : 1;
            const cardName = getCardText(card, language).name;

            // MILITIA
            if (card.specialEffect === 'MILITIA_GROWTH') {
                const amount = 2 * multiplier;
                newHand[i] = { ...card, unitCount: card.unitCount + amount };
                
                const note = `${cardName}: +${amount} ${t.ui.count}`;
                // notifications.push(note);
                summaryEffects.push(note);
            }

            // SHIELDER
            if (card.specialEffect === 'ADJACENT_GROWTH') {
                let adjCount = 0;
                const left = newHand[i - 1];
                const right = newHand[i + 1];
                if (left && (left.unitType === UnitType.MELEE || left.unitType === UnitType.RANGED)) adjCount++;
                if (right && (right.unitType === UnitType.MELEE || right.unitType === UnitType.RANGED)) adjCount++;
                
                if (adjCount > 0) {
                    const amount = adjCount * multiplier;
                    newHand[i] = { ...card, unitCount: card.unitCount + amount };
                    
                    const note = `${cardName}: +${amount} ${t.ui.count}`;
                    // notifications.push(note);
                    summaryEffects.push(note);
                }
            }

            // SCOUTS
            if (card.specialEffect === 'PASSIVE_GOLD') {
                const amount = 1 * multiplier;
                goldGenerated += amount;
                
                const note = `${cardName}: +${amount} ${t.ui.gold}`;
                summaryEffects.push(note);
            }

            // OBSERVER (LEFTMOST_GROWTH)
            if (card.specialEffect === 'LEFTMOST_GROWTH') {
                 if (leftmostIndex !== -1 && newHand[leftmostIndex]) {
                     const target = newHand[leftmostIndex]!;
                     const amount = 1 * multiplier;
                     const targetName = getCardText(target, language).name;
                     
                     newHand[leftmostIndex] = { ...target, unitCount: target.unitCount + amount };
                     
                     const note = `${cardName} -> ${targetName}: +${amount}`;
                     // notifications.push(note);
                     summaryEffects.push(note);
                 }
            }
            
            // COMMANDER (ALL_MELEE_GROWTH)
            if (card.specialEffect === 'ALL_MELEE_GROWTH') {
                 // Commander buffs ALL Melee units.
                 const amount = 1 * multiplier;
                 let buffCount = 0;
                 
                 newHand.forEach((target, idx) => {
                     if (target && target.unitType === UnitType.MELEE) {
                         newHand[idx] = { ...target, unitCount: target.unitCount + amount };
                         buffCount++;
                     }
                 });
                 
                 if (buffCount > 0) {
                     const note = `${cardName}: Buffed ${buffCount} Melee units`;
                     // notifications.push(note);
                     summaryEffects.push(note);
                 }
            }
        }

        return { newHand, goldGenerated, notifications, summaryEffects };
    };

    return {
        applyBuyEffects,
        applySellEffects,
        applyTavernUpgradeEffects,
        calculateTurnEndEffects
    };
};
