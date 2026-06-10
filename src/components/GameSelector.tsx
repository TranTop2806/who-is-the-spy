import React from "react";
import { Beer, ShieldAlert, Sparkles, Users } from "lucide-react";
import { soundManager } from "../utils/SoundManager";

interface GameSelectorProps {
  onSelectGame: (game: "SPY" | "DRINK") => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ onSelectGame }) => {
  const handleSelect = (game: "SPY" | "DRINK") => {
    soundManager.playSuccess();
    onSelectGame(game);
  };

  return (
    <div className="glass-panel max-width-container animated-slide-in text-center selector-screen" style={{ padding: "30px 20px" }}>
      {/* TITLE BANNER */}
      <div style={{ marginBottom: "32px" }}>
        <h1 className="gradient-text" style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px", letterSpacing: "-0.03em" }}>
          PARTY HUB
        </h1>
        <p className="text-muted" style={{ fontSize: "0.95rem" }}>
          Cổng game boardgame vui nhộn, náo nhiệt cho nhóm bạn!
        </p>
      </div>

      {/* GAMES GRID */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* GAME 1: WHO IS THE SPY */}
        <div
          onClick={() => handleSelect("SPY")}
          className="game-card spy-theme-hover"
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.15) 100%)",
            border: "1.5px solid rgba(99, 102, 241, 0.2)",
            borderRadius: "24px",
            padding: "24px",
            cursor: "pointer",
            textAlign: "left",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
          }}
        >
          {/* Decorative background glow */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)",
            pointerEvents: "none"
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{
              background: "rgba(99, 102, 241, 0.2)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "16px",
              padding: "12px",
              color: "#c7d2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <ShieldAlert size={28} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h3 style={{ color: "#c7d2fe", fontSize: "1.35rem", margin: 0 }}>Ai Là Gián Điệp?</h3>
                <span className="badge-new" style={{
                  background: "rgba(99, 102, 241, 0.2)",
                  color: "#a5b4fc",
                  fontSize: "0.7rem",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  fontWeight: 600
                }}>
                  TRÍ TUỆ
                </span>
              </div>
              <p style={{ color: "#a1a1aa", fontSize: "0.85rem", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                Đấu trí suy luận kịch tính. Ai là người nắm giữ từ khóa ẩn, ai là gián điệp trá hình?
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.8rem", color: "#818cf8" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Users size={14} /> 3 - 15 người
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles size={14} /> Hack não
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* GAME 2: DO OR DRINK */}
        <div
          onClick={() => handleSelect("DRINK")}
          className="game-card drink-theme-hover"
          style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.15) 100%)",
            border: "1.5px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "24px",
            padding: "24px",
            cursor: "pointer",
            textAlign: "left",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
          }}
        >
          {/* Decorative background glow */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)",
            pointerEvents: "none"
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{
              background: "rgba(245, 158, 11, 0.2)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "16px",
              padding: "12px",
              color: "#fde047",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Beer size={28} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h3 style={{ color: "#fde047", fontSize: "1.35rem", margin: 0 }}>Do or Drink (Uống Đê!)</h3>
                <span className="badge-new" style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#fde047",
                  fontSize: "0.7rem",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  fontWeight: 600
                }}>
                  VUI NHỘN
                </span>
              </div>
              <p style={{ color: "#a1a1aa", fontSize: "0.85rem", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                Chấp nhận thử thách bất ngờ, câu hỏi cực sâu hoặc nhận chén phạt dở khóc dở cười!
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.8rem", color: "#f59e0b" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Users size={14} /> 2 - 20 người
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles size={14} /> 500+ lá bài
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "40px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        Dành cho những đêm tụ tập bùng nổ 🥳
      </div>
    </div>
  );
};
