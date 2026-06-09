import React, { useState, useEffect, useRef } from "react";
import { Timer, Volume2, VolumeX, AlertTriangle, UserCheck, Skull, Shuffle } from "lucide-react";
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
}

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  civilianWord,
  category,
  round,
  onEliminatePlayer,
  onMrWhiteGuess,
  onNextRound,
}) => {
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
    selectRandomStarter();
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
            // Tick sound for last 5 seconds
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
    const alivePlayers = players.filter((p) => p.isAlive);
    if (alivePlayers.length > 0) {
      const randIndex = Math.floor(Math.random() * alivePlayers.length);
      const chosenPlayer = alivePlayers[randIndex];
      const actualIndex = players.findIndex((p) => p.id === chosenPlayer.id);
      setStarterIndex(actualIndex);
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
        // Normal player elimination
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
      // First eliminate the player, then process the guess outcome
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
      <div className="board-header">
        <div>
          <span className="round-badge">Vòng {round}</span>
          <h2 className="board-category">Chủ đề: {category}</h2>
        </div>
        <div className="alive-stats">
          <span className="stat-pill civilian">Dân: {civiliansAlive}</span>
          {spiesAlive > 0 && <span className="stat-pill spy">Gián điệp: {spiesAlive}</span>}
          {whiteAlive > 0 && <span className="stat-pill white">Mr. White: {whiteAlive}</span>}
        </div>
      </div>

      {/* TIMER CARD */}
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
            <button onClick={handleTimerReset} className="btn btn-outline timer-btn">
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* STARTER BOX */}
      {starterIndex !== -1 && players[starterIndex]?.isAlive && (
        <div className="starter-box animated-pulse-border">
          <div className="starter-icon-wrapper">
            <UserCheck size={20} className="color-emerald" />
          </div>
          <div className="starter-text-content">
            <span className="starter-label">Người mô tả đầu tiên:</span>
            <strong className="starter-name">{players[starterIndex].name}</strong>
          </div>
          <button onClick={selectRandomStarter} className="btn-icon shuffle-btn" title="Chọn ngẫu nhiên người khác">
            <Shuffle size={18} />
          </button>
        </div>
      )}

      {/* PLAYERS LIST */}
      <h3 className="section-title">Danh sách người chơi ({players.filter(p => p.isAlive).length} còn sống)</h3>
      <div className="board-players-grid">
        {players.map((player, idx) => {
          const isStarter = idx === starterIndex;
          return (
            <div
              key={player.id}
              className={`board-player-card ${!player.isAlive ? "is-dead" : ""} ${isStarter ? "is-starter" : ""}`}
            >
              <div className="player-card-header">
                <div className="player-avatar-small-wrapper">
                  <span className="player-avatar-small">{player.name.slice(0, 2).toUpperCase()}</span>
                  {isStarter && player.isAlive && <span className="starter-badge">Nói đầu</span>}
                </div>
                <div className="player-name-wrapper">
                  <span className="player-board-name">{player.name}</span>
                  {!player.isAlive && (
                    <span className="player-status-badge dead">
                      <Skull size={10} className="icon-margin" /> Bị loại
                    </span>
                  )}
                  {player.isAlive && <span className="player-status-badge alive">Sống</span>}
                </div>
              </div>

              {!player.isAlive ? (
                <div className="dead-player-info">
                  <span className="dead-role-reveal">
                    {player.role === "CIVILIAN" ? "Dân Thường" : player.role === "SPY" ? "Gián Điệp" : "Mr. White"}
                  </span>
                  {player.role !== "MR_WHITE" && (
                    <span className="dead-word-reveal">"{player.word}"</span>
                  )}
                </div>
              ) : (
                <div className="player-card-actions">
                  <button
                    onClick={() => openVoteModal(player.id)}
                    className="btn btn-danger btn-sm btn-block vote-eliminate-btn"
                  >
                    Biểu quyết loại
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* NEXT ROUND ACTION BUTTON (when no one is eliminated yet, or just to sync) */}
      <div className="board-bottom-actions">
        <button onClick={onNextRound} className="btn btn-outline btn-block mt-4">
          Qua vòng mới (Không loại ai)
        </button>
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
