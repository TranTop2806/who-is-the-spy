import React, { useState, useEffect } from "react";
import { Users, Shield, UserX, Play, HelpCircle, Plus, Minus, Tag } from "lucide-react";
import { CATEGORIES } from "../data/words";
import { soundManager } from "../utils/SoundManager";

interface GameSetupProps {
  onStartGame: (settings: {
    playerNames: string[];
    spyCount: number;
    mrWhiteCount: number;
    category: string;
    customCivilianWord: string;
    customSpyWord: string;
  }) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState<number>(5);
  const [spyCount, setSpyCount] = useState<number>(1);
  const [mrWhiteCount, setMrWhiteCount] = useState<number>(0);
  const [category, setCategory] = useState<string>("Tất cả");
  const [customCivilianWord, setCustomCivilianWord] = useState<string>("");
  const [customSpyWord, setCustomSpyWord] = useState<string>("");
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Synchronize player names length with playerCount
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

    // Auto-adjust Spy and Mr White count if player count is too low
    const maxSpies = Math.max(1, Math.floor((playerCount - 1) / 2));
    if (spyCount > maxSpies) {
      setSpyCount(maxSpies);
    }
    const maxMrWhite = playerCount > 3 ? 1 : 0;
    if (mrWhiteCount > maxMrWhite) {
      setMrWhiteCount(maxMrWhite);
    }
  }, [playerCount]);

  const handlePlayerNameChange = (index: number, val: string) => {
    setPlayerNames((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const incrementPlayers = () => {
    if (playerCount < 15) {
      soundManager.playClick();
      setPlayerCount(playerCount + 1);
    }
  };

  const decrementPlayers = () => {
    if (playerCount > 3) {
      soundManager.playClick();
      setPlayerCount(playerCount - 1);
    }
  };

  const incrementSpies = () => {
    const maxSpies = Math.max(1, Math.floor((playerCount - 1) / 2));
    if (spyCount < maxSpies) {
      soundManager.playClick();
      setSpyCount(spyCount + 1);
    }
  };

  const decrementSpies = () => {
    if (spyCount > 1) {
      soundManager.playClick();
      setSpyCount(spyCount - 1);
    }
  };

  const toggleMrWhite = () => {
    if (playerCount <= 3) return; // Mr. White not recommended for <= 3 players
    soundManager.playClick();
    setMrWhiteCount(mrWhiteCount === 0 ? 1 : 0);
  };

  const handleCategorySelect = (cat: string) => {
    soundManager.playClick();
    setCategory(cat);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    if (category === "Tự nhập từ khóa" && (!customCivilianWord.trim() || !customSpyWord.trim())) {
      alert("Vui lòng nhập đầy đủ từ khóa cho Dân thường và Gián điệp!");
      return;
    }

    onStartGame({
      playerNames,
      spyCount,
      mrWhiteCount,
      category,
      customCivilianWord,
      customSpyWord,
    });
  };

  return (
    <div className="glass-panel max-width-container animated-slide-in">
      <div className="setup-header">
        <h1 className="gradient-text text-center header-title">Ai Là Gián Điệp?</h1>
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
        <div className="help-box animated-fade-in">
          <h3>Luật chơi tóm tắt:</h3>
          <ul>
            <li><strong>Dân thường:</strong> Nhận từ khóa A. Mô tả làm sao để đồng đội hiểu nhưng tránh để Gián điệp đoán được.</li>
            <li><strong>Gián điệp:</strong> Nhận từ khóa B (gần giống A). Mô tả trà trộn để không bị phát hiện là Gián điệp.</li>
            <li><strong>Kẻ trắng tay (Mr. White):</strong> Không có từ khóa. Phải lắng nghe mô tả của người khác để suy đoán từ khóa và bịa mô tả cho hợp lý.</li>
            <li>Mỗi vòng, mọi người mô tả 1 lượt. Sau đó thảo luận và biểu quyết treo cổ 1 người nghi vấn.</li>
            <li><strong>Điều kiện thắng:</strong> Dân thường thắng khi diệt hết Gián điệp & Mr. White. Gián điệp thắng khi số Gián điệp bằng số Dân thường. Mr. White thắng nếu bị loại nhưng đoán trúng từ khóa Dân thường.</li>
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
            <button type="button" onClick={decrementPlayers} className="counter-btn" disabled={playerCount <= 3}>
              <Minus size={18} />
            </button>
            <span className="counter-value">{playerCount}</span>
            <button type="button" onClick={incrementPlayers} className="counter-btn" disabled={playerCount >= 15}>
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* ROLE CONFIG */}
        <div className="role-configs-grid">
          <div className="form-group flex-1">
            <label className="input-label">
              <Shield size={18} className="icon-margin color-spy" /> Gián điệp (Spy)
            </label>
            <div className="counter-control small">
              <button type="button" onClick={decrementSpies} className="counter-btn" disabled={spyCount <= 1}>
                <Minus size={16} />
              </button>
              <span className="counter-value small">{spyCount}</span>
              <button
                type="button"
                onClick={incrementSpies}
                className="counter-btn"
                disabled={spyCount >= Math.max(1, Math.floor((playerCount - 1) / 2))}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className={`form-group flex-1 ${playerCount <= 3 ? "opacity-disabled" : ""}`}>
            <label className="input-label">
              <UserX size={18} className="icon-margin color-white" /> Mr. White
            </label>
            <button
              type="button"
              onClick={toggleMrWhite}
              disabled={playerCount <= 3}
              className={`toggle-role-btn ${mrWhiteCount > 0 ? "active" : ""}`}
            >
              {mrWhiteCount > 0 ? "Bật" : "Tắt"}
            </button>
          </div>
        </div>

        {/* CATEGORY SELECTOR */}
        <div className="form-group">
          <label className="input-label">
            <Tag size={18} className="icon-margin" /> Chủ đề từ khóa
          </label>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`category-chip ${category === cat ? "active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* CUSTOM WORDS INPUTS */}
        {category === "Tự nhập từ khóa" && (
          <div className="custom-words-inputs animated-slide-in">
            <div className="form-group">
              <label className="input-label small-label">Từ khóa Dân thường</label>
              <input
                type="text"
                placeholder="Ví dụ: Phở"
                value={customCivilianWord}
                onChange={(e) => setCustomCivilianWord(e.target.value)}
                className="text-input"
                maxLength={25}
              />
            </div>
            <div className="form-group">
              <label className="input-label small-label">Từ khóa Gián điệp</label>
              <input
                type="text"
                placeholder="Ví dụ: Bún chả"
                value={customSpyWord}
                onChange={(e) => setCustomSpyWord(e.target.value)}
                className="text-input"
                maxLength={25}
              />
            </div>
          </div>
        )}

        {/* PLAYER NAMES INPUT */}
        <div className="form-group player-names-section">
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
                  maxLength={15}
                  placeholder={`Người chơi ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* START BUTTON */}
        <button type="submit" className="btn btn-primary btn-block start-game-btn">
          <Play size={20} className="icon-margin" /> Vào Trận Đấu
        </button>
      </form>
    </div>
  );
};
