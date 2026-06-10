import React, { useEffect } from "react";
import { Award, RotateCcw, Home, Beer, Sparkles, Trophy } from "lucide-react";
import { soundManager } from "../utils/SoundManager";
import confetti from "canvas-confetti";

interface GameOverProps {
  playerStats: {
    [playerName: string]: { completed: number; drank: number };
  };
  penaltyUnit: string;
  onPlayAgain: () => void;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  playerStats,
  penaltyUnit,
  onPlayAgain,
  onRestart,
}) => {
  
  // Confetti effect and victory sound on mount
  useEffect(() => {
    soundManager.playSuccess();
    
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#f59e0b", "#fbbf24", "#fb923c"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#f59e0b", "#fbbf24", "#fb923c"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [playerStats]);

  const playerNames = Object.keys(playerStats);

  // Find Winner (Most Completed Dares)
  let maxCompleted = -1;
  let winners: string[] = [];
  playerNames.forEach((name) => {
    const score = playerStats[name].completed;
    if (score > maxCompleted) {
      maxCompleted = score;
      winners = [name];
    } else if (score === maxCompleted) {
      winners.push(name);
    }
  });

  // Find Penalty King (Most Drank)
  let maxDrank = -1;
  let drinkers: string[] = [];
  playerNames.forEach((name) => {
    const score = playerStats[name].drank;
    if (score > maxDrank) {
      maxDrank = score;
      drinkers = [name];
    } else if (score === maxDrank) {
      drinkers.push(name);
    }
  });

  // Sort players by completed count descending
  const sortedPlayers = [...playerNames].sort((a, b) => {
    if (playerStats[b].completed !== playerStats[a].completed) {
      return playerStats[b].completed - playerStats[a].completed;
    }
    return playerStats[b].drank - playerStats[a].drank; // secondary sort by drank
  });

  return (
    <div className="glass-panel max-width-container animated-slide-in text-center gameover-screen-container">
      {/* HEADER BANNER */}
      <div className="winner-banner winner-civilian" style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)", border: "1.5px solid rgba(245, 158, 11, 0.3)" }}>
        <Award size={48} className="winner-icon animate-bounce-slow" style={{ color: "#f59e0b" }} />
        <h2 className="winner-title" style={{ color: "#fcd34d" }}>TỔNG KẾT TRẬN ĐẤU</h2>
        <p className="winner-desc">Cảm ơn mọi người đã nhiệt tình uống hết mình và chơi hết sức!</p>
      </div>

      {/* AWARDS SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "10px 0" }}>
        {/* WINNER AWARD */}
        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Trophy size={32} style={{ color: "#f59e0b", marginBottom: "8px" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Dũng Sĩ Diệt Mồi</span>
          <strong style={{ fontSize: "1.1rem", color: "#fff", display: "block", marginTop: "4px" }}>
            {winners.join(", ")}
          </strong>
          <span style={{ fontSize: "0.8rem", color: "#34d399", marginTop: "4px", fontWeight: 600 }}>
            {maxCompleted} Nhiệm vụ
          </span>
        </div>

        {/* DRINKER AWARD */}
        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Beer size={32} style={{ color: "#f87171", marginBottom: "8px" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Vua Diệt Mồi (Thần Cồn)</span>
          <strong style={{ fontSize: "1.1rem", color: "#fff", display: "block", marginTop: "4px" }}>
            {drinkers.join(", ")}
          </strong>
          <span style={{ fontSize: "0.8rem", color: "#f87171", marginTop: "4px", fontWeight: 600 }}>
            {maxDrank} {penaltyUnit}
          </span>
        </div>
      </div>

      {/* DETAILED STANDINGS TABLE */}
      <h3 className="section-title text-left mt-2 mb-2" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Sparkles size={16} style={{ color: "#fcd34d" }} /> Bảng Xếp Hạng Chi Tiết
      </h3>
      <div className="table-responsive">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Người chơi</th>
              <th>Đã hoàn thành</th>
              <th>Đã uống</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((name, index) => {
              const stat = playerStats[name];
              const isWinner = winners.includes(name);
              const isDranker = drinkers.includes(name);
              
              return (
                <tr key={name} className={isWinner ? "row-alive" : ""} style={{ background: isWinner ? "rgba(245, 158, 11, 0.03)" : "" }}>
                  <td>
                    <strong style={{ color: index === 0 ? "#fcd34d" : "#a1a1aa" }}>#{index + 1}</strong>
                  </td>
                  <td>
                    <strong className="summary-player-name">{name}</strong>
                    {isWinner && <span style={{ fontSize: "0.75rem", marginLeft: "6px", color: "#f59e0b" }}>🏆</span>}
                    {isDranker && <span style={{ fontSize: "0.75rem", marginLeft: "6px", color: "#f87171" }}>🍺</span>}
                  </td>
                  <td>
                    <span style={{ color: "#34d399", fontWeight: 600 }}>{stat.completed}</span>
                  </td>
                  <td>
                    <span style={{ color: "#f87171", fontWeight: 600 }}>{stat.drank} {penaltyUnit}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ACTIONS */}
      <div className="gameover-actions" style={{ marginTop: "24px" }}>
        <button onClick={onPlayAgain} className="btn btn-primary btn-large btn-block mb-3" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)" }}>
          <RotateCcw size={18} className="icon-margin" /> Chơi Lại Vòng Mới (Giữ cài đặt)
        </button>
        <button onClick={onRestart} className="btn btn-outline btn-large btn-block">
          <Home size={18} className="icon-margin" /> Quay Về Cài Đặt Ban Đầu
        </button>
      </div>
    </div>
  );
};
