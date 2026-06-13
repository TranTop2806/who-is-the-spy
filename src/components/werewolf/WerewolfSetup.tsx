import React, { useState, useEffect } from "react";
import { Users, Plus, X, ArrowLeft, Shield, AlertCircle, Info } from "lucide-react";
import { soundManager } from "../../utils/SoundManager";
import { WEREWOLF_ROLES } from "../../data/werewolfRoles";
import type { WerewolfRoleType } from "../../data/werewolfRoles";

interface WerewolfSetupProps {
  onBack: () => void;
  onStartGame: (config: { playerNames: string[]; roles: Record<WerewolfRoleType, number> }) => void;
}

export const WerewolfSetup: React.FC<WerewolfSetupProps> = ({ onBack, onStartGame }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    const saved = localStorage.getItem("lucid_bose_werewolf_names");
    return saved ? JSON.parse(saved) : ["An", "Bình", "Cường", "Dung", "Hoa"];
  });
  const [newPlayerName, setNewPlayerName] = useState<string>("");
  
  // Roles config state
  const [roles, setRoles] = useState<Record<WerewolfRoleType, number>>({
    VILLAGER: 0, // Will be computed
    WEREWOLF: 1,
    SEER: 1,
    BODYGUARD: 1,
    WITCH: 0,
    HUNTER: 0,
    CUPID: 0
  });

  const [errorMessage, setErrorMessage] = useState<string>("");

  // Auto-adjust default roles when player count changes
  useEffect(() => {
    const count = playerNames.length;
    let defaultWolves = 1;
    let defaultSeer = 1;
    let defaultBodyguard = 0;
    let defaultWitch = 0;
    let defaultHunter = 0;
    let defaultCupid = 0;

    if (count >= 6 && count <= 7) {
      defaultBodyguard = 1;
      defaultWitch = 1;
    } else if (count >= 8 && count <= 9) {
      defaultWolves = 2;
      defaultBodyguard = 1;
      defaultWitch = 1;
    } else if (count >= 10 && count <= 12) {
      defaultWolves = 2;
      defaultBodyguard = 1;
      defaultWitch = 1;
      defaultHunter = 1;
      defaultCupid = 1;
    } else if (count > 12) {
      defaultWolves = 3;
      defaultBodyguard = 1;
      defaultWitch = 1;
      defaultHunter = 1;
      defaultCupid = 1;
    } else {
      // 4-5 players
      defaultWolves = 1;
      defaultSeer = 1;
      defaultBodyguard = 1;
    }

    setRoles({
      VILLAGER: 0, // Placeholder, calculated on the fly
      WEREWOLF: defaultWolves,
      SEER: defaultSeer,
      BODYGUARD: defaultBodyguard,
      WITCH: defaultWitch,
      HUNTER: defaultHunter,
      CUPID: defaultCupid
    });
  }, [playerNames.length]);

  // Compute Villagers
  const specialRolesCount = Object.entries(roles).reduce((acc, [role, count]) => {
    if (role === "VILLAGER") return acc;
    return acc + count;
  }, 0);
  const villagerCount = Math.max(0, playerNames.length - specialRolesCount);

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    if (playerNames.includes(newPlayerName.trim())) {
      setErrorMessage("Tên người chơi này đã tồn tại!");
      return;
    }
    if (playerNames.length >= 18) {
      setErrorMessage("Game hỗ trợ tối đa 18 người chơi!");
      return;
    }

    const updated = [...playerNames, newPlayerName.trim()];
    setPlayerNames(updated);
    localStorage.setItem("lucid_bose_werewolf_names", JSON.stringify(updated));
    setNewPlayerName("");
    setErrorMessage("");
    soundManager.playSuccess();
  };

  const handleRemovePlayer = (index: number) => {
    if (playerNames.length <= 4) {
      setErrorMessage("Yêu cầu tối thiểu 4 người chơi để chơi Ma Sói!");
      return;
    }
    const updated = playerNames.filter((_, i) => i !== index);
    setPlayerNames(updated);
    localStorage.setItem("lucid_bose_werewolf_names", JSON.stringify(updated));
    setErrorMessage("");
    soundManager.playSuccess();
  };

  const handleAdjustRole = (roleType: WerewolfRoleType, amount: number) => {
    if (roleType === "VILLAGER") return;
    setRoles(prev => {
      const current = prev[roleType] || 0;
      const next = Math.max(0, current + amount);
      
      // Safety checks: Max 4 wolves, max 1 of each special role (or max 2 for others)
      if (roleType === "WEREWOLF" && next > 4) return prev;
      if (roleType !== "WEREWOLF" && next > 1) return prev;

      // Verify that we do not exceed total players
      const tempRoles = { ...prev, [roleType]: next };
      const sumSpecials = Object.entries(tempRoles).reduce((acc, [r, count]) => {
        if (r === "VILLAGER") return acc;
        return acc + count;
      }, 0);

      if (sumSpecials > playerNames.length) {
        setErrorMessage("Tổng số lượng vai trò đặc biệt không được vượt quá số người chơi!");
        return prev;
      }

      setErrorMessage("");
      soundManager.playSuccess();
      return tempRoles;
    });
  };

  const handleStart = () => {
    if (playerNames.length < 4) {
      setErrorMessage("Yêu cầu tối thiểu 4 người chơi!");
      return;
    }

    if (roles.WEREWOLF === 0) {
      setErrorMessage("Phải có ít nhất 1 Ma Sói trong trận đấu!");
      return;
    }

    if (specialRolesCount > playerNames.length) {
      setErrorMessage("Lỗi: Tổng số lượng vai trò đặc biệt lớn hơn số người chơi!");
      return;
    }

    soundManager.playSuccess();
    
    // Complete configuration (including computed villagers)
    const finalRoles = {
      ...roles,
      VILLAGER: villagerCount
    };

    onStartGame({
      playerNames,
      roles: finalRoles
    });
  };

  return (
    <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "24px 16px" }}>
      {/* HEADER */}
      <div className="setup-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button onClick={onBack} className="btn-icon" title="Quay lại">
          <ArrowLeft size={20} />
        </button>
        <h2 className="gradient-text" style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, color: "#a78bfa" }}>
          MA SÓI (QUẢN TRÒ)
        </h2>
        <div style={{ width: "40px" }} />
      </div>

      <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "-12px", marginBottom: "20px" }}>
        Chế độ hỗ trợ Quản trò đắc lực. Điền tên người chơi và cấu hình vai trò bên dưới!
      </p>

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#fca5a5",
          padding: "10px 14px",
          borderRadius: "12px",
          marginBottom: "20px",
          fontSize: "0.8rem",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textAlign: "left"
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", textAlign: "left" }}>
        {/* PLAYER LIST SETUP */}
        <div className="form-group" style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "16px", borderRadius: "20px" }}>
          <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#ddd6fe" }}>
            <Users size={18} /> Danh sách người chơi ({playerNames.length}/18)
          </label>

          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="text"
              className="text-input"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
              placeholder="Nhập tên người chơi mới..."
              maxLength={15}
              style={{ flex: 1, height: "40px", fontSize: "0.85rem" }}
            />
            <button onClick={handleAddPlayer} className="btn btn-primary" style={{ width: "80px", height: "40px", padding: 0 }}>
              <Plus size={20} style={{ margin: "auto" }} />
            </button>
          </div>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            maxHeight: "150px",
            overflowY: "auto",
            padding: "4px"
          }}>
            {playerNames.map((name, index) => (
              <span
                key={index}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid rgba(139, 92, 246, 0.25)",
                  color: "#ddd6fe",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 500
                }}
              >
                {name}
                <button
                  onClick={() => handleRemovePlayer(index)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "#a78bfa",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* ROLE CONFIGURATION */}
        <div className="form-group" style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "16px", borderRadius: "20px" }}>
          <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "#ddd6fe" }}>
            <Shield size={18} /> Thiết lập Vai Trò Cư Dân
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Werewolves */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "8px" }}>
              <div>
                <span style={{ fontWeight: 700, color: "#fda4af" }}>🐺 {WEREWOLF_ROLES.WEREWOLF.name}</span>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>Ẩn mình cắn chết dân làng ban đêm</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={() => handleAdjustRole("WEREWOLF", -1)} className="btn-icon" style={{ width: "30px", height: "30px", padding: 0 }}>-</button>
                <span style={{ minWidth: "20px", textAlign: "center", fontWeight: 800 }}>{roles.WEREWOLF}</span>
                <button onClick={() => handleAdjustRole("WEREWOLF", 1)} className="btn-icon" style={{ width: "30px", height: "30px", padding: 0 }}>+</button>
              </div>
            </div>

            {/* Special Roles (Seer, Bodyguard, Witch, Hunter, Cupid) */}
            {(["SEER", "BODYGUARD", "WITCH", "HUNTER", "CUPID"] as WerewolfRoleType[]).map((roleKey) => {
              const roleInfo = WEREWOLF_ROLES[roleKey];
              const count = roles[roleKey] || 0;
              return (
                <div key={roleKey} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "8px" }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "#ddd6fe" }}>{roleInfo.emoji} {roleInfo.name}</span>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>{roleInfo.description.slice(0, 50)}...</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button onClick={() => handleAdjustRole(roleKey as WerewolfRoleType, -1)} className="btn-icon" style={{ width: "30px", height: "30px", padding: 0 }}>-</button>
                    <span style={{ minWidth: "20px", textAlign: "center", fontWeight: 800 }}>{count}</span>
                    <button onClick={() => handleAdjustRole(roleKey as WerewolfRoleType, 1)} className="btn-icon" style={{ width: "30px", height: "30px", padding: 0 }}>+</button>
                  </div>
                </div>
              );
            })}

            {/* Computed Villagers */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px" }}>
              <div>
                <span style={{ fontWeight: 700, color: "#86efac" }}>🧑‍🌾 {WEREWOLF_ROLES.VILLAGER.name} (Tự động)</span>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>Dân thường, chiến đấu bằng suy luận treo cổ sói</div>
              </div>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#86efac", marginRight: "12px" }}>
                {villagerCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* START BUTTON */}
      <button
        onClick={handleStart}
        className="btn btn-primary btn-block btn-large"
        style={{ marginTop: "24px", background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", borderColor: "#6d28d9", height: "54px" }}
      >
        TIẾN HÀNH PHÂN VAI TRÒ
      </button>

      <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
        <Info size={14} style={{ color: "#a78bfa" }} />
        <span>Vui lòng ngồi quây quần cùng nhau để bắt đầu chơi.</span>
      </div>
    </div>
  );
};
