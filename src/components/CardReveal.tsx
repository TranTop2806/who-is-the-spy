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
  onFinishReveal: () => void;
  onPlayerSeen: (index: number) => void;
}

export const CardReveal: React.FC<CardRevealProps> = ({
  players,
  onFinishReveal,
  onPlayerSeen,
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
    
    if (currentIndex < players.length - 1) {
      setTransitionState("PASSING");
    } else {
      setTransitionState("PASSING"); // Will trigger start game on next click
    }
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
        <span className="text-muted">Phát thẻ: </span>
        <span className="reveal-progress-text">
          {currentIndex + 1} / {players.length}
        </span>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentIndex + 1) / players.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* TRANSITION STAGE 1: READY FOR PLAYER */}
      {transitionState === "READY" && (
        <div className="reveal-stage-ready animated-fade-in">
          <div className="user-icon-pulse">
            <span className="player-avatar-large">{currentPlayer.name.slice(0, 2).toUpperCase()}</span>
          </div>
          <h2 className="reveal-title">Lượt của {currentPlayer.name}</h2>
          <p className="reveal-desc">
            Hãy đưa điện thoại cho <strong>{currentPlayer.name}</strong>. Các người chơi khác vui lòng quay mặt đi để bảo mật từ khóa!
          </p>
          <button onClick={handleReveal} className="btn btn-secondary btn-large reveal-btn">
            <Eye size={20} className="icon-margin" /> Xem từ khóa của tôi
          </button>
        </div>
      )}

      {/* TRANSITION STAGE 2: REVEALED */}
      {transitionState === "REVEALED" && (
        <div className="reveal-stage-revealed animated-fade-in">
          <h2 className="reveal-title-private">Từ khóa bí mật của bạn</h2>
          
          {/* Card Container for 3D flip effect */}
          <div className="flip-card-wrapper">
            <div className={`flip-card ${isRevealed ? "is-flipped" : ""}`}>
              <div className="flip-card-inner">
                {/* Card Front (Hidden State) */}
                <div className="flip-card-front">
                  <div className="card-lock-icon">?</div>
                </div>
                {/* Card Back (Revealed State) */}
                <div className={`flip-card-back ${currentPlayer.role.toLowerCase()}`}>
                  <div className="card-glow"></div>
                  <span className={`role-badge ${getRoleBadgeColor(currentPlayer.role)}`}>
                    {getRoleDisplayName(currentPlayer.role)}
                  </span>
                  
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

          <button onClick={handleHide} className="btn btn-primary btn-large hide-btn">
            <EyeOff size={20} className="icon-margin" /> Tôi đã nhớ, ẩn đi
          </button>
        </div>
      )}

      {/* TRANSITION STAGE 3: PASSING SCREEN */}
      {transitionState === "PASSING" && (
        <div className="reveal-stage-passing animated-fade-in">
          <div className="check-success-badge">✓</div>
          <h2 className="reveal-title">Đã ẩn từ khóa!</h2>
          
          {currentIndex < players.length - 1 ? (
            <div>
              <p className="reveal-desc">
                Hãy chuyển điện thoại cho người chơi tiếp theo: <strong>{players[currentIndex + 1].name}</strong>.
              </p>
              <button onClick={handleNextPlayer} className="btn btn-primary btn-large pass-btn">
                Người tiếp theo <ArrowRight size={20} className="icon-margin-left" />
              </button>
            </div>
          ) : (
            <div>
              <p className="reveal-desc">Tất cả người chơi đã xem xong từ khóa bí mật!</p>
              <button onClick={handleNextPlayer} className="btn btn-emerald btn-large pass-btn">
                Bắt Đầu Vòng Đấu <Sparkles size={20} className="icon-margin-left animate-pulse" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
