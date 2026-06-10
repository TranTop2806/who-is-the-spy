import React, { useState, useEffect } from "react";
import { Users, Play, HelpCircle, Plus, Minus, BookOpen, Beer, ArrowLeft } from "lucide-react";
import { soundManager } from "../utils/SoundManager";

interface GameSetupProps {
  onStartGame: (settings: {
    playerNames: string[];
    pack: "CLASSIC" | "GEN_Z" | "MIXED";
    penaltyUnit: string;
  }) => void;
  onBack?: () => void;
}

export const DrinkingSetup: React.FC<GameSetupProps> = ({ onStartGame, onBack }) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [pack, setPack] = useState<"CLASSIC" | "GEN_Z" | "MIXED">("CLASSIC");
  const [penaltyUnit, setPenaltyUnit] = useState<string>("hớp");
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Sync player names count
  useEffect(() => {
    setPlayerNames((prev) => {
      const updated = [...prev];
      if (updated.length < playerCount) {
        for (let i = updated.length; i < playerCount; i++) {
          updated.push(`Người chơi ${i + 1}`);
        }
      } else if (updated.length > playerCount) {
        updated.splice(playerCount);
      }
      return updated;
    });
  }, [playerCount]);

  const handlePlayerNameChange = (index: number, val: string) => {
    setPlayerNames((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const incrementPlayers = () => {
    if (playerCount < 20) {
      soundManager.playClick();
      setPlayerCount(playerCount + 1);
    }
  };

  const decrementPlayers = () => {
    if (playerCount > 2) {
      soundManager.playClick();
      setPlayerCount(playerCount - 1);
    }
  };

  const handlePackSelect = (selectedPack: "CLASSIC" | "GEN_Z" | "MIXED") => {
    soundManager.playClick();
    setPack(selectedPack);
  };

  const handleUnitSelect = (unit: string) => {
    soundManager.playClick();
    setPenaltyUnit(unit);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    const trimmedNames = playerNames.map(name => name.trim()).filter(name => name.length > 0);
    if (trimmedNames.length < 2) {
      alert("Vui lòng nhập ít nhất 2 người chơi!");
      return;
    }

    onStartGame({
      playerNames: trimmedNames,
      pack,
      penaltyUnit,
    });
  };

  return (
    <div className="glass-panel max-width-container animated-slide-in">
      <div className="setup-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {onBack && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onBack();
              }}
              className="btn-icon back-btn"
              style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff" }}
              aria-label="Quay lại"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="gradient-text header-title" style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Beer size={28} style={{ color: "#f59e0b" }} /> Do or Drink!
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setShowHelp(!showHelp);
          }}
          className="btn-icon help-btn"
          aria-label="Luật chơi"
        >
          <HelpCircle size={22} />
        </button>
      </div>

      {showHelp && (
        <div className="help-box animated-fade-in" style={{ background: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.25)" }}>
          <h3 style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "6px" }}>
            <BookOpen size={16} /> Cách chơi "Do or Drink"
          </h3>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            <li style={{ marginBottom: "6px" }}>🍻 **Lần lượt rút bài**: Người chơi lần lượt bốc một lá bài ngẫu nhiên từ bộ bài đã chọn.</li>
            <li style={{ marginBottom: "6px" }}>🎯 **Làm hoặc Uống (Do or Drink)**: Trên mỗi lá bài có 1 thử thách (Dare), câu hỏi (Truth), luật chơi (Rule), biểu quyết (Vote) hoặc tương tác ngẫu nhiên.</li>
            <li style={{ marginBottom: "6px" }}>✅ **Làm thử thách**: Bạn vượt qua thử thách để nhận +1 điểm hoàn thành nhiệm vụ.</li>
            <li style={{ marginBottom: "6px" }}>🍺 **Chịu phạt / Uống**: Nếu từ chối làm hoặc trả lời sai, bạn phải uống số lượng phạt ghi trên lá bài.</li>
            <li style={{ marginBottom: "6px" }}>🏆 **Chiến thắng**: Trận đấu kết thúc khi hết bài hoặc bấm dừng. Người hoàn thành nhiều nhiệm vụ nhất thắng cuộc, người uống nhiều nhất phong danh "Thần Cồn"!</li>
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="setup-form">
        {/* PLAYER COUNT CONFIG */}
        <div className="form-group">
          <label className="input-label">
            <Users size={18} className="icon-margin" /> Số lượng người chơi
          </label>
          <div className="counter-control">
            <button type="button" onClick={decrementPlayers} className="counter-btn" disabled={playerCount <= 2}>
              <Minus size={18} />
            </button>
            <span className="counter-value">{playerCount}</span>
            <button type="button" onClick={incrementPlayers} className="counter-btn" disabled={playerCount >= 20}>
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* CARD PACK SELECTOR */}
        <div className="form-group">
          <label className="input-label">Chọn Bộ Bài</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              type="button"
              onClick={() => handlePackSelect("CLASSIC")}
              className={`toggle-role-btn ${pack === "CLASSIC" ? "active" : ""}`}
              style={{
                borderColor: pack === "CLASSIC" ? "var(--color-primary)" : "",
                background: pack === "CLASSIC" ? "rgba(99, 102, 241, 0.12)" : "",
                color: pack === "CLASSIC" ? "#c7d2fe" : "",
                height: "auto",
                minHeight: "46px",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "left"
              }}
            >
              <span>🍻 Do or Drink Cơ Bản</span>
              <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>250+ lá</span>
            </button>
            <button
              type="button"
              onClick={() => handlePackSelect("GEN_Z")}
              className={`toggle-role-btn ${pack === "GEN_Z" ? "active" : ""}`}
              style={{
                borderColor: pack === "GEN_Z" ? "var(--color-secondary)" : "",
                background: pack === "GEN_Z" ? "rgba(139, 92, 246, 0.12)" : "",
                color: pack === "GEN_Z" ? "#ddd6fe" : "",
                height: "auto",
                minHeight: "46px",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "left"
              }}
            >
              <span>⚡ Chịu Chơi hay Chịu Uống (Gen-Z)</span>
              <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>250+ lá</span>
            </button>
            <button
              type="button"
              onClick={() => handlePackSelect("MIXED")}
              className={`toggle-role-btn ${pack === "MIXED" ? "active" : ""}`}
              style={{
                borderColor: pack === "MIXED" ? "#f59e0b" : "",
                background: pack === "MIXED" ? "rgba(245, 158, 11, 0.12)" : "",
                color: pack === "MIXED" ? "#fde047" : "",
                height: "auto",
                minHeight: "46px",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "left"
              }}
            >
              <span>🔥 Siêu Hỗn Hợp (Cả hai bộ)</span>
              <span style={{ fontSize: "0.8rem", opacity: 0.9, fontWeight: "bold" }}>500+ lá</span>
            </button>
          </div>
        </div>

        {/* PENALTY UNIT CONFIG */}
        <div className="form-group">
          <label className="input-label">Đơn vị phạt</label>
          <div className="categories-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {["hớp", "chén", "ly"].map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => handleUnitSelect(unit)}
                className={`category-chip ${penaltyUnit === unit ? "active" : ""}`}
                style={{ fontSize: "0.9rem", padding: "12px 6px" }}
              >
                {unit.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* PLAYER NAMES INPUT */}
        <div className="form-group player-names-section" style={{ maxHeight: "200px" }}>
          <label className="input-label">Tên người chơi</label>
          <div className="player-names-list">
            {playerNames.map((name, idx) => (
              <div key={idx} className="name-input-wrapper">
                <span className="player-index-badge">{idx + 1}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                  className="text-input name-input"
                  maxLength={12}
                  placeholder={`Người chơi ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* START BUTTON */}
        <button type="submit" className="btn btn-primary btn-block btn-large start-game-btn" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)" }}>
          <Play size={20} className="icon-margin" /> Bắt Đầu Rút Bài!
        </button>
      </form>
    </div>
  );
};
