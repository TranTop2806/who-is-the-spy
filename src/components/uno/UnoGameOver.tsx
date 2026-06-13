import React, { useEffect, useState } from "react";
import { Award, RotateCcw, Home, Users, List, Loader2 } from "lucide-react";
import { soundManager } from "../../utils/SoundManager";
import { listenToRoom, updateRoomState, getFirebaseDb } from "../../utils/firebase";
import { ref, set } from "firebase/database";

interface UnoGameOverProps {
  roomCode: string;
  playerId: string;
  onRestart: () => void;
  onQuit: () => void;
}

export const UnoGameOver: React.FC<UnoGameOverProps> = ({
  roomCode,
  playerId,
  onRestart,
  onQuit,
}) => {
  const [roomData, setRoomData] = useState<any>(null);
  const [resetting, setResetting] = useState<boolean>(false);

  useEffect(() => {
    soundManager.playSuccess();

    const unsubscribe = listenToRoom(roomCode, (data) => {
      if (!data) {
        onQuit();
        return;
      }
      setRoomData(data);

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
        <p style={{ color: "var(--text-secondary)" }}>Đang đồng bộ kết quả Uno...</p>
      </div>
    );
  }

  const players = roomData.players || {};
  const playerIds = Object.keys(players);
  const isHost = roomData.hostId === playerId;

  // Find the winner (first player with 0 cards) or the one with minimum cards
  let winnerId = "";
  let winnerName = "Chưa xác định";

  // Sort players by remaining card counts (lower is better, 0 is the absolute winner)
  const rankedPlayers = playerIds
    .map((id) => ({
      id,
      name: players[id].name,
      cardCount: players[id].hand?.length || 0
    }))
    .sort((a, b) => a.cardCount - b.cardCount);

  if (rankedPlayers.length > 0) {
    winnerId = rankedPlayers[0].id;
    winnerName = rankedPlayers[0].name;
  }

  const handlePlayAgain = async () => {
    if (!isHost) return;
    setResetting(true);
    soundManager.playSuccess();

    try {
      const db = getFirebaseDb();
      if (!db) return;

      const updates: any = {
        status: "LOBBY",
        drawPile: [],
        discardPile: [],
        topCard: null,
        currentActiveColor: "",
        turnIndex: 0,
        direction: "CW",
        drawPenalty: 0,
        unoDeclared: null,
        logs: [`🔄 Chủ phòng đã thiết lập lại game Uno. Chờ mọi người sẵn sàng!`],
      };

      playerIds.forEach((id) => {
        updates[`players/${id}/hand`] = [];
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
          await set(ref(db, `rooms/${roomCode}`), null);
        } else {
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
        background: "rgba(16, 185, 129, 0.1)",
        border: "2px solid rgba(16, 185, 129, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        color: "#34d399",
        boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)"
      }} className="animate-bounce-slow">
        <Award size={46} />
      </div>

      <span style={{ fontSize: "0.8rem", color: "#a7f3d0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px" }}>
        TRẬN ĐẤU KẾT THÚC
      </span>
      <h2 className="gradient-text" style={{ fontSize: "2.2rem", fontWeight: 800, marginTop: "6px", marginBottom: "24px" }}>
        {winnerName} Thắng! 🎉
      </h2>

      {/* RANKINGS BOARD */}
      <div className="form-group" style={{ marginBottom: "28px" }}>
        <span className="input-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Users size={16} /> Bảng xếp hạng chung cuộc
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
          {rankedPlayers.map((player, index) => {
            const isWinner = player.id === winnerId;
            const isMe = player.id === playerId;

            return (
              <div
                key={player.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: isWinner ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.02)",
                  border: isWinner ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(255, 255, 255, 0.04)",
                  borderRadius: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontWeight: 800,
                    color: isWinner ? "#34d399" : "var(--text-muted)",
                    fontSize: "0.95rem"
                  }}>
                    #{index + 1}
                  </span>
                  <span style={{
                    fontWeight: isMe ? 700 : 400,
                    color: isWinner ? "#a7f3d0" : "var(--text-primary)"
                  }}>
                    {player.name} {isMe && "(Bạn)"}
                  </span>
                </div>

                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {player.cardCount === 0 ? "🏆 Hết bài!" : `${player.cardCount} lá còn lại`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* GAME RUN LOGS */}
      <div className="form-group" style={{ marginBottom: "32px", textAlign: "left" }}>
        <span className="input-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <List size={16} /> Lịch sử trận đấu
        </span>
        <div style={{
          background: "rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "16px",
          padding: "12px 16px",
          maxHeight: "130px",
          overflowY: "auto",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          {(roomData.logs || []).slice(-15).map((log: string, idx: number) => (
            <div key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "2px" }}>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {isHost ? (
          <button
            onClick={handlePlayAgain}
            disabled={resetting}
            className="btn btn-primary btn-block btn-large"
            style={{ display: "flex", gap: "8px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderColor: "#059669" }}
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
