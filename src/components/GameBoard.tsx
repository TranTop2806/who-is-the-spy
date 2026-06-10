import React, { useState, useEffect, useRef } from "react";
import { Timer, Volume2, VolumeX, AlertTriangle, Shuffle, Mic, AlertCircle, ArrowRight } from "lucide-react";
import { soundManager } from "../utils/SoundManager";

interface Player {
  id: string;
  name: string;
  role: "CIVILIAN" | "SPY" | "MR_WHITE";
  word: string;
  isAlive: boolean;
  hasSeenWord: boolean;
}

interface GameBoardProps {
  players: Player[];
  civilianWord: string;
  category: string;
  round: number;
  onEliminatePlayer: (playerId: string) => void;
  onMrWhiteGuess: (isCorrect: boolean, guess: string) => void;
  onNextRound: () => void;
  onQuit: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  civilianWord,
  category,
  round,
  onEliminatePlayer,
  onMrWhiteGuess,
  onNextRound,
  onQuit,
}) => {
  const [gamePhase, setGamePhase] = useState<"DESCRIBE" | "VOTE">("DESCRIBE");
  const [currentDescriberId, setCurrentDescriberId] = useState<string | null>(null);
  const [describedPlayerIds, setDescribedPlayerIds] = useState<string[]>([]);

  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [starterIndex, setStarterIndex] = useState<number>(-1);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showVoteModal, setShowVoteModal] = useState<boolean>(false);
  
  // Mr White guess states
  const [mrWhitePlayer, setMrWhitePlayer] = useState<Player | null>(null);
  const [mrWhiteGuess, setMrWhiteGuess] = useState<string>("");
  const [showMrWhiteGuessModal, setShowMrWhiteGuessModal] = useState<boolean>(false);
  const [showGroupVerifyModal, setShowGroupVerifyModal] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Initialize starting player randomly on round start
  useEffect(() => {
    const alive = players.filter((p) => p.isAlive);
    if (alive.length > 0) {
      const randIndex = Math.floor(Math.random() * alive.length);
      const chosenPlayer = alive[randIndex];
      const actualIndex = players.findIndex((p) => p.id === chosenPlayer.id);
      
      setStarterIndex(actualIndex);
      setCurrentDescriberId(chosenPlayer.id);
    }
    
    setDescribedPlayerIds([]);
    setGamePhase("DESCRIBE");
    setIsTimerRunning(false);
    setTimerSeconds(30);
  }, [round]);

  // Timer interval effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            if (!isMuted) soundManager.playTimeUp();
            return 0;
          }
          if (prev <= 6 && !isMuted) {
            soundManager.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isMuted]);

  const selectRandomStarter = () => {
    const alive = players.filter((p) => p.isAlive);
    if (alive.length > 0) {
      const randIndex = Math.floor(Math.random() * alive.length);
      const chosenPlayer = alive[randIndex];
      const actualIndex = players.findIndex((p) => p.id === chosenPlayer.id);
      
      setStarterIndex(actualIndex);
      setCurrentDescriberId(chosenPlayer.id);
      setTimerSeconds(30);
      setIsTimerRunning(false);
    }
  };

  const handleTimerToggle = () => {
    soundManager.playClick();
    setIsTimerRunning(!isTimerRunning);
  };

  const handleTimerReset = () => {
    soundManager.playClick();
    setIsTimerRunning(false);
    setTimerSeconds(30);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Next describer clockwise rotation
  const handleNextDescriber = () => {
    setIsTimerRunning(false);
    
    // Add current player to described list
    const updatedDescribed = currentDescriberId 
      ? [...describedPlayerIds, currentDescriberId]
      : describedPlayerIds;
    
    setDescribedPlayerIds(updatedDescribed);

    const currentIndex = players.findIndex((p) => p.id === currentDescriberId);

    // Find next alive player in list (clockwise) who hasn't described yet
    let nextPlayer: Player | null = null;
    for (let i = 1; i <= players.length; i++) {
      const checkIdx = (currentIndex + i) % players.length;
      const p = players[checkIdx];
      
      if (p.isAlive && !updatedDescribed.includes(p.id) && p.id !== currentDescriberId) {
        nextPlayer = p;
        break;
      }
    }

    if (nextPlayer) {
      setCurrentDescriberId(nextPlayer.id);
      setTimerSeconds(30);
      setIsTimerRunning(false);
    } else {
      // All players described! Transition to VOTE phase
      soundManager.playSuccess();
      setGamePhase("VOTE");
      setCurrentDescriberId(null);
    }
  };

  const selectDescriberManually = (playerId: string) => {
    const targetPlayer = players.find((p) => p.id === playerId);
    if (targetPlayer && targetPlayer.isAlive && gamePhase === "DESCRIBE") {
      soundManager.playClick();
      setIsTimerRunning(false);
      setCurrentDescriberId(playerId);
      setTimerSeconds(30);
    }
  };

  const openVoteModal = (playerId: string) => {
    soundManager.playClick();
    setSelectedPlayerId(playerId);
    setShowVoteModal(true);
  };

  const closeVoteModal = () => {
    soundManager.playClick();
    setSelectedPlayerId(null);
    setShowVoteModal(false);
  };

  const confirmElimination = () => {
    if (!selectedPlayerId) return;
    soundManager.playClick();
    const targetPlayer = players.find((p) => p.id === selectedPlayerId);
    
    if (targetPlayer) {
      setShowVoteModal(false);
      setSelectedPlayerId(null);

      if (targetPlayer.role === "MR_WHITE") {
        setMrWhitePlayer(targetPlayer);
        setShowMrWhiteGuessModal(true);
      } else {
        onEliminatePlayer(targetPlayer.id);
      }
    }
  };

  // Mr White Guess Handlers
  const handleMrWhiteSubmitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!mrWhiteGuess.trim()) {
      alert("Vui lòng nhập từ khóa dự đoán!");
      return;
    }
    setShowMrWhiteGuessModal(false);
    setShowGroupVerifyModal(true);
  };

  const handleGroupVerification = (isCorrect: boolean) => {
    soundManager.playClick();
    setShowGroupVerifyModal(false);
    if (mrWhitePlayer) {
      onEliminatePlayer(mrWhitePlayer.id);
      onMrWhiteGuess(isCorrect, mrWhiteGuess);
      setMrWhiteGuess("");
      setMrWhitePlayer(null);
    }
  };

  const alivePlayers = players.filter((p) => p.isAlive);
  const totalAlive = alivePlayers.length;
  const spiesAlive = alivePlayers.filter((p) => p.role === "SPY").length;
  const whiteAlive = alivePlayers.filter((p) => p.role === "MR_WHITE").length;
  const civiliansAlive = totalAlive - spiesAlive - whiteAlive;

  return (
    <div className="glass-panel max-width-container animated-slide-in board-screen-container">
      {/* HEADER SECTION */}
      <div className="board-header" style={{ flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
          <div>
            <span className="round-badge">Vòng {round}</span>
            <h2 className="board-category">Chủ đề: {category}</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm("Bạn có chắc chắn muốn thoát trận đấu này và quay lại cài đặt?")) {
                soundManager.playClick();
                onQuit();
              }
            }}
            className="btn-icon quit-game-btn"
            title="Thoát trận"
            style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(244, 63, 94, 0.15)", borderColor: "rgba(244, 63, 94, 0.3)", color: "#f87171" }}
          >
            ✕
          </button>
        </div>
        <div className="alive-stats" style={{ display: "flex", flexDirection: "row", gap: "6px", justifyContent: "flex-start" }}>
          <span className="stat-pill civilian">Dân: {civiliansAlive}</span>
          {spiesAlive > 0 && <span className="stat-pill spy">Gián điệp: {spiesAlive}</span>}
          {whiteAlive > 0 && <span className="stat-pill white">Mr. White: {whiteAlive}</span>}
        </div>
      </div>

      {/* GAME PHASE BANNER */}
      {gamePhase === "DESCRIBE" ? (
        <div className="starter-box animated-pulse-border" style={{ background: "rgba(99, 102, 241, 0.08)", borderColor: "rgba(99, 102, 241, 0.25)" }}>
          <div className="starter-icon-wrapper" style={{ background: "rgba(99, 102, 241, 0.15)", borderColor: "rgba(99, 102, 241, 0.25)", color: "#a78bfa" }}>
            <Mic size={20} className="animate-pulse" />
          </div>
          <div className="starter-text-content">
            <span className="starter-label">Lượt mô tả của:</span>
            <strong className="starter-name" style={{ color: "#a78bfa" }}>
              {players.find((p) => p.id === currentDescriberId)?.name || "Chưa chọn"}
            </strong>
          </div>
          <button onClick={selectRandomStarter} className="btn-icon shuffle-btn" title="Chọn ngẫu nhiên người bắt đầu" style={{ opacity: describedPlayerIds.length === 0 ? 0.7 : 0.2, pointerEvents: describedPlayerIds.length === 0 ? "auto" : "none" }}>
            <Shuffle size={18} />
          </button>
        </div>
      ) : (
        <div className="starter-box animated-pulse-border" style={{ background: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.25)" }}>
          <div className="starter-icon-wrapper" style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.25)", color: "var(--color-emerald)" }}>
            <AlertCircle size={20} />
          </div>
          <div className="starter-text-content">
            <span className="starter-label" style={{ color: "var(--color-emerald)", fontWeight: 600 }}>Thảo luận & Bỏ phiếu</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Hãy biểu quyết loại người chơi nghi ngờ nhất!
            </span>
          </div>
        </div>
      )}

      {/* TIMER CARD (Only in DESCRIBE phase) */}
      {gamePhase === "DESCRIBE" && (
        <div className="timer-card">
          <div className="timer-info-row">
            <div className="timer-title-wrapper">
              <Timer className={`timer-icon ${isTimerRunning ? "animate-pulse color-emerald" : ""}`} size={20} />
              <span>Thời gian mô tả</span>
            </div>
            <button onClick={toggleMute} className="btn-icon mute-btn" aria-label="Bật/Tắt âm thanh">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          <div className="timer-countdown-row">
            <div className={`timer-countdown-display ${timerSeconds <= 5 ? "countdown-critical" : ""}`}>
              {timerSeconds}s
            </div>
            <div className="timer-actions">
              <button onClick={handleTimerToggle} className={`btn ${isTimerRunning ? "btn-secondary" : "btn-primary"} timer-btn`}>
                {isTimerRunning ? "Tạm dừng" : "Bắt đầu"}
              </button>
              <button onClick={handleTimerReset} className="btn btn-outline timer-btn" style={{ flex: 0.5 }}>
                Đặt lại
              </button>
              <button onClick={handleNextDescriber} className="btn btn-emerald timer-btn" style={{ flex: 1 }}>
                Xong <ArrowRight size={16} className="icon-margin-left" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAYERS LIST */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="section-title">
          {gamePhase === "DESCRIBE" ? "Thứ tự mô tả từ khóa" : "Chọn người chơi để loại bỏ"}
        </h3>
        {gamePhase === "DESCRIBE" && (
          <button
            onClick={() => {
              soundManager.playClick();
              setGamePhase("VOTE");
              setCurrentDescriberId(null);
            }}
            className="btn btn-outline btn-sm"
            style={{ borderColor: "rgba(16, 185, 129, 0.3)", color: "#34d399", height: "30px", fontSize: "0.75rem" }}
          >
            Bỏ phiếu luôn
          </button>
        )}
      </div>

      <div className="board-players-grid">
        {players.map((player, idx) => {
          const isStarter = idx === starterIndex;
          const isActive = player.id === currentDescriberId;
          const hasDescribed = describedPlayerIds.includes(player.id);
          
          let cardStatusClass = "";
          let badgeText = "";
          let badgeClass = "";
          
          if (!player.isAlive) {
            cardStatusClass = "is-dead";
            badgeText = "Bị loại";
            badgeClass = "dead";
          } else if (gamePhase === "DESCRIBE") {
            if (isActive) {
              cardStatusClass = "is-starter"; // Highlight active describer
              badgeText = "Đang nói 🎤";
              badgeClass = "alive";
            } else if (hasDescribed) {
              cardStatusClass = "is-described";
              badgeText = "Đã nói ✓";
              badgeClass = "described-badge";
            } else {
              badgeText = "Đợi";
              badgeClass = "waiting-badge";
            }
          } else {
            badgeText = "Sống";
            badgeClass = "alive";
          }

          return (
            <div
              key={player.id}
              onClick={() => {
                if (gamePhase === "DESCRIBE" && player.isAlive && !hasDescribed) {
                  selectDescriberManually(player.id);
                }
              }}
              className={`board-player-card ${cardStatusClass}`}
              style={{
                cursor: (gamePhase === "DESCRIBE" && player.isAlive && !hasDescribed) ? "pointer" : "default",
                border: isActive ? "1.5px solid var(--color-emerald)" : "",
                boxShadow: isActive ? "0 0 12px rgba(16, 185, 129, 0.25)" : "",
                opacity: (gamePhase === "DESCRIBE" && hasDescribed && !isActive) ? 0.6 : 1
              }}
            >
              <div className="player-card-header">
                <div className="player-avatar-small-wrapper">
                  <span className="player-avatar-small">{player.name.slice(0, 2).toUpperCase()}</span>
                  {isStarter && player.isAlive && <span className="starter-badge">Nói đầu</span>}
                </div>
                <div className="player-name-wrapper">
                  <span className="player-board-name">{player.name}</span>
                  <span className={`player-status-badge ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>
              </div>

              {!player.isAlive ? (
                <div className="dead-player-info">
                  <span className="dead-role-reveal" style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    Bí mật 💀
                  </span>
                </div>
              ) : (
                gamePhase === "VOTE" && (
                  <div className="player-card-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openVoteModal(player.id);
                      }}
                      className="btn btn-danger btn-sm vote-eliminate-btn"
                    >
                      Biểu quyết loại
                    </button>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="board-bottom-actions">
        {gamePhase === "VOTE" ? (
          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            <button
              onClick={() => {
                soundManager.playClick();
                setGamePhase("DESCRIBE");
                // Resume descriptions from the first person who hasn't described yet
                const alive = players.filter((p) => p.isAlive);
                const undescributed = alive.filter((p) => !describedPlayerIds.includes(p.id));
                if (undescributed.length > 0) {
                  setCurrentDescriberId(undescributed[0].id);
                } else {
                  setCurrentDescriberId(alive[0].id);
                }
                setTimerSeconds(30);
              }}
              className="btn btn-outline flex-1"
            >
              Quay lại mô tả
            </button>
            <button onClick={onNextRound} className="btn btn-secondary flex-1">
              Bỏ qua vòng này
            </button>
          </div>
        ) : (
          <button onClick={onNextRound} className="btn btn-outline btn-block">
            Qua vòng mới (Không loại ai)
          </button>
        )}
      </div>

      {/* ELIMINATION CONFIRMATION MODAL */}
      {showVoteModal && selectedPlayerId && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animated-bounce-in">
            <AlertTriangle size={36} className="color-danger animate-pulse text-center block-center mb-4" />
            <h3 className="modal-title">Xác nhận biểu quyết loại</h3>
            <p className="modal-description text-center">
              Cả nhóm đã thống nhất biểu quyết loại người chơi{" "}
              <strong>{players.find((p) => p.id === selectedPlayerId)?.name}</strong> ra khỏi trò chơi?
            </p>
            <div className="modal-actions-row">
              <button onClick={closeVoteModal} className="btn btn-outline flex-1">
                Hủy bỏ
              </button>
              <button onClick={confirmElimination} className="btn btn-danger flex-1">
                Đồng ý, loại!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MR. WHITE GUESS MODAL */}
      {showMrWhiteGuessModal && mrWhitePlayer && (
        <div className="modal-overlay">
          <form onSubmit={handleMrWhiteSubmitGuess} className="modal-content glass-panel animated-bounce-in">
            <h3 className="modal-title">Mr. White bị loại!</h3>
            <p className="modal-description text-center">
              <strong>{mrWhitePlayer.name}</strong> là <strong>Mr. White</strong>! Bạn có 1 cơ hội duy nhất để đoán từ khóa của Dân thường. Nếu đoán đúng, bạn sẽ thắng cuộc!
            </p>
            <div className="form-group mt-4">
              <label className="input-label">Dự đoán từ khóa của Dân thường:</label>
              <input
                type="text"
                placeholder="Nhập từ khóa dự đoán..."
                value={mrWhiteGuess}
                onChange={(e) => setMrWhiteGuess(e.target.value)}
                className="text-input"
                autoFocus
                maxLength={20}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block mt-4">
              Xác nhận dự đoán
            </button>
          </form>
        </div>
      )}

      {/* GROUP VERIFY MR. WHITE GUESS MODAL */}
      {showGroupVerifyModal && mrWhitePlayer && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animated-bounce-in">
            <h3 className="modal-title text-center">Kiểm tra kết quả đoán</h3>
            
            <div className="verify-word-pairs-box">
              <div className="verify-item">
                <span className="verify-label">Từ khóa thực tế của Dân thường:</span>
                <span className="verify-value civilian">{civilianWord}</span>
              </div>
              <div className="verify-item">
                <span className="verify-label">Mr. White đoán:</span>
                <span className="verify-value guess">"{mrWhiteGuess}"</span>
              </div>
            </div>

            <p className="modal-description text-center mt-4">
              Cả nhóm hãy biểu quyết xem từ khóa đoán của Mr. White có trùng khớp (hoặc cùng nghĩa/chấp nhận được) với từ khóa thực tế không?
            </p>

            <div className="modal-actions-row mt-4">
              <button onClick={() => handleGroupVerification(false)} className="btn btn-danger flex-1">
                Đoán sai (Mr. White Bị Loại)
              </button>
              <button onClick={() => handleGroupVerification(true)} className="btn btn-emerald flex-1">
                Đoán đúng (Mr. White Thắng)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
