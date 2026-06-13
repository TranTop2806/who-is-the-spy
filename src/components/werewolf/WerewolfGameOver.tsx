import React from "react";
import { Award, RotateCcw, Home, Skull, Users, Heart } from "lucide-react";
import { soundManager } from "../../utils/SoundManager";
import { WEREWOLF_ROLES } from "../../data/werewolfRoles";
import type { WerewolfRoleType } from "../../data/werewolfRoles";

interface Player {
  id: string;
  name: string;
  role: WerewolfRoleType;
  isAlive: boolean;
}

interface WerewolfGameOverProps {
  winner: string; // "VILLAGERS" | "WEREWOLVES" | "LOVERS"
  players: Player[];
  onPlayAgain: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export const WerewolfGameOver: React.FC<WerewolfGameOverProps> = ({
  winner,
  players,
  onPlayAgain,
  onRestart,
  onQuit,
}) => {
  React.useEffect(() => {
    soundManager.playSuccess();
  }, []);

  const getWinnerInfo = () => {
    switch (winner) {
      case "VILLAGERS":
        return {
          title: "Dân Làng Thắng! 🧑‍🌾",
          sub: "Cư dân thông thái đã diệt trừ toàn bộ hiểm họa ma sói!",
          color: "#86efac",
          bgGlow: "rgba(34, 197, 94, 0.2)"
        };
      case "WEREWOLVES":
        return {
          title: "Ma Sói Thắng! 🐺",
          sub: "Bóng tối bao trùm! Ma sói đã cắn nuốt toàn bộ ngôi làng!",
          color: "#fda4af",
          bgGlow: "rgba(239, 68, 68, 0.2)"
        };
      case "LOVERS":
        return {
          title: "Cặp Đôi Thắng! 💘",
          sub: "Vượt qua hiểm họa sói thường, đôi uyên ương đã sống sót cuối cùng!",
          color: "#f472b6",
          bgGlow: "rgba(244, 114, 182, 0.2)"
        };
      default:
        return {
          title: "Kết Thúc! ⚖️",
          sub: "Trận đấu kết thúc theo quyết định của quản trò.",
          color: "#e4e4e7",
          bgGlow: "rgba(255, 255, 255, 0.1)"
        };
    }
  };

  const info = getWinnerInfo();

  return (
    <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "30px 20px" }}>
      {/* AWARD CIRCLE */}
      <div style={{
        width: "90px",
        height: "90px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        border: `2px solid ${info.color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        color: info.color,
        boxShadow: `0 0 20px ${info.bgGlow}`
      }} className="animate-bounce-slow">
        {winner === "LOVERS" ? <Heart size={46} /> : <Award size={46} />}
      </div>

      <span style={{ fontSize: "0.8rem", color: info.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px" }}>
        TRẬN ĐẤU KẾT THÚC
      </span>
      <h2 className="gradient-text" style={{ fontSize: "2rem", fontWeight: 800, marginTop: "6px", marginBottom: "8px" }}>
        {info.title}
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0 0 28px 0" }}>
        {info.sub}
      </p>

      {/* PLAYERS ROLE REVEAL TABLE */}
      <div className="form-group" style={{ marginBottom: "28px" }}>
        <span className="input-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Users size={16} /> Tổng kết vai trò & Sinh tử
        </span>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1.5px solid rgba(255, 255, 255, 0.05)",
          padding: "16px",
          borderRadius: "20px"
        }}>
          {players.map((p) => {
            const roleInfo = WEREWOLF_ROLES[p.role];
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: p.isAlive ? "rgba(255, 255, 255, 0.02)" : "rgba(0,0,0,0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  borderRadius: "12px",
                  opacity: p.isAlive ? 1 : 0.6
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 600, color: p.isAlive ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    ({roleInfo?.emoji} {roleInfo?.name})
                  </span>
                </div>

                {p.isAlive ? (
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    background: "rgba(34, 197, 94, 0.12)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    color: "#86efac",
                    borderRadius: "20px",
                    fontWeight: 600
                  }}>
                    SỐNG SÓT 💚
                  </span>
                ) : (
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    background: "rgba(244, 63, 94, 0.1)",
                    border: "1px solid rgba(244, 63, 94, 0.2)",
                    color: "#fda4af",
                    borderRadius: "20px",
                    fontWeight: 500
                  }}>
                    <Skull size={12} /> TỬ NẠN
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BUTTON PANELS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          onClick={onPlayAgain}
          className="btn btn-primary btn-block btn-large"
          style={{ display: "flex", gap: "8px", background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", borderColor: "#6d28d9" }}
        >
          <RotateCcw size={20} />
          CHƠI LẠI TRẬN MỚI
        </button>

        <button
          onClick={onRestart}
          className="btn btn-outline btn-block"
          style={{ height: "48px" }}
        >
          CÀI ĐẶT LẠI VAI TRÒ
        </button>

        <button
          onClick={onQuit}
          className="btn btn-outline btn-block"
          style={{ height: "48px", borderColor: "rgba(244,63,94,0.15)", color: "#fda4af" }}
        >
          <Home size={16} /> VỀ TRANG CHỦ
        </button>
      </div>
    </div>
  );
};
