import React, { useEffect } from "react";
import { Award, RotateCcw, Home, Skull, CheckCircle2 } from "lucide-react";
import { soundManager } from "../utils/SoundManager";
import confetti from "canvas-confetti";

interface Player {
  id: string;
  name: string;
  role: "CIVILIAN" | "SPY" | "MR_WHITE";
  word: string;
  isAlive: boolean;
  hasSeenWord: boolean;
}

interface GameOverProps {
  winner: "CIVILIAN" | "SPY" | "MR_WHITE" | null;
  players: Player[];
  civilianWord: string;
  spyWord: string;
  mrWhiteGuess: string | null;
  mrWhiteGuessCorrect: boolean | null;
  onPlayAgain: () => void;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  winner,
  players,
  civilianWord,
  spyWord,
  mrWhiteGuess,
  mrWhiteGuessCorrect,
  onPlayAgain,
  onRestart,
}) => {
  
  useEffect(() => {
    if (winner === "CIVILIAN") {
      soundManager.playSuccess();
      // Launch confetti
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#a78bfa", "#818cf8", "#34d399"]
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#a78bfa", "#818cf8", "#34d399"]
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else if (winner === "SPY" || winner === "MR_WHITE") {
      soundManager.playFail();
      // Simple warning confetti or red confetti for spies
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f87171", "#fb7185", "#f43f5e"]
      });
    }
  }, [winner]);

  const getWinnerTitle = () => {
    switch (winner) {
      case "CIVILIAN":
        return "Phe Dân Thường Thắng!";
      case "SPY":
        return "Phe Gián Điệp Thắng!";
      case "MR_WHITE":
        return "Mr. White Thắng Xuất Sắc!";
      default:
        return "Trò Chơi Kết Thúc!";
    }
  };

  const getWinnerDescription = () => {
    switch (winner) {
      case "CIVILIAN":
        return "Dân thường đã xuất sắc tìm ra toàn bộ Gián điệp & Mr. White!";
      case "SPY":
        return "Gián điệp đã xuất sắc ẩn mình và tiêu diệt phần lớn Dân thường!";
      case "MR_WHITE":
        if (mrWhiteGuessCorrect && mrWhiteGuess) {
          return `Mr. White bị loại nhưng đã lật kèo thành công khi đoán đúng từ khóa "${civilianWord}" (đoán là: "${mrWhiteGuess}")!`;
        }
        return "Mr. White đã qua mặt tất cả mọi người!";
      default:
        return "";
    }
  };

  const getWinnerClass = () => {
    switch (winner) {
      case "CIVILIAN":
        return "winner-civilian";
      case "SPY":
        return "winner-spy";
      case "MR_WHITE":
        return "winner-white";
      default:
        return "";
    }
  };

  return (
    <div className="glass-panel max-width-container animated-slide-in text-center gameover-screen-container">
      <div className={`winner-banner ${getWinnerClass()}`}>
        <Award size={48} className="winner-icon animate-bounce-slow" />
        <h2 className="winner-title">{getWinnerTitle()}</h2>
        <p className="winner-desc">{getWinnerDescription()}</p>
      </div>

      {/* WORD PAIR REVEAL */}
      <div className="gameover-word-reveal-box">
        <div className="reveal-pair-item">
          <span className="label">Từ khóa Dân thường:</span>
          <span className="value civilian-value">{civilianWord}</span>
        </div>
        <div className="reveal-pair-item">
          <span className="label">Từ khóa Gián điệp:</span>
          <span className="value spy-value">{spyWord}</span>
        </div>
      </div>

      {/* DETAILED PLAYER SUMMARY */}
      <h3 className="section-title text-left mt-4 mb-2">Chi tiết trận đấu:</h3>
      <div className="table-responsive">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Người chơi</th>
              <th>Vai trò</th>
              <th>Từ khóa</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className={!player.isAlive ? "row-dead" : "row-alive"}>
                <td>
                  <strong className="summary-player-name">{player.name}</strong>
                </td>
                <td>
                  <span className={`summary-role-badge ${player.role.toLowerCase()}`}>
                    {player.role === "CIVILIAN" ? "Dân Thường" : player.role === "SPY" ? "Gián Điệp" : "Mr. White"}
                  </span>
                </td>
                <td>
                  <span className="summary-word">
                    {player.role === "MR_WHITE" ? "Không có" : player.word}
                  </span>
                </td>
                <td>
                  {player.isAlive ? (
                    <span className="status-badge-table alive">
                      <CheckCircle2 size={12} className="icon-margin" /> Còn sống
                    </span>
                  ) : (
                    <span className="status-badge-table dead">
                      <Skull size={12} className="icon-margin" /> Bị loại
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTION BUTTONS */}
      <div className="gameover-actions">
        <button onClick={onPlayAgain} className="btn btn-primary btn-large btn-block mb-3">
          <RotateCcw size={18} className="icon-margin" /> Chơi Lại Trận Mới (Giữ cài đặt)
        </button>
        <button onClick={onRestart} className="btn btn-outline btn-large btn-block">
          <Home size={18} className="icon-margin" /> Quay Về Cài Đặt Ban Đầu
        </button>
      </div>
    </div>
  );
};
