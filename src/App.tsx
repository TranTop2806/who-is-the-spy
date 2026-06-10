import { useState } from "react";
import { GameSelector } from "./components/GameSelector";

// Spy components
import { SpySetup } from "./components/SpySetup";
import { CardReveal } from "./components/CardReveal";
import { SpyBoard } from "./components/SpyBoard";
import { SpyGameOver } from "./components/SpyGameOver";
import { WORD_DATABASE } from "./data/words";
import type { WordPair } from "./data/words";

// Drinking components
import { DrinkingSetup } from "./components/DrinkingSetup";
import { DrinkingBoard } from "./components/DrinkingBoard";
import { DrinkingGameOver } from "./components/DrinkingGameOver";
import { generateDeck } from "./data/drinkingCards";
import type { DrinkingCard } from "./data/drinkingCards";

// Type definitions for Who is the Spy
interface SpyPlayer {
  id: string;
  name: string;
  role: "CIVILIAN" | "SPY" | "MR_WHITE";
  word: string;
  isAlive: boolean;
  hasSeenWord: boolean;
}

interface SpyConfig {
  playerNames: string[];
  spyCount: number;
  mrWhiteCount: number;
  category: string;
  customCivilianWord: string;
  customSpyWord: string;
  showRoles: boolean;
}

// Type definitions for Do or Drink
interface DrinkConfig {
  playerNames: string[];
  pack: "CLASSIC" | "GEN_Z" | "MIXED";
  penaltyUnit: string;
}

export default function App() {
  const [activeGame, setActiveGame] = useState<"SELECTOR" | "SPY" | "DRINK">("SELECTOR");

  // ==========================================
  // WHO IS THE SPY STATES
  // ==========================================
  const [spyScreen, setSpyScreen] = useState<"SETUP" | "REVEAL" | "PLAY" | "GAMEOVER">("SETUP");
  const [spyPlayers, setSpyPlayers] = useState<SpyPlayer[]>([]);
  const [spyCivilianWord, setSpyCivilianWord] = useState<string>("");
  const [spyWordState, setSpyWordState] = useState<string>("");
  const [spyCategory, setSpyCategory] = useState<string>("");
  const [spyRound, setSpyRound] = useState<number>(1);
  const [spyWinner, setSpyWinner] = useState<"CIVILIAN" | "SPY" | "MR_WHITE" | null>(null);
  const [spyMrWhiteGuess, setSpyMrWhiteGuess] = useState<string | null>(null);
  const [spyMrWhiteGuessCorrect, setSpyMrWhiteGuessCorrect] = useState<boolean | null>(null);
  const [spyConfig, setSpyConfig] = useState<SpyConfig | null>(null);

  // ==========================================
  // DO OR DRINK STATES
  // ==========================================
  const [drinkScreen, setDrinkScreen] = useState<"SETUP" | "PLAY" | "GAMEOVER">("SETUP");
  const [drinkPlayers, setDrinkPlayers] = useState<string[]>([]);
  const [drinkDeck, setDrinkDeck] = useState<DrinkingCard[]>([]);
  const [drinkPenaltyUnit, setDrinkPenaltyUnit] = useState<string>("hớp");
  const [drinkPlayerStats, setDrinkPlayerStats] = useState<{
    [playerName: string]: { completed: number; drank: number };
  }>({});
  const [drinkConfig, setDrinkConfig] = useState<DrinkConfig | null>(null);

  // ==========================================
  // UTILS & HELPERS
  // ==========================================
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  };

  // ==========================================
  // WHO IS THE SPY HANDLERS
  // ==========================================
  const handleStartSpyGame = (configData: SpyConfig) => {
    setSpyConfig(configData);
    const { playerNames, spyCount, mrWhiteCount, category: chosenCategory, customCivilianWord, customSpyWord } = configData;

    let civWord = "";
    let spWord = "";
    let activeCategory = chosenCategory;

    if (chosenCategory === "Tự nhập từ khóa") {
      civWord = customCivilianWord.trim();
      spWord = customSpyWord.trim();
    } else {
      const filteredPairs = chosenCategory === "Tất cả" 
        ? WORD_DATABASE 
        : WORD_DATABASE.filter(pair => pair.category === chosenCategory);

      if (filteredPairs.length === 0) {
        civWord = "Chó";
        spWord = "Mèo";
        activeCategory = "Đời sống";
      } else {
        const randomPair: WordPair = filteredPairs[Math.floor(Math.random() * filteredPairs.length)];
        civWord = randomPair.civilian;
        spWord = randomPair.spy;
        activeCategory = randomPair.category;
      }
    }

    setSpyCivilianWord(civWord);
    setSpyWordState(spWord);
    setSpyCategory(activeCategory);

    const totalPlayers = playerNames.length;
    const civilianCount = totalPlayers - spyCount - mrWhiteCount;

    const rolePool: ("CIVILIAN" | "SPY" | "MR_WHITE")[] = [];
    for (let i = 0; i < civilianCount; i++) rolePool.push("CIVILIAN");
    for (let i = 0; i < spyCount; i++) rolePool.push("SPY");
    for (let i = 0; i < mrWhiteCount; i++) rolePool.push("MR_WHITE");

    const shuffledRoles = shuffleArray(rolePool);

    const generatedPlayers: SpyPlayer[] = playerNames.map((name, index) => {
      const role = shuffledRoles[index];
      return {
        id: `player-${index}-${Date.now()}`,
        name: name.trim(),
        role,
        word: role === "CIVILIAN" ? civWord : role === "SPY" ? spWord : "",
        isAlive: true,
        hasSeenWord: false,
      };
    });

    setSpyPlayers(generatedPlayers);
    setSpyRound(1);
    setSpyWinner(null);
    setSpyMrWhiteGuess(null);
    setSpyMrWhiteGuessCorrect(null);
    setSpyScreen("REVEAL");
  };

  const handleSpyPlayerSeen = (index: number) => {
    setSpyPlayers(prev => {
      const updated = [...prev];
      updated[index].hasSeenWord = true;
      return updated;
    });
  };

  const checkSpyWinConditions = (updatedPlayers: SpyPlayer[]): "CIVILIAN" | "SPY" | "MR_WHITE" | null => {
    const alive = updatedPlayers.filter(p => p.isAlive);
    const activeCivilians = alive.filter(p => p.role === "CIVILIAN");
    const activeSpies = alive.filter(p => p.role === "SPY");
    const activeMrWhites = alive.filter(p => p.role === "MR_WHITE");

    const civiliansCount = activeCivilians.length;
    const spiesCount = activeSpies.length;
    const mrWhitesCount = activeMrWhites.length;
    const badGuysCount = spiesCount + mrWhitesCount;

    if (badGuysCount === 0) {
      return "CIVILIAN";
    }

    if (badGuysCount >= civiliansCount) {
      if (spiesCount > 0) {
        return "SPY";
      } else {
        return "MR_WHITE";
      }
    }

    return null;
  };

  const handleSpyEliminatePlayer = (playerId: string) => {
    const updatedPlayers = spyPlayers.map(p => {
      if (p.id === playerId) {
        return { ...p, isAlive: false };
      }
      return p;
    });
    
    setSpyPlayers(updatedPlayers);

    const targetPlayer = spyPlayers.find(p => p.id === playerId);
    if (targetPlayer && targetPlayer.role === "MR_WHITE") {
      return;
    }

    const gameWinner = checkSpyWinConditions(updatedPlayers);
    if (gameWinner) {
      setSpyWinner(gameWinner);
      setSpyScreen("GAMEOVER");
    } else {
      setSpyRound(prev => prev + 1);
    }
  };

  const handleSpyMrWhiteGuess = (isCorrect: boolean, guess: string) => {
    setSpyMrWhiteGuess(guess);
    setSpyMrWhiteGuessCorrect(isCorrect);

    if (isCorrect) {
      setSpyWinner("MR_WHITE");
      setSpyScreen("GAMEOVER");
    } else {
      const gameWinner = checkSpyWinConditions(spyPlayers);
      if (gameWinner) {
        setSpyWinner(gameWinner);
        setSpyScreen("GAMEOVER");
      } else {
        setSpyRound(prev => prev + 1);
      }
    }
  };

  const handleSpyNextRoundWithoutElimination = () => {
    setSpyRound(prev => prev + 1);
  };

  const handleSpyPlayAgain = () => {
    if (spyConfig) {
      handleStartSpyGame(spyConfig);
    } else {
      setSpyScreen("SETUP");
    }
  };

  // ==========================================
  // DO OR DRINK HANDLERS
  // ==========================================
  const handleStartDrinkGame = (configData: DrinkConfig) => {
    setDrinkConfig(configData);
    const { playerNames, pack, penaltyUnit: unit } = configData;

    setDrinkPlayers(playerNames);
    setDrinkPenaltyUnit(unit);
    
    // Generate randomized deck based on player names
    const generatedDeck = generateDeck(pack, playerNames);
    setDrinkDeck(generatedDeck);

    setDrinkScreen("PLAY");
  };

  const handleDrinkGameOver = (stats: {
    [playerName: string]: { completed: number; drank: number };
  }) => {
    setDrinkPlayerStats(stats);
    setDrinkScreen("GAMEOVER");
  };

  const handleDrinkPlayAgain = () => {
    if (drinkConfig) {
      handleStartDrinkGame(drinkConfig);
    } else {
      setDrinkScreen("SETUP");
    }
  };

  // ==========================================
  // RENDER ROUTING
  // ==========================================
  return (
    <main className="app-container">
      {activeGame === "SELECTOR" && (
        <GameSelector onSelectGame={(game) => setActiveGame(game)} />
      )}

      {/* WHO IS THE SPY */}
      {activeGame === "SPY" && (
        <>
          {spyScreen === "SETUP" && (
            <SpySetup onStartGame={handleStartSpyGame} onBack={() => setActiveGame("SELECTOR")} />
          )}
          {spyScreen === "REVEAL" && (
            <CardReveal
              players={spyPlayers}
              showRoles={spyConfig ? spyConfig.showRoles : true}
              onPlayerSeen={handleSpyPlayerSeen}
              onFinishReveal={() => setSpyScreen("PLAY")}
              onQuit={() => {
                setSpyScreen("SETUP");
                setActiveGame("SELECTOR");
              }}
            />
          )}
          {spyScreen === "PLAY" && (
            <SpyBoard
              players={spyPlayers}
              civilianWord={spyCivilianWord}
              category={spyCategory}
              round={spyRound}
              onEliminatePlayer={handleSpyEliminatePlayer}
              onMrWhiteGuess={handleSpyMrWhiteGuess}
              onNextRound={handleSpyNextRoundWithoutElimination}
              onQuit={() => {
                setSpyScreen("SETUP");
                setActiveGame("SELECTOR");
              }}
            />
          )}
          {spyScreen === "GAMEOVER" && (
            <SpyGameOver
              winner={spyWinner}
              players={spyPlayers}
              civilianWord={spyCivilianWord}
              spyWord={spyWordState}
              mrWhiteGuess={spyMrWhiteGuess}
              mrWhiteGuessCorrect={spyMrWhiteGuessCorrect}
              onPlayAgain={handleSpyPlayAgain}
              onRestart={() => setSpyScreen("SETUP")}
            />
          )}
        </>
      )}

      {/* DO OR DRINK */}
      {activeGame === "DRINK" && (
        <>
          {drinkScreen === "SETUP" && (
            <DrinkingSetup onStartGame={handleStartDrinkGame} onBack={() => setActiveGame("SELECTOR")} />
          )}
          {drinkScreen === "PLAY" && (
            <DrinkingBoard
              players={drinkPlayers}
              deck={drinkDeck}
              penaltyUnit={drinkPenaltyUnit}
              onGameOver={handleDrinkGameOver}
              onQuit={() => {
                setDrinkScreen("SETUP");
                setActiveGame("SELECTOR");
              }}
            />
          )}
          {drinkScreen === "GAMEOVER" && (
            <DrinkingGameOver
              playerStats={drinkPlayerStats}
              penaltyUnit={drinkPenaltyUnit}
              onPlayAgain={handleDrinkPlayAgain}
              onRestart={() => setDrinkScreen("SETUP")}
            />
          )}
        </>
      )}
    </main>
  );
}
