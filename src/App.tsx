import { useState } from "react";
import { GameSetup } from "./components/GameSetup";
import { CardReveal } from "./components/CardReveal";
import { GameBoard } from "./components/GameBoard";
import { GameOver } from "./components/GameOver";
import { WORD_DATABASE } from "./data/words";
import type { WordPair } from "./data/words";

interface Player {
  id: string;
  name: string;
  role: "CIVILIAN" | "SPY" | "MR_WHITE";
  word: string;
  isAlive: boolean;
  hasSeenWord: boolean;
}

interface GameConfig {
  playerNames: string[];
  spyCount: number;
  mrWhiteCount: number;
  category: string;
  customCivilianWord: string;
  customSpyWord: string;
  showRoles: boolean;
}

export default function App() {
  const [screen, setScreen] = useState<"SETUP" | "REVEAL" | "PLAY" | "GAMEOVER">("SETUP");
  const [players, setPlayers] = useState<Player[]>([]);
  const [civilianWord, setCivilianWord] = useState<string>("");
  const [spyWord, setSpyWord] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [round, setRound] = useState<number>(1);
  const [winner, setWinner] = useState<"CIVILIAN" | "SPY" | "MR_WHITE" | null>(null);
  
  // Mr White specific endgame state
  const [mrWhiteGuess, setMrWhiteGuess] = useState<string | null>(null);
  const [mrWhiteGuessCorrect, setMrWhiteGuessCorrect] = useState<boolean | null>(null);
  
  // Save current game configuration to allow "Play Again" with same settings
  const [config, setConfig] = useState<GameConfig | null>(null);

  // Fisher-Yates shuffle
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  };

  const handleStartGame = (gameConfig: GameConfig) => {
    setConfig(gameConfig);
    const { playerNames, spyCount, mrWhiteCount, category: chosenCategory, customCivilianWord, customSpyWord } = gameConfig;

    // 1. Select Word Pair
    let civWord = "";
    let spWord = "";
    let activeCategory = chosenCategory;

    if (chosenCategory === "Tự nhập từ khóa") {
      civWord = customCivilianWord.trim();
      spWord = customSpyWord.trim();
    } else {
      // Pick random word pair from database
      const filteredPairs = chosenCategory === "Tất cả" 
        ? WORD_DATABASE 
        : WORD_DATABASE.filter(pair => pair.category === chosenCategory);

      if (filteredPairs.length === 0) {
        // Fallback if empty category
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

    setCivilianWord(civWord);
    setSpyWord(spWord);
    setCategory(activeCategory);

    // 2. Generate Roles
    const totalPlayers = playerNames.length;
    const civilianCount = totalPlayers - spyCount - mrWhiteCount;

    const rolePool: ("CIVILIAN" | "SPY" | "MR_WHITE")[] = [];
    for (let i = 0; i < civilianCount; i++) rolePool.push("CIVILIAN");
    for (let i = 0; i < spyCount; i++) rolePool.push("SPY");
    for (let i = 0; i < mrWhiteCount; i++) rolePool.push("MR_WHITE");

    const shuffledRoles = shuffleArray(rolePool);

    // 3. Create Player Objects
    const generatedPlayers: Player[] = playerNames.map((name, index) => {
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

    setPlayers(generatedPlayers);
    setRound(1);
    setWinner(null);
    setMrWhiteGuess(null);
    setMrWhiteGuessCorrect(null);
    setScreen("REVEAL");
  };

  const handlePlayerSeen = (index: number) => {
    setPlayers(prev => {
      const updated = [...prev];
      updated[index].hasSeenWord = true;
      return updated;
    });
  };

  const checkWinConditions = (updatedPlayers: Player[]): "CIVILIAN" | "SPY" | "MR_WHITE" | null => {
    const alive = updatedPlayers.filter(p => p.isAlive);
    const activeCivilians = alive.filter(p => p.role === "CIVILIAN");
    const activeSpies = alive.filter(p => p.role === "SPY");
    const activeMrWhites = alive.filter(p => p.role === "MR_WHITE");

    const civiliansCount = activeCivilians.length;
    const spiesCount = activeSpies.length;
    const mrWhitesCount = activeMrWhites.length;
    const badGuysCount = spiesCount + mrWhitesCount;

    if (badGuysCount === 0) {
      return "CIVILIAN"; // All spies/whites dead
    }

    if (badGuysCount >= civiliansCount) {
      // Bad guys outnumber or equal civilians
      if (spiesCount > 0) {
        return "SPY";
      } else {
        return "MR_WHITE";
      }
    }

    return null;
  };

  const handleEliminatePlayer = (playerId: string) => {
    const updatedPlayers = players.map(p => {
      if (p.id === playerId) {
        return { ...p, isAlive: false };
      }
      return p;
    });
    
    setPlayers(updatedPlayers);

    // If eliminated player is MR_WHITE, we don't declare game over immediately,
    // we wait for their guess confirmation modal.
    const targetPlayer = players.find(p => p.id === playerId);
    if (targetPlayer && targetPlayer.role === "MR_WHITE") {
      // Handled by handleMrWhiteGuess callback
      return;
    }

    // Otherwise check normal win conditions
    const gameWinner = checkWinConditions(updatedPlayers);
    if (gameWinner) {
      setWinner(gameWinner);
      setScreen("GAMEOVER");
    } else {
      // Start a new round after elimination
      setRound(prev => prev + 1);
    }
  };

  const handleMrWhiteGuess = (isCorrect: boolean, guess: string) => {
    setMrWhiteGuess(guess);
    setMrWhiteGuessCorrect(isCorrect);

    if (isCorrect) {
      setWinner("MR_WHITE");
      setScreen("GAMEOVER");
    } else {
      // Mr White guessed wrong. Check win conditions based on currently updated players (who is dead).
      const gameWinner = checkWinConditions(players);
      if (gameWinner) {
        setWinner(gameWinner);
        setScreen("GAMEOVER");
      } else {
        setRound(prev => prev + 1);
      }
    }
  };

  const handleNextRoundWithoutElimination = () => {
    setRound(prev => prev + 1);
  };

  const handlePlayAgain = () => {
    if (config) {
      handleStartGame(config);
    } else {
      setScreen("SETUP");
    }
  };

  const handleRestart = () => {
    setScreen("SETUP");
  };

  return (
    <main className="app-container">
      {screen === "SETUP" && <GameSetup onStartGame={handleStartGame} />}
      {screen === "REVEAL" && (
        <CardReveal
          players={players}
          showRoles={config ? config.showRoles : true}
          onPlayerSeen={handlePlayerSeen}
          onFinishReveal={() => setScreen("PLAY")}
          onQuit={handleRestart}
        />
      )}
      {screen === "PLAY" && (
        <GameBoard
          players={players}
          civilianWord={civilianWord}
          category={category}
          round={round}
          onEliminatePlayer={handleEliminatePlayer}
          onMrWhiteGuess={handleMrWhiteGuess}
          onNextRound={handleNextRoundWithoutElimination}
          onQuit={handleRestart}
        />
      )}
      {screen === "GAMEOVER" && (
        <GameOver
          winner={winner}
          players={players}
          civilianWord={civilianWord}
          spyWord={spyWord}
          mrWhiteGuess={mrWhiteGuess}
          mrWhiteGuessCorrect={mrWhiteGuessCorrect}
          onPlayAgain={handlePlayAgain}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
