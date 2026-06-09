import React, { useState } from "react";
import { Eye, EyeOff, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
import { soundManager } from "../utils/SoundManager";

interface Player {
  id: string;
  name: string;
  role: "CIVILIAN" | "SPY" | "MR_WHITE";
  word: string;
  isAlive: boolean;
  hasSeenWord: boolean;
}

interface CardRevealProps {
  players: Player[];
  showRoles: boolean;
  onFinishReveal: () => void;
  onPlayerSeen: (index: number) => void;
  onQuit: () => void;
}

export const CardReveal: React.FC<CardRevealProps> = ({
  players,
  showRoles,
  onFinishReveal,
  onPlayerSeen,
  onQuit,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [transitionState, setTransitionState] = useState<"READY" | "REVEALED" | "PASSING">("READY");

  const currentPlayer = players[currentIndex];

  const handleReveal = () => {
    soundManager.playFlip();
    setIsRevealed(true);
    setTransitionState("REVEALED");
    onPlayerSeen(currentIndex);
  };

  const handleHide = () => {
    soundManager.playFlip();
    setIsRevealed(false);
    setTransitionState("PASSING");
  };

  const handleNextPlayer = () => {
    soundManager.playClick();
    if (currentIndex < players.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTransitionState("READY");
    } else {
      onFinishReveal();
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SPY":
        return "role-spy-tag";
      case "MR_WHITE":
        return "role-white-tag";
      default:
        return "role-civilian-tag";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "SPY":
        return "Gián Điệp";
      case "MR_WHITE":
        return "Mr. White";
      default:
        return "Dân Thường";
    }
  };

  return (
    <div className="glass-panel max-width-container animated-slide-in text-center reveal-screen-container">
      {/* HEADER PROGRESS */}
      <div className="reveal-progress">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="text-muted">Phát thẻ: </span>
          <span className="reveal-progress-text">
            {currentIndex + 1} / {players.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Bạn có chắc chắn muốn hủy trận đấu và quay lại cài đặt?")) {
              soundManager.playClick();
              onQuit();
            }
          }}
          className="btn-icon quit-game-btn"
          title="Hủy trận đấu"
          style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(244, 63, 94, 0.15)", borderColor: "rgba(244, 63, 94, 0.3)", color: "#f87171" }}
        >
          ✕
        </button>
        <div className="progress-bar-container" style={{ width: "100%", marginTop: "8px" }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentIndex + 1) / players.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* CARD DISPLAY AREA (Always mounted for smooth 3D flip transition) */}
      <div className="reveal-card-section">
        {transitionState === "READY" && (
          <p className="reveal-desc animated-fade-in">
            Hãy chuyền máy cho <strong>{currentPlayer.name}</strong>. Những người khác tránh nhìn vào màn hình!
          </p>
        )}
        {transitionState === "REVEALED" && (
          <p className="reveal-desc animated-fade-in">
            Ghi nhớ từ khóa của bạn và bấm nút ẩn đi trước khi chuyển máy!
          </p>
        )}
        {transitionState === "PASSING" && (
          <p className="reveal-desc animated-fade-in">
            Từ khóa đã được ẩn an toàn.
          </p>
        )}

        <div className="flip-card-wrapper">
          <div className={`flip-card ${isRevealed ? "is-flipped" : ""}`}>
            <div className="flip-card-inner">
              {/* Card Front (Hidden State) */}
              <div className="flip-card-front">
                <div className="card-front-content">
                  <div className="user-icon-pulse">
                    <span className="player-avatar-large">
                      {currentPlayer.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="card-player-name">{currentPlayer.name}</h3>
                  <p className="card-click-prompt">Nhấn nút bên dưới để lật thẻ</p>
                </div>
              </div>
              {/* Card Back (Revealed State) */}
              <div className={`flip-card-back ${currentPlayer.role.toLowerCase()}`}>
                <div className="card-glow"></div>
                {(showRoles || currentPlayer.role === "MR_WHITE") ? (
                  <span className={`role-badge ${getRoleBadgeColor(currentPlayer.role)}`}>
                    {getRoleDisplayName(currentPlayer.role)}
                  </span>
                ) : (
                  <span className="role-badge role-civilian-tag" style={{ background: "rgba(139, 92, 246, 0.2)", color: "#ddd6fe", borderColor: "rgba(139, 92, 246, 0.4)" }}>
                    Bí Mật
                  </span>
                )}
                
                {currentPlayer.role === "MR_WHITE" ? (
                  <div className="mrwhite-card-content">
                    <ShieldAlert size={48} className="color-white animate-bounce-slow" />
                    <h3 className="keyword-display white-glow-text mt-4">Bạn Không Có Từ Khóa!</h3>
                    <p className="card-instruction">
                      Hãy lắng nghe mô tả của người khác thật kỹ để giả vờ mình có từ khóa.
                    </p>
                  </div>
                ) : (
                  <div className="normal-card-content">
                    <Sparkles size={32} className="card-sparkle-icon" />
                    <h3 className="keyword-display">{currentPlayer.word}</h3>
                    <p className="card-instruction">
                      Mô tả từ này mà không nói trực tiếp từ khóa ra nhé!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC ACTION BUTTONS */}
      <div className="reveal-actions-area">
        {transitionState === "READY" && (
          <button onClick={handleReveal} className="btn btn-secondary btn-large reveal-btn btn-block">
            <Eye size={20} className="icon-margin" /> Xem từ khóa của tôi
          </button>
        )}

        {transitionState === "REVEALED" && (
          <button onClick={handleHide} className="btn btn-primary btn-large hide-btn btn-block">
            <EyeOff size={20} className="icon-margin" /> Tôi đã nhớ, ẩn đi
          </button>
        )}

        {transitionState === "PASSING" && (
          currentIndex < players.length - 1 ? (
            <button onClick={handleNextPlayer} className="btn btn-primary btn-large pass-btn btn-block">
              Người tiếp theo <ArrowRight size={20} className="icon-margin-left" />
            </button>
          ) : (
            <button onClick={handleNextPlayer} className="btn btn-emerald btn-large pass-btn btn-block">
              Bắt Đầu Vòng Đấu <Sparkles size={20} className="icon-margin-left animate-pulse" />
            </button>
          )
        )}
      </div>
    </div>
  );
};
