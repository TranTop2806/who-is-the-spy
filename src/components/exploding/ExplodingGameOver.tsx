import React, { useEffect, useState } from "react";
import { Award, RotateCcw, Home, Skull, Users, List, Loader2 } from "lucide-react";
import { soundManager } from "../../utils/SoundManager";
import { listenToRoom, updateRoomState, getFirebaseDb } from "../../utils/firebase";
import { ref, set } from "firebase/database";

interface ExplodingGameOverProps {
  roomCode: string;
  playerId: string;
  onRestart: () => void;
  onQuit: () => void;
}

export const ExplodingGameOver: React.FC<ExplodingGameOverProps> = ({
  roomCode,
  playerId,
  onRestart,
  onQuit,
}) => {
  const [roomData, setRoomData] = useState<any>(null);
  const [resetting, setResetting] = useState<boolean>(false);

  useEffect(() => {
    // Play success sound when gameOver mounts
    soundManager.playSuccess();

    const unsubscribe = listenToRoom(roomCode, (data) => {
      if (!data) {
        onQuit();
        return;
      }
      setRoomData(data);

      // If room status is reset to LOBBY by host, automatically transition back
      if (data.status === "LOBBY") {
        onRestart();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode, onRestart, onQuit]);

  if (!roomData) {
    return (
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "40px 20px" }}>
        <Loader2 className="animate-spin block-center" size={40} style={{ color: "var(--color-primary)", marginBottom: "16px" }} />
        <p style={{ color: "var(--text-secondary)" }}>Đang đồng bộ kết quả...</p>
      </div>
    );
  }

  const players = roomData.players || {};
  const playerIds = Object.keys(players);
  const isHost = roomData.hostId === playerId;
  const winnerName = roomData.winnerName || "Chưa xác định";

  const handlePlayAgain = async () => {
    if (!isHost) return;

    setResetting(true);
    soundManager.playSuccess();

    try {
      const db = getFirebaseDb();
      if (!db) return;

      // Update room state to reset
      const updates: any = {
        status: "LOBBY",
        drawPile: [],
        discardPile: [],
        turnIndex: 0,
        attackTurns: 0,
        winnerId: null,
        winnerName: null,
        kittenDrawnBy: null,
        pendingAction: null,
        favorState: null,
        logs: [`🔄 Chủ phòng đã thiết lập lại game. Chờ mọi người sẵn sàng!`],
      };

      // Reset players status
      playerIds.forEach((id) => {
        updates[`players/${id}/hand`] = [];
        updates[`players/${id}/isAlive`] = true;
        updates[`players/${id}/isReady`] = true;
      });

      await updateRoomState(roomCode, updates);
    } catch (e) {
      console.error(e);
      alert("Lỗi khi thiết lập lại phòng chơi!");
      setResetting(false);
    }
  };

  const handleQuitRoom = async () => {
    if (window.confirm("Bạn muốn rời phòng và quay về trang chủ?")) {
      soundManager.playSuccess();
      try {
        const db = getFirebaseDb();
        if (!db) return;

        if (isHost) {
          // If host leaves, delete the room
          await set(ref(db, `rooms/${roomCode}`), null);
        } else {
          // Remove player
          await set(ref(db, `rooms/${roomCode}/players/${playerId}`), null);
          const nextLogs = [...(roomData.logs || []), `${roomData.players[playerId]?.name || "Một người chơi"} đã rời phòng`];
          await set(ref(db, `rooms/${roomCode}/logs`), nextLogs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        onQuit();
      }
    }
  };

  return (
    <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "30px 20px" }}>
      {/* TROPHY ICON */}
      <div style={{
        width: "90px",
        height: "90px",
        borderRadius: "50%",
        background: "rgba(234, 179, 8, 0.1)",
        border: "2px solid rgba(234, 179, 8, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        color: "#facc15",
        boxShadow: "0 0 20px rgba(234, 179, 8, 0.2)"
      }} className="animate-bounce-slow">
        <Award size={46} />
      </div>

      <span style={{ fontSize: "0.8rem", color: "#fef08a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px" }}>
        TRẬN ĐẤU KẾT THÚC
      </span>
      <h2 className="gradient-text" style={{ fontSize: "2rem", fontWeight: 800, marginTop: "6px", marginBottom: "24px" }}>
        {winnerName} Thắng! 🎉
      </h2>

      {/* PLAYERS LIST & STATUS */}
      <div className="form-group" style={{ marginBottom: "28px" }}>
        <span className="input-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Users size={16} /> Bảng xếp hạng / Trạng thái
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
          {playerIds.map((id) => {
            const p = players[id];
            const isWinner = id === roomData.winnerId;
            const isDead = !p.isAlive;

            return (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: isWinner ? "rgba(234, 179, 8, 0.08)" : "rgba(255,255,255,0.02)",
                  border: isWinner ? "1px solid rgba(234, 179, 8, 0.2)" : "1px solid rgba(255,255,255,0.04)",
                  borderRadius: "12px"
                }}
              >
                <span style={{
                  fontWeight: isWinner ? 700 : 400,
                  color: isWinner ? "#fef08a" : isDead ? "var(--text-muted)" : "var(--text-primary)"
                }}>
                  {p.name} {id === playerId && "(Bạn)"}
                </span>

                {isWinner ? (
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    background: "rgba(234, 179, 8, 0.15)",
                    border: "1px solid rgba(234, 179, 8, 0.3)",
                    color: "#fef08a",
                    borderRadius: "20px",
                    fontWeight: 600
                  }}>
                    🏆 VÔ ĐỊCH
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
                    <Skull size={12} /> BỊ NỔ
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* GAME SUMMARY LOGS CONTAINER */}
      <div className="form-group" style={{ marginBottom: "32px", textAlign: "left" }}>
        <span className="input-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <List size={16} /> Diễn biến trận đấu
        </span>
        <div style={{
          background: "rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "16px",
          padding: "12px 16px",
          maxHeight: "150px",
          overflowY: "auto",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          {(roomData.logs || []).slice(-20).map((log: string, idx: number) => (
            <div key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "2px" }}>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* BUTTONS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {isHost ? (
          <button
            onClick={handlePlayAgain}
            disabled={resetting}
            className="btn btn-primary btn-block btn-large"
            style={{ display: "flex", gap: "8px" }}
          >
            {resetting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                ĐANG THIẾT LẬP LẠI...
              </>
            ) : (
              <>
                <RotateCcw size={20} />
                CHƠI LẠI TRẬN MỚI
              </>
            )}
          </button>
        ) : (
          <div style={{
            padding: "12px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "12px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)"
          }}>
            ⌛ Chờ chủ phòng thiết lập lại trận đấu...
          </div>
        )}

        <button
          onClick={handleQuitRoom}
          disabled={resetting}
          className="btn btn-outline btn-block"
          style={{ height: "48px", display: "flex", gap: "8px" }}
        >
          <Home size={16} /> VỀ TRANG CHỦ
        </button>
      </div>
    </div>
  );
};
