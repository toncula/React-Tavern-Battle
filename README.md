# React Tavern Battle ⚔️

**React Tavern Battle** is a remake of the well known Starcraft2 Arcade Map **Sc Tavern Battle**.

It is a strategy deck-builder game that combines the economy management of auto-battlers (like Hearthstone Battlegrounds) with a real-time strategy (RTS) combat simulation.
The project include a single player campaign at the moment.

Powered by **React**, **HTML5 Canvas**, and the **Google Gemini API**, this game features dynamic unit evolutions and AI-driven narrative adventures.

## 🎮 Gameplay Features

*   **RTS Combat Engine**: Unlike turn-based card games, units are deployed onto a 2D battlefield where they move, attack in real-time.
*   **The Tavern (Shop)**: Manage your Gold to buy units, sell for income, and upgrade your Tavern tier to find stronger units.
*   **AI Adventures (The Oracle)**: Consult the Oracle (powered by Google Gemini) to send units on text-based adventures. The AI generates unique narratives based on the result that the rule engine offered.
*   **Synergy System**: Build compositions based on Unit Types (Melee, Ranged, Splash, Buffer, Hero) and specific card effects (e.g., "Grow when ally sold").
*   **Codex**: A built-in encyclopedia to view all available units, enemies, and game rules.

## 📂 Project Structure

The project is organized into logical modules separating UI, Game Logic, and Data.

```
.
├── components/          # React UI Components
│   ├── battle/          # The Canvas wrapper and Battle visualizers
│   ├── modals/          # Dialogs for Upgrades, Adventures, and Discovery
│   ├── screens/         # Top-level views (Start Menu, Shop, Codex, Victory)
│   └── shop/            # The main management interface (Cards, Army Panel)
├── data/                # Static Game Data
│   ├── cardTemplates.ts # Definitions for player units
│   ├── enemySettings.ts # Definitions for enemy waves
│   └── upgrades.ts      # Legacy upgrade definitions
├── hooks/               # Custom React Hooks
│   └── useCardEffects.ts# Logic for card triggers (Buy/Sell/Turn End effects)
├── services/            # External Services
│   ├── adventureService.ts # Google Gemini API integration for AI events
│   └── audioService.ts  # Web Audio API synthesizer (no external assets)
├── simulation/          # The Game Engine (Pure Logic)
│   ├── BattleEngine.ts  # Physics, collision, targeting, and damage logic
│   └── BattleRenderer.ts# Canvas rendering logic (draws units, particles)
├── types.ts             # TypeScript definitions and interfaces
├── constants.ts         # Game balance config and physics constants
├── translations.ts      # Internationalization (English/Chinese)
├── App.tsx              # Main Game Controller
└── index.tsx            # Entry point
```

### Key Modules Explained

1.  **`simulation/`**: This is the heart of the combat.
    *   `BattleEngine.ts`: Runs the physics loop detached from React state to ensure performance. It handles movement vectors, cooldowns, and projectile calculations.
    *   `BattleRenderer.ts`: Takes the engine state and draws it to the HTML5 Canvas frame-by-frame.

2.  **`services/adventureService.ts`**:
    *   Handles the connection to Google's Gemini API.
    *   Generates "Omens" (Narrative flavor) and determines mechanical outcomes (Buffs, Debuffs, or Transformations) based on the unit's context.

3.  **`components/shop/`**:
    *   Manages the "Peace" phase of the game where the player builds their deck (Hand).

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **AI**: Google Gemini API (`@google/genai`)
*   **Graphics**: HTML5 Canvas API
*   **Icons**: Lucide React
*   **Build Tool**: (Assumed Vite or similar in local environment)

## 🚀 Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/react-tavern-battle.git
    cd react-tavern-battle
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure API Key**:
    *   Get a Google Gemini API Key from [Google AI Studio](https://aistudiocdn.com/ai.google.dev).
    *   Create a `.env` file in the root directory:
        ```env
        API_KEY=your_gemini_api_key_here
        ```
    *   *Note: In the live demo environment, the key is handled via `process.env.API_KEY` injection.*

4.  **Run the development server**:
    ```bash
    npm start
    # or
    npm run dev
    ```

## 📄 License

[MIT](LICENSE)
