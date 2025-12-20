

import { GoogleGenAI, Type } from "@google/genai";
import { CardData, AdventureOption, Rarity, AdventureOutcomeType, StatChange, Mood, OracleOmen } from "../types";
import { Language, TRANSLATIONS } from "../translations";
import { DEBUG_ADVENTURE_LOG } from "../constants";

/**
 * Calculates outcome weights based on the combination of Mood and Rarity.
 * The Mood defines the "base cosmic energy" of the event, while Rarity 
 * acts as a modifier/constraint on what forms that energy can take.
 */
const calculateOutcomeWeights = (rarity: Rarity, mood: Mood): Record<AdventureOutcomeType, number> => {
    // 1. Determine base weights by Mood [Neutral, Change, Promotion]
    const moodWeights: Record<Mood, [number, number, number]> = {
        'SUPER_GOOD': [0, 80, 20], // Only positive buffs. Have a chance of being promoted to a new form.
        'GOOD':       [20, 80, 0], // No debuffs. Gain steady bonus.
        'MODERATE':   [80, 20, 0], // Stable. Mostly no changes.
        'BAD':        [20, 80, 0]   // High risk. But there still could be some rewards.
    };

    let [n, c, p] = moodWeights[mood];

    // 2. Apply Rarity Modifiers
    switch (rarity) {            
        case 'LEGENDARY':
            p += c/2; // Legendary events have a high chance to promote units
            c -= c/2;
            break;
    }

    return {
        'NEUTRAL': Math.max(0, n),
        'CHANGE': Math.max(0, c),
        'PROMOTION': Math.max(0, p)
    };
};

/**
 * Deterministically generates mechanical outcomes for an adventure before calling AI
 */
const generateMechanicalOutcomes = (card: CardData, rarity: Rarity, mood: Mood): { outcomeType: AdventureOutcomeType; statChange?: StatChange }[] => {
    const outcomes: { outcomeType: AdventureOutcomeType; statChange?: StatChange }[] = [];
    const weights = calculateOutcomeWeights(rarity, mood);
    
    if (DEBUG_ADVENTURE_LOG) {
        console.log(`[AdventureService] Calculated Weights for ${mood}/${rarity}:`, weights);
    }

    for (let i = 0; i < 3; i++) {
        const totalWeight = weights.NEUTRAL + weights.CHANGE + weights.PROMOTION;
        const rand = Math.random() * totalWeight;
        let type: AdventureOutcomeType = 'NEUTRAL';
        
        let cumulative = 0;
        if (rand < (cumulative += weights.NEUTRAL)) type = 'NEUTRAL';
        else if (rand < (cumulative += weights.CHANGE)) type = 'CHANGE';
        else type = 'PROMOTION';

        // Safety check for Legendary/Rare to ensure variety
        if (i === 2 && outcomes.every(o => o.outcomeType === 'NEUTRAL') && rarity !== 'COMMON') {
            type = 'CHANGE';
        }

        let statChange: StatChange | undefined;
        if (type === 'CHANGE' || type === 'PROMOTION') {
            
            // Power of the outcome is influenced by mood
            const moodPower = mood === 'SUPER_GOOD' ? 1.5 : 
                             mood === 'GOOD' ? 1.0 : 
                             mood === 'BAD' ? 1.5 : 1.0;
            
            // Promotions no longer guarantee success, but amplify the change (good or bad)
            const promotionPower = type === 'PROMOTION' ? 1.2 : 1.0;

            // Success probability shifted by mood
            const successThreshold = mood === 'SUPER_GOOD' ? 0 : 
                                   mood === 'GOOD' ? 0 : 
                                   mood === 'BAD' ? 0.6 : 0.35;
            
            const getStatMultiplier = (isCooldown: boolean = false) => {
                const isBuff = Math.random() > successThreshold;
                const magnitude = (Math.random() * 0.4) * moodPower * promotionPower;
                
                if (isCooldown) {
                    // Buff reduces cooldown, debuff increases it
                    return isBuff ? (1 / (1 + magnitude)) : (1 + magnitude);
                } else {
                    // Buff increases stat, debuff decreases it
                    return isBuff ? (1 + magnitude) : (1 - (magnitude * 0.5));
                }
            };

            const hpMult = getStatMultiplier(false);
            const dmgMult = getStatMultiplier(false);
            const cdMult = getStatMultiplier(true);

            statChange = {
                hp: Math.max(10, Math.round(card.baseStats.hp * hpMult)),
                damage: Math.max(1, Math.round(card.baseStats.damage * dmgMult)),
                attackCooldown: Math.max(15, Math.round(card.baseStats.attackCooldown * cdMult))
            };
        }

        outcomes.push({ outcomeType: type, statChange });
    }
    return outcomes;
};

export const getAdventureRarity = (card: CardData): Rarity => {
    const traitCount = card.traits.length;
    if (traitCount === 0) return 'COMMON';
    if (traitCount === 1) return 'RARE';
    return 'LEGENDARY';
};

const stripMarkdown = (text: string): string => {
    return text.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
};

/**
 * PART 1: Decides Mood locally, then calls AI to decide the TONGUE and generate an OMEN.
 */
export const generateOracleMood = async (
    card: CardData,
    round: number,
    hp: number,
    language: Language
): Promise<OracleOmen> => {
    const rarity = getAdventureRarity(card);
    const decidedMood = decideMoodLocally(card, rarity);

    if (DEBUG_ADVENTURE_LOG) {
        console.log(`[AdventureService] Local Mood Decided: ${decidedMood} for ${card.name} (Rarity: ${rarity})`);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const moodSchema = {
        type: Type.OBJECT,
        properties: {
            tongue: { 
                type: Type.STRING, 
                description: "A short, flavor-rich description of the narrative voice (e.g., 'The Oracle speaks in clockwork clicks', 'The Oracle whispers with a bleeding voice')." 
            },
            omen: { 
                type: Type.STRING, 
                description: "A cryptic flavor text describing the oracle's vision for this unit, matching the decided mood." 
            }
        },
        required: ["tongue", "omen"]
    };

    const prompt = `
        You are the Oracle. A unit named "${card.name}" (Type: ${card.unitType}) seeks guidance.
        CONTEXT:
        - Event Rarity: ${rarity}
        - PRE-DETERMINED COSMIC ALIGNMENT (MOOD): ${decidedMood}

        YOUR TASK:
        1. Decide a unique "Tongue" (narrative style) for yourself in this moment. 
        2. Write a cryptic Omen. The Omen MUST reflect the pre-determined mood:
           - SUPER_GOOD: Vision of overwhelming power or miraculous evolution.
           - GOOD: Favorable winds and growth.
           - MODERATE: Tests of endurance or neutral observation.
           - BAD: Omens of loss, sacrifice, or the abyss.

        Language: ${language === 'en' ? 'English' : 'Chinese'}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: moodSchema
            }
        });

        const data = JSON.parse(stripMarkdown(response.text));
        
        if (DEBUG_ADVENTURE_LOG) {
            console.log("[AdventureService] Oracle Result:", data);
        }

        return {
            mood: decidedMood,
            text: data.omen,
            tongue: data.tongue
        };
    } catch (e) {
        if (DEBUG_ADVENTURE_LOG) console.error("[AdventureService] Oracle Generation Error:", e);
        return { 
            mood: decidedMood, 
            text: TRANSLATIONS[language].adventure.mists_refuse, 
            tongue: language === 'en' ? "The Oracle is silent." : "先知保持缄默。" 
        };
    }
};

/**
 * Deterministically decides the Mood locally based on game state
 */
const decideMoodLocally = (card: CardData, rarity: Rarity): Mood => {
    const rand = Math.random();
    
    // Default weights for Common
    let weights: Record<Mood, number> = {
        'SUPER_GOOD': 0,
        'GOOD': 0.1,
        'MODERATE': 0.8,
        'BAD': 0.1
    };

    if (rarity === 'RARE') {
        weights = {
            'SUPER_GOOD': 0.1,
            'GOOD': 0.4,
            'MODERATE': 0.30,
            'BAD': 0.20
        };
    } else if (rarity === 'LEGENDARY') {
        weights = {
            'SUPER_GOOD': 0.4,
            'GOOD': 0.2,
            'MODERATE': 0,
            'BAD': 0.4
        };
    }

    let cumulative = 0;
    if (rand < (cumulative += weights.SUPER_GOOD)) return 'SUPER_GOOD';
    if (rand < (cumulative += weights.GOOD)) return 'GOOD';
    if (rand < (cumulative += weights.MODERATE)) return 'MODERATE';
    return 'BAD';
};

export const generateAdventureEvent = async (
    card: CardData,
    language: Language,
    mood: Mood,
    omenText?: string,
    tongue?: string // Pass the tongue to maintain style
): Promise<{ event: string; options: AdventureOption[] }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const rarity = getAdventureRarity(card);
    
    // PART 1: Local mechanical generation influenced by mood
    const mechanicalOutcomes = generateMechanicalOutcomes(card, rarity, mood);

    if (DEBUG_ADVENTURE_LOG) {
        console.log(`[AdventureService] Generating Event for ${card.name}. Rarity: ${rarity}, Mood: ${mood}, Tongue: ${tongue}`);
        console.log("[AdventureService] Mechanical Outcomes (Pre-determined):", mechanicalOutcomes);
    }

    // PART 2: Narrative Generation via AI (First Request)
    const adventureSchema = {
        type: Type.OBJECT,
        properties: {
            event: { 
                type: Type.STRING, 
                description: "A mysterious and thematic narrative hook for this event." 
            },
            options: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Action title (e.g., 'Drink the Void')" },
                        description: { type: Type.STRING, description: "What the unit does." },
                        traitName: { type: Type.STRING, description: "A creative name for the new trait gained." },
                        resultFlavor: { type: Type.STRING, description: "The story text of the outcome." }
                    },
                    required: ["title", "description", "traitName", "resultFlavor"]
                },
                minItems: 3,
                maxItems: 3
            }
        },
        required: ["event", "options"]
    };

    const outcomeDescriptions = mechanicalOutcomes.map((m, i) => {
        let desc = `Option ${i + 1}: ${m.outcomeType}.`;
        if (m.statChange) {
            // Determine BUFF or DEBUFF status qualitatively
            const hpStatus = m.statChange.hp >= card.baseStats.hp ? "BUFF" : "DEBUFF";
            const dmgStatus = m.statChange.damage >= card.baseStats.damage ? "BUFF" : "DEBUFF";
            // Cooldown reduction is a BUFF
            const cdStatus = m.statChange.attackCooldown <= card.baseStats.attackCooldown ? "BUFF" : "DEBUFF";
            
            desc += ` Mechanical results: Health [${hpStatus}], Damage [${dmgStatus}], Combat Speed [${cdStatus}].`;
        }
        if (m.outcomeType === 'PROMOTION') {
            desc += " This involves a complete transformation into a more specialized unit form.";
        }
        return desc;
    }).join("\n");

    const moodContext = mood ? `The decided mood is ${mood}.` : "The mood is neutral.";
    const historyContext = card.lastAdventureEvent ? `Previous adventure: "${card.lastAdventureEvent}". They last gained: "${card.lastAdventureDescription}".` : "";

    const prompt1 = 
    `
        Fantasy Dungeon Master mode: Write a narrative for an adventure for the unit "${card.name}".
        
        STYLING RULES:
        - Unit Context: ${card.unitType}, Current Traits: ${card.traits.map(t => t.name).join(", ") || "None"}
        - History: ${historyContext}
        - Cosmic Mood: ${moodContext}
        - Tongue/Style: ${tongue || "Standard Fantasy"}

        MECHANICAL OUTCOMES (Translate these qualitative states into a compelling story):
        ${outcomeDescriptions}

        MANDATORY RULES:
        1. The story must strictly align with the qualitative mechanical states (BUFF = something beneficial happened, DEBUFF = some form of sacrifice or curse).
        2. Language: ${language === 'en' ? 'English' : 'Chinese'}.
        3. Return JSON only.
    `;

    // Execute Request 1
    let data;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt1,
            config: {
                responseMimeType: "application/json",
                responseSchema: adventureSchema
            }
        });
        data = JSON.parse(stripMarkdown(response.text));
        
        if (DEBUG_ADVENTURE_LOG) {
            console.log("[AdventureService] AI Narrative response (Round 1):", data);
        }

    } catch (e) {
        if (DEBUG_ADVENTURE_LOG) console.error("[AdventureService] Event Generation Error:", e);
        throw e;
    }

    // PART 3: Promotion Generation (Second Request if needed)
    // We only ask for the COLOR now, using traitName and resultFlavor as the identity.
    const promotionIndices = mechanicalOutcomes
        .map((m, i) => m.outcomeType === 'PROMOTION' ? i : -1)
        .filter(i => i !== -1);
    
    const promotionDetails: Record<number, { color: string }> = {};

    if (promotionIndices.length > 0) {
        const promoPromises = promotionIndices.map(async (index) => {
            const optionData = data.options[index];
            
            const promotionSchema = {
                type: Type.OBJECT,
                properties: {
                    color: { type: Type.STRING, description: "A vibrant Hex color code for the new form." }
                },
                required: ["color"]
            };

            const prompt2 = `
                The unit "${card.name}" is evolving into a new form named "${optionData.traitName}".
                
                Context:
                - Description: "${optionData.resultFlavor}"
                - Original Color: ${card.baseStats.color}
                - Theme: ${mood}

                Task:
                Generate a unique and vibrant Hex color code for this new unit form.
                
                Return JSON only.
            `;
            
            try {
                const promoResp = await ai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: prompt2,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: promotionSchema
                    }
                });
                const promoJson = JSON.parse(stripMarkdown(promoResp.text));
                promotionDetails[index] = promoJson;
                
                if (DEBUG_ADVENTURE_LOG) {
                    console.log("[AdventureService] Promotion Details (Round 2):", promoJson);
                }
            } catch (e) {
                console.error("Promo gen error", e);
                // Fallback
                promotionDetails[index] = { color: "#fbbf24" };
            }
        });

        await Promise.all(promoPromises);
    }

    // PART 4: Assembly
    const finalOptions: AdventureOption[] = data.options.map((opt: any, index: number) => {
        const mech = mechanicalOutcomes[index];
        const option: AdventureOption = {
            title: opt.title,
            description: opt.description,
            traitName: opt.traitName,
            resultFlavor: opt.resultFlavor,
            outcomeType: mech.outcomeType,
            statChange: mech.statChange
        };

        if (mech.outcomeType === 'PROMOTION') {
            const promo = promotionDetails[index] || {
                color: "#fde047"
            };

            option.promotionUnit = {
                name: opt.traitName, // Use the traitName from Request 1
                description: opt.resultFlavor, // Use the flavor text from Request 1
                unitType: card.unitType,
                baseStats: {
                    ...card.baseStats,
                    hp: mech.statChange?.hp || card.baseStats.hp,
                    damage: mech.statChange?.damage || card.baseStats.damage,
                    attackCooldown: mech.statChange?.attackCooldown || card.baseStats.attackCooldown,
                    color: promo.color // The only thing we asked Gemini for in Round 2
                }
            };
        }

        return option;
    });

    return { event: data.event, options: finalOptions };
};
