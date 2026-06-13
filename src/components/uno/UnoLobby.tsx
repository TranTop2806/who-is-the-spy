import React, { useEffect, useState } from "react";
import { Users, Copy, Check, Shield, LogOut, ArrowRight, Loader2 } from "lucide-react";
import { soundManager } from "../../utils/SoundManager";
import { listenToRoom, updateRoomState, getFirebaseDb } from "../../utils/firebase";
import { generateUnoDeck } from "../../data/unoCards";
import { ref, set } from "firebase/database";

interface UnoLobbyProps {
  roomCode: string;
  playerId: string;
  playerName: string;
  onGameStarted: () => void;
  onQuit: () => void;
}

export const UnoLobby: React.FC<UnoLobbyProps> = ({
  roomCode,
  playerId,
  playerName,
  onGameStarted,
  onQuit,
}) => {
  const [roomData, setRoomData] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [starting, setStarting] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = listenToRoom(roomCode, (data) => {
      if (!data) {
        alert("Phòng chơi đã bị hủy hoặc không tồn tại!");
        onQuit();
        return;
      }
      setRoomData(data);
      if (data.status === "PLAYING") {
        onGameStarted();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode, onGameStarted, onQuit]);

  if (!roomData) {
    return (
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "40px 20px" }}>
        <Loader2 className="animate-spin block-center" size={40} style={{ color: "var(--color-primary)", marginBottom: "16px" }} />
        <p style={{ color: "var(--text-secondary)" }}>Đang kết nối đến phòng chơi...</p>
      </div>
    );
  }

  const players = roomData.players || {};
  const playerIds = Object.keys(players);
  const isHost = roomData.hostId === playerId;
  const playerList = Object.values(players) as any[];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    soundManager.playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = async () => {
    if (window.confirm("Bạn có chắc chắn muốn rời phòng?")) {
      soundManager.playSuccess();
      try {
        const db = getFirebaseDb();
        if (!db) return;

        if (isHost) {
          await set(ref(db, `rooms/${roomCode}`), null);
        } else {
          await set(ref(db, `rooms/${roomCode}/players/${playerId}`), null);
          const nextLogs = [...(roomData.logs || []), `${playerName} đã rời phòng`];
          await set(ref(db, `rooms/${roomCode}/logs`), nextLogs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        onQuit();
      }
    }
  };

  const handleStartGame = async () => {
    if (playerIds.length < 2) {
      alert("Cần ít nhất 2 người chơi để bắt đầu game!");
      return;
    }

    setStarting(true);
    soundManager.playSuccess();

    try {
      // 1. Generate new Uno deck
      const deck = generateUnoDeck();

      // 2. Deal 7 cards to each player
      const playerHands: Record<string, any[]> = {};
      playerIds.forEach((id) => {
        playerHands[id] = [];
      });

      for (let c = 0; c < 7; c++) {
        playerIds.forEach((id) => {
          const card = deck.shift();
          if (card) {
            playerHands[id].push(card);
          }
        });
      }

      // 3. Draw first card as top card (must not be WILD)
      let topCard = deck.shift();
      while (topCard && topCard.color === "WILD") {
        deck.push(topCard); // put back at bottom
        topCard = deck.shift();
      }

      if (!topCard) {
        throw new Error("Không thể rút lá bài khởi đầu hợp lệ!");
      }

      // 4. Create database updates
      const updates: any = {
        status: "PLAYING",
        drawPile: deck,
        discardPile: [topCard],
        topCard: topCard,
        currentActiveColor: topCard.color,
        turnIndex: 0,
        direction: "CW", // Clockwise
        drawPenalty: 0,
        lastAction: {
          type: "START",
          senderId: playerId,
          timestamp: Date.now()
        },
        logs: [...(roomData.logs || []), `🎮 Trận đấu bắt đầu! Lá bài mở đầu là ${topCard.color} ${topCard.value ?? ""} (${topCard.type})`]
      };

      // Assign hands
      playerIds.forEach((id) => {
        updates[`players/${id}/hand`] = playerHands[id];
      });

      await updateRoomState(roomCode, updates);
    } catch (e) {
      console.error(e);
      alert("Lỗi khi bắt đầu game!");
      setStarting(false);
    }
  };

  return (
    <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "30px 20px" }}>
      {/* ROOM CODE SECTION */}
      <div style={{ marginBottom: "28px" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Mã phòng của bạn
        </span>
        <div
          onClick={handleCopyCode}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1.5px dashed rgba(255, 255, 255, 0.15)",
            padding: "10px 24px",
            borderRadius: "16px",
            fontSize: "2.2rem",
            fontWeight: 800,
            color: "var(--color-primary)",
            cursor: "pointer",
            margin: "8px 0",
            transition: "all 0.2s"
          }}
          title="Nhấn để sao chép"
        >
          {roomCode}
          {copied ? <Check size={24} style={{ color: "var(--color-emerald)" }} /> : <Copy size={20} className="text-muted" />}
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Chia sẻ mã phòng này để bạn bè tham gia
        </p>
      </div>

      {/* PLAYERS LIST SECTION */}
      <div className="form-group" style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span className="input-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={18} /> Danh sách người chơi ({playerIds.length}/10)
          </span>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1.5px solid rgba(255, 255, 255, 0.05)",
          padding: "16px",
          borderRadius: "20px",
          maxHeight: "240px",
          overflowY: "auto"
        }}>
          {playerList.map((player, idx) => {
            const isPlayerHost = roomData.hostId === playerIds[idx];
            const isMe = playerIds[idx] === playerId;

            return (
              <div
                key={playerIds[idx]}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: isMe ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.03)",
                  border: isMe ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: isMe ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#ffffff"
                  }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: isMe ? 600 : 400, color: isMe ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {player.name} {isMe && "(Bạn)"}
                  </span>
                </div>
                {isPlayerHost && (
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.7rem",
                    padding: "2px 8px",
                    background: "rgba(234, 179, 8, 0.15)",
                    border: "1px solid rgba(234, 179, 8, 0.3)",
                    color: "#fef08a",
                    borderRadius: "20px",
                    fontWeight: 600
                  }}>
                    <Shield size={12} /> Chủ phòng
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={playerIds.length < 2 || starting}
            className="btn btn-primary btn-block btn-large animate-pulse"
            style={{ display: "flex", gap: "8px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderColor: "#059669" }}
          >
            {starting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                ĐANG KHỞI TẠO...
              </>
            ) : (
              <>
                BẮT ĐẦU TRẬN ĐẤU
                <ArrowRight size={20} />
              </>
            )}
          </button>
        ) : (
          <div style={{
            padding: "16px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "16px",
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px"
          }}>
            <Loader2 className="animate-spin" size={16} style={{ color: "#10b981" }} />
            Chờ chủ phòng bắt đầu trận đấu...
          </div>
        )}

        <button
          onClick={handleLeaveRoom}
          disabled={starting}
          className="btn btn-outline btn-block"
          style={{ height: "48px", display: "flex", gap: "8px", borderColor: "rgba(244, 63, 94, 0.2)", color: "#fda4af" }}
        >
          <LogOut size={16} /> RỜI PHÒNG
        </button>
      </div>
    </div>
  );
};
