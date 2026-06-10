import React, { useState } from "react";
import { Beer, Check, ShieldAlert, Award, Volume2, VolumeX, ListCollapse, ArrowRight } from "lucide-react";
import { soundManager } from "../utils/SoundManager";
import type { DrinkingCard } from "../data/drinkingCards";
import confetti from "canvas-confetti";

interface GameBoardProps {
  players: string[];
  deck: DrinkingCard[];
  penaltyUnit: string;
  onGameOver: (stats: {
    [playerName: string]: { completed: number; drank: number };
  }) => void;
  onQuit: () => void;
}

export const DrinkingBoard: React.FC<GameBoardProps> = ({
  players,
  deck,
  penaltyUnit,
  onGameOver,
  onQuit,
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [drawnCard, setDrawnCard] = useState<DrinkingCard | null>(null);
  const [cardStatus, setCardStatus] = useState<"IDLE" | "DRAWN" | "RESOLVED">("IDLE");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showScoreDrawer, setShowScoreDrawer] = useState<boolean>(false);

  // Initialize player stats
  const [playerStats, setPlayerStats] = useState<{
    [playerName: string]: { completed: number; drank: number };
  }>(() => {
    const initialStats: any = {};
    players.forEach((name) => {
      initialStats[name] = { completed: 0, drank: 0 };
    });
    return initialStats;
  });

  const currentPlayerName = players[currentPlayerIndex];

  const handleDrawCard = () => {
    soundManager.playFlip();
    if (currentCardIndex >= deck.length) {
      // Out of cards, trigger Game Over
      onGameOver(playerStats);
      return;
    }
    setDrawnCard(deck[currentCardIndex]);
    setCardStatus("DRAWN");
  };

  const handleResolveCard = (action: "COMPLETED" | "DRANK") => {
    if (!drawnCard) return;

    if (action === "COMPLETED") {
      soundManager.playSuccess();
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      // Increment completed count
      setPlayerStats((prev) => ({
        ...prev,
        [currentPlayerName]: {
          ...prev[currentPlayerName],
          completed: prev[currentPlayerName].completed + 1
        }
      }));
    } else {
      soundManager.playFail();
      // Increment drank count by card penalty
      setPlayerStats((prev) => ({
        ...prev,
        [currentPlayerName]: {
          ...prev[currentPlayerName],
          drank: prev[currentPlayerName].drank + drawnCard.penalty
        }
      }));
    }

    setCardStatus("RESOLVED");
    setCurrentCardIndex((prev) => prev + 1);
  };

  const handleNextPlayer = () => {
    soundManager.playClick();
    setDrawnCard(null);
    setCardStatus("IDLE");
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  };

  const handleEndGameEarly = () => {
    soundManager.playClick();
    if (confirm("Bạn có chắc muốn kết thúc game sớm và xem bảng vàng tổng kết?")) {
      onGameOver(playerStats);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getCardTypeLabel = (type: DrinkingCard["type"]) => {
    switch (type) {
      case "DARE":
        return "THÁCH THỨC (DARE)";
      case "TRUTH":
        return "THẬT THÀ (TRUTH)";
      case "RULE":
        return "QUY TẮC CHUNG (RULE)";
      case "VOTE":
        return "BÌNH BẦU NHÓM (VOTE)";
      case "VIRAL":
        return "ĐỒNG LOẠT (VIRAL)";
      default:
        return "TƯƠNG TÁC (INTERACTIVE)";
    }
  };

  const getCardThemeClass = (type: DrinkingCard["type"]) => {
    switch (type) {
      case "DARE":
        return "drinking-card-dare";
      case "TRUTH":
        return "drinking-card-truth";
      case "RULE":
        return "drinking-card-rule";
      case "VOTE":
        return "drinking-card-vote";
      case "VIRAL":
        return "drinking-card-interactive";
      default:
        return "drinking-card-interactive";
    }
  };

  return (
    <div className="glass-panel max-width-container animated-slide-in board-screen-container" style={{ minHeight: "560px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* HEADER */}
      <div className="board-header" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setShowScoreDrawer(!showScoreDrawer)}
            className="btn-icon help-btn"
            title="Xem bảng điểm"
          >
            <ListCollapse size={18} />
          </button>
          <span className="round-badge" style={{ background: "#f59e0b", color: "#fff", margin: 0 }}>
            Lá bài {currentCardIndex + 1}/{deck.length}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={toggleMute} className="btn-icon mute-btn" aria-label="Bật/Tắt âm thanh">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={() => {
              if (confirm("Quay lại màn hình cài đặt sẽ xóa tiến trình hiện tại. Bạn chắc chứ?")) {
                soundManager.playClick();
                onQuit();
              }
            }}
            className="btn-icon quit-game-btn"
            title="Thoát"
            style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(244, 63, 94, 0.15)", borderColor: "rgba(244, 63, 94, 0.3)", color: "#f87171" }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* CORE BOARD PLAY AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", margin: "24px 0" }}>
        {/* ACTIVE PLAYER TURN */}
        <div className="text-center mb-4">
          <span className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Lượt của người chơi:</span>
          <h2 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px" }}>
            {currentPlayerName}
          </h2>
        </div>

        {/* CARD CONTAINER */}
        <div className="flip-card-wrapper" style={{ width: "270px", height: "370px", marginBottom: "20px" }}>
          <div className={`flip-card ${cardStatus !== "IDLE" ? "is-flipped" : ""}`} style={{ cursor: cardStatus === "IDLE" ? "pointer" : "default" }} onClick={() => cardStatus === "IDLE" && handleDrawCard()}>
            <div className="flip-card-inner">
              {/* CARD FRONT - Deck state */}
              <div className="flip-card-front" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)", border: "2px solid rgba(245, 158, 11, 0.25)" }}>
                <div className="card-glow" style={{ background: "radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.15) 0%, rgba(0, 0, 0, 0) 70%)" }}></div>
                <Beer size={64} className="animate-bounce-slow" style={{ color: "#f59e0b", marginBottom: "16px" }} />
                <h3 className="keyword-display" style={{ fontSize: "1.6rem", color: "#fcd34d" }}>DO OR DRINK</h3>
                <p className="card-click-prompt" style={{ color: "rgba(255, 255, 255, 0.5)", marginTop: "24px" }}>
                  Chạm để rút bài!
                </p>
              </div>

              {/* CARD BACK - Question state */}
              {drawnCard && (
                <div className={`flip-card-back ${getCardThemeClass(drawnCard.type)}`} style={{ padding: "24px", justifyContent: "space-between" }}>
                  <div className="card-glow"></div>
                  
                  {/* Category Header */}
                  <span className="role-badge" style={{ alignSelf: "center", marginBottom: 0 }}>
                    {getCardTypeLabel(drawnCard.type)}
                  </span>

                  {/* Card Main text */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", margin: "16px 0" }}>
                    <p style={{ fontSize: "1.1rem", fontWeight: 500, lineHeight: 1.6, color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                      {drawnCard.content}
                    </p>
                  </div>

                  {/* Card Penalty Footer */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.25)", padding: "10px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", width: "100%", justifyContent: "center" }}>
                    <ShieldAlert size={16} style={{ color: "#f87171" }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      Hình phạt từ chối: <strong style={{ color: "#f87171", fontSize: "1.1rem" }}>{drawnCard.penalty}</strong> {penaltyUnit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="board-bottom-actions" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {cardStatus === "IDLE" && (
          <button onClick={handleDrawCard} className="btn btn-primary btn-large btn-block" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
            Bốc Lá Bài Mới
          </button>
        )}

        {cardStatus === "DRAWN" && (
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button
              onClick={() => handleResolveCard("COMPLETED")}
              className="btn btn-emerald btn-large flex-1"
            >
              <Check size={18} className="icon-margin" /> Làm xong nhiệm vụ
            </button>
            <button
              onClick={() => handleResolveCard("DRANK")}
              className="btn btn-danger btn-large flex-1"
            >
              <Beer size={18} className="icon-margin" /> Chịu phạt / Uống
            </button>
          </div>
        )}

        {cardStatus === "RESOLVED" && (
          <button onClick={handleNextPlayer} className="btn btn-primary btn-large btn-block">
            Lượt tiếp theo <ArrowRight size={18} className="icon-margin-left" />
          </button>
        )}

        <button onClick={handleEndGameEarly} className="btn btn-outline btn-block mt-2" style={{ borderStyle: "dashed", borderColor: "rgba(255,255,255,0.12)" }}>
          Kết Thúc Rút Bài (Tổng Kết Trận)
        </button>
      </div>

      {/* SCOREBOARD DRAWER (Pull-out Panel) */}
      {showScoreDrawer && (
        <div className="modal-overlay" onClick={() => setShowScoreDrawer(false)} style={{ justifyContent: "flex-start", padding: 0 }}>
          <div
            className="glass-panel animated-slide-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "310px",
              height: "100%",
              borderRadius: "0 24px 24px 0",
              borderWidth: "0 1px 0 0",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "10px 0 30px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <Award size={20} style={{ color: "#f59e0b" }} /> Bảng Tổng Sắp
              </h3>
              <button
                onClick={() => setShowScoreDrawer(false)}
                className="btn-icon"
                style={{ width: "32px", height: "32px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {players.map((name, index) => {
                const stat = playerStats[name];
                const isCurrent = index === currentPlayerIndex;
                return (
                  <div
                    key={name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: isCurrent ? "rgba(245, 158, 11, 0.08)" : "rgba(255,255,255,0.02)",
                      border: isCurrent ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid rgba(255,255,255,0.04)",
                      padding: "12px 14px",
                      borderRadius: "14px",
                      marginBottom: "8px"
                    }}
                  >
                    <div>
                      <strong style={{ color: isCurrent ? "#f59e0b" : "#fff", display: "block" }}>{name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {isCurrent ? "Đang đến lượt" : `Người chơi thứ ${index + 1}`}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        Nhiệm vụ: <span style={{ color: "#34d399" }}>{stat.completed}</span>
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        Đã uống: <span style={{ color: "#f87171" }}>{stat.drank} {penaltyUnit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
