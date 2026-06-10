import { useState } from "react";
import { GameSetup } from "./components/GameSetup";
import { GameBoard } from "./components/GameBoard";
import { GameOver } from "./components/GameOver";
import { generateDeck } from "./data/drinkingCards";
import type { DrinkingCard } from "./data/drinkingCards";

interface GameConfig {
  playerNames: string[];
  pack: "CLASSIC" | "GEN_Z" | "MIXED";
  penaltyUnit: string;
}

export default function App() {
  const [screen, setScreen] = useState<"SETUP" | "PLAY" | "GAMEOVER">("SETUP");
  const [players, setPlayers] = useState<string[]>([]);
  const [deck, setDeck] = useState<DrinkingCard[]>([]);
  const [penaltyUnit, setPenaltyUnit] = useState<string>("hớp");
  const [playerStats, setPlayerStats] = useState<{
    [playerName: string]: { completed: number; drank: number };
  }>({});
  const [config, setConfig] = useState<GameConfig | null>(null);

  const handleStartGame = (gameConfig: GameConfig) => {
    setConfig(gameConfig);
    const { playerNames, pack, penaltyUnit: unit } = gameConfig;

    setPlayers(playerNames);
    setPenaltyUnit(unit);
    
    // Generate randomized deck based on player names
    const generatedDeck = generateDeck(pack, playerNames);
    setDeck(generatedDeck);

    setScreen("PLAY");
  };

  const handleGameOver = (stats: {
    [playerName: string]: { completed: number; drank: number };
  }) => {
    setPlayerStats(stats);
    setScreen("GAMEOVER");
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
      {screen === "PLAY" && (
        <GameBoard
          players={players}
          deck={deck}
          penaltyUnit={penaltyUnit}
          onGameOver={handleGameOver}
          onQuit={handleRestart}
        />
      )}
      {screen === "GAMEOVER" && (
        <GameOver
          playerStats={playerStats}
          penaltyUnit={penaltyUnit}
          onPlayAgain={handlePlayAgain}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
