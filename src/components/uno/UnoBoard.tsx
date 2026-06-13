import React, { useEffect, useState } from "react";
import { Loader2, Sparkles, RotateCw, RotateCcw, AlertTriangle } from "lucide-react";
import { soundManager } from "../../utils/SoundManager";
import { listenToRoom, updateRoomState, getFirebaseDb, unoDrawCardTransaction } from "../../utils/firebase";
import { isPlayable, getCardColorHex, getCardName } from "../../data/unoCards";
import type { UnoCard, UnoColor } from "../../data/unoCards";
import { ref, runTransaction, set } from "firebase/database";

interface UnoBoardProps {
  roomCode: string;
  playerId: string;
  playerName: string;
  onGameOver: () => void;
  onQuit: () => void;
}

// Funny illustration captions matching Matthew Inman's style
const UNO_FUNNY_CAPTIONS: Record<string, string> = {
  NUMBER: "Số bình thường vô tội, chỉ dùng để xả bài lánh nạn.",
  SKIP: "Cấm lượt! Cấm nói, cấm thở, cấm đi bài. Ngồi im đi!",
  REVERSE: "Quay xe! Bẻ lái cực gắt đổi hướng đi khiến cả bàn đấu ngơ ngác.",
  DRAW_TWO: "Nhận 2 lá bài ngập tràn yêu thương từ người bạn thân thiết.",
  WILD_CHOOSE: "Quyền lực đổi màu tối cao! Hãy chọn màu sắc theo tâm trạng.",
  WILD_DRAW_FOUR: "+4 lá và đổi màu! Tình anh em chắc có bền lâu?"
};

export const UnoBoard: React.FC<UnoBoardProps> = ({
  roomCode,
  playerId,
  playerName,
  onGameOver,
  onQuit,
}) => {
  const [roomData, setRoomData] = useState<any>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedCardIndexForWild, setSelectedCardIndexForWild] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [passing, setPassing] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = listenToRoom(roomCode, (data) => {
      if (!data) {
        onQuit();
        return;
      }
      setRoomData(data);
      if (data.status === "GAMEOVER") {
        onGameOver();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode, onGameOver, onQuit]);

  if (!roomData) {
    return (
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "40px 20px" }}>
        <Loader2 className="animate-spin block-center" size={40} style={{ color: "var(--color-primary)", marginBottom: "16px" }} />
        <p style={{ color: "var(--text-secondary)" }}>Đang tải bàn chơi Uno...</p>
      </div>
    );
  }

  const players = roomData.players || {};
  const playerIds = Object.keys(players);
  const isMyTurn = playerIds[roomData.turnIndex] === playerId;

  const myHand: UnoCard[] = players[playerId]?.hand || [];
  const topCard: UnoCard = roomData.topCard;
  const activeColor: UnoColor = roomData.currentActiveColor;
  const drawPenalty = roomData.drawPenalty || 0;
  const direction = roomData.direction || "CW";
  const logs = roomData.logs || [];
  const unoDeclared = roomData.unoDeclared || {};

  const activePlayerId = playerIds[roomData.turnIndex];
  const activePlayerName = players[activePlayerId]?.name || "Không rõ";

  const handlePlayCard = async (cardIndex: number, chosenColor?: UnoColor) => {
    if (!isMyTurn) return;
    const card = myHand[cardIndex];
    const penalty = roomData.drawPenalty || 0;

    // Penalty Stacking Rules
    if (penalty > 0) {
      if (penalty % 2 === 0 && topCard.type === "DRAW_TWO") {
        if (card.type !== "DRAW_TWO" && card.type !== "WILD_DRAW_FOUR") {
          alert("Bạn đang bị tích lũy phạt rút bài! Hãy đánh tiếp lá +2 hoặc +4 để cộng dồn sang người kế tiếp, hoặc nhấn rút bài.");
          return;
        }
      } else if (penalty % 4 === 0 && topCard.type === "WILD_DRAW_FOUR") {
        if (card.type !== "WILD_DRAW_FOUR") {
          alert("Bạn đang bị tích lũy phạt rút +4! Bạn chỉ được phép đánh tiếp lá +4 để cộng dồn hình phạt, hoặc nhấn rút bài.");
          return;
        }
      }
    } else {
      // Normal Playability Check
      if (!isPlayable(card, topCard, activeColor)) {
        alert("Lá bài này không hợp lệ! Hãy chọn lá bài trùng màu, số/ký hiệu hoặc lá bài Đổi màu (Wild).");
        return;
      }
    }

    // Wild Card Color Picker trigger
    if (card.color === "WILD" && !chosenColor) {
      setSelectedCardIndexForWild(cardIndex);
      setShowColorPicker(true);
      return;
    }

    soundManager.playSuccess();

    const nextHand = [...myHand];
    nextHand.splice(cardIndex, 1);

    let nextTurnIndex = roomData.turnIndex;
    let nextDirection = direction;
    let nextPenalty = penalty;
    let nextActiveColor = card.color === "WILD" ? chosenColor! : card.color;

    let logMsg = `${playerName} đã đánh lá ${getCardName(card)}`;
    if (card.color === "WILD") {
      logMsg += ` (đổi sang màu ${getColorName(chosenColor!)})`;
    }

    const step = direction === "CW" ? 1 : -1;

    // Apply Actions
    if (card.type === "SKIP") {
      logMsg += `. Bỏ qua lượt của ${players[playerIds[(nextTurnIndex + step + playerIds.length) % playerIds.length]].name}!`;
      nextTurnIndex = (nextTurnIndex + step * 2 + playerIds.length) % playerIds.length;
    } else if (card.type === "REVERSE") {
      nextDirection = nextDirection === "CW" ? "CCW" : "CW";
      const nextStep = nextDirection === "CW" ? 1 : -1;
      logMsg += `. Đảo chiều lượt chơi!`;
      if (playerIds.length === 2) {
        nextTurnIndex = (nextTurnIndex + nextStep * 2 + playerIds.length) % playerIds.length;
      } else {
        nextTurnIndex = (nextTurnIndex + nextStep + playerIds.length) % playerIds.length;
      }
    } else if (card.type === "DRAW_TWO") {
      nextPenalty += 2;
      logMsg += `. Tích lũy phạt rút thêm +${nextPenalty}!`;
      nextTurnIndex = (nextTurnIndex + step + playerIds.length) % playerIds.length;
    } else if (card.type === "WILD_DRAW_FOUR") {
      nextPenalty += 4;
      logMsg += `. Bắt phạt rút thêm +${nextPenalty}!`;
      nextTurnIndex = (nextTurnIndex + step + playerIds.length) % playerIds.length;
    } else {
      // Normal card
      nextTurnIndex = (nextTurnIndex + step + playerIds.length) % playerIds.length;
    }

    let status = "PLAYING";
    if (nextHand.length === 0) {
      status = "GAMEOVER";
      logMsg = `🏆 ${playerName} đã đánh hết bài và CHIẾN THẮNG trận đấu! 🎉`;
    }

    const updates: any = {
      status,
      turnIndex: nextTurnIndex,
      direction: nextDirection,
      drawPenalty: nextPenalty,
      currentActiveColor: nextActiveColor,
      topCard: card,
      discardPile: [...(roomData.discardPile || []), card],
      logs: [...logs, logMsg],
      lastAction: {
        type: "PLAY",
        senderId: playerId,
        card,
        timestamp: Date.now()
      }
    };

    updates[`players/${playerId}/hand`] = nextHand;

    // Reset Uno declaration status on playing second-to-last card
    if (nextHand.length === 1) {
      updates[`unoDeclared/${playerId}`] = false;
    }

    await updateRoomState(roomCode, updates);
    setSelectedCardIndex(null);
    setSelectedCardIndexForWild(null);
    setShowColorPicker(false);
  };

  const handleDrawCard = async () => {
    if (!isMyTurn || drawing) return;
    setDrawing(true);
    soundManager.playSuccess();
    try {
      await unoDrawCardTransaction(roomCode, playerId, playerName);
    } catch (e) {
      console.error(e);
    } finally {
      setDrawing(false);
      setSelectedCardIndex(null);
    }
  };

  const handlePassTurn = async () => {
    if (!isMyTurn || passing || drawPenalty > 0) return;
    setPassing(true);
    soundManager.playSuccess();
    try {
      const step = direction === "CW" ? 1 : -1;
      const nextTurnIndex = (roomData.turnIndex + step + playerIds.length) % playerIds.length;
      await updateRoomState(roomCode, {
        turnIndex: nextTurnIndex,
        logs: [...logs, `${playerName} đã bỏ qua lượt đi.`],
        lastAction: {
          type: "PASS",
          senderId: playerId,
          timestamp: Date.now()
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPassing(false);
      setSelectedCardIndex(null);
    }
  };

  const declareUno = async () => {
    if (myHand.length !== 1) {
      alert("Bạn chỉ được hô UNO khi còn chính xác 1 lá bài!");
      return;
    }
    soundManager.playSuccess();
    await updateRoomState(roomCode, {
      [`unoDeclared/${playerId}`]: true,
      logs: [...logs, `📣 ${playerName} đã hô vang UNO! 📢`]
    });
  };

  const catchUnoFailure = async (targetId: string, targetName: string) => {
    soundManager.playSuccess();
    const db = getFirebaseDb();
    if (!db) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    await runTransaction(roomRef, (currentData) => {
      if (!currentData) return;
      const target = currentData.players[targetId];
      if (!target || target.hand?.length !== 1 || currentData.unoDeclared?.[targetId] === true) return;

      // Force draw 2 cards
      let drawPile = currentData.drawPile || [];
      let discardPile = currentData.discardPile || [];
      const drawn: any[] = [];

      for (let i = 0; i < 2; i++) {
        if (drawPile.length === 0 && discardPile.length > 1) {
          const top = discardPile[discardPile.length - 1];
          const toShuffle = discardPile.slice(0, -1).sort(() => Math.random() - 0.5);
          drawPile = [...toShuffle];
          discardPile = [top];
        }
        if (drawPile.length > 0) {
          drawn.push(drawPile.shift());
        }
      }

      target.hand = [...(target.hand || []), ...drawn];
      currentData.drawPile = drawPile;
      currentData.discardPile = discardPile;
      currentData.unoDeclared = currentData.unoDeclared || {};
      currentData.unoDeclared[targetId] = true; // marked so they can't be caught again immediately
      currentData.logs = [...(currentData.logs || []), `⚡ ${playerName} đã bắt quả tang ${targetName} quên hô UNO! ${targetName} bị phạt rút 2 lá bài!`];

      return currentData;
    });
  };

  const handleEndGameEarly = async () => {
    if (window.confirm("Bạn có chắc chắn muốn kết thúc trận đấu sớm?")) {
      soundManager.playSuccess();
      try {
        const db = getFirebaseDb();
        if (!db) return;
        await set(ref(db, `rooms/${roomCode}`), null);
        onQuit();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getColorName = (color: UnoColor): string => {
    switch (color) {
      case "RED": return "Đỏ";
      case "YELLOW": return "Vàng";
      case "GREEN": return "Lục";
      case "BLUE": return "Lam";
      default: return "Chưa chọn";
    }
  };

  const getColorHex = (color: UnoColor): string => {
    switch (color) {
      case "RED": return "#ef4444";
      case "YELLOW": return "#eab308";
      case "GREEN": return "#22c55e";
      case "BLUE": return "#3b82f6";
      default: return "var(--color-primary)";
    }
  };

  // Helper for 3D card layout placement in fanned hand
  const getFannedStyle = (index: number, total: number) => {
    if (total === 1) return { transform: "translateY(0) rotate(0deg)" };
    const middle = (total - 1) / 2;
    const angle = (index - middle) * Math.min(8, 40 / total); // angle offset
    const yOffset = Math.abs(index - middle) * Math.min(4, 15 / total); // vertical arching offset
    const xOffset = (index - middle) * 12; // spread cards out slightly
    return {
      transform: `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${angle}deg)`,
      zIndex: index
    };
  };

  return (
    <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "16px", minHeight: "92vh", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
        <div style={{ textAlign: "left" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Phòng Uno: {roomCode}</span>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-emerald)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={12} /> {getColorName(activeColor)} đang kích hoạt
          </div>
        </div>
        
        <button onClick={handleEndGameEarly} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.8rem", height: "30px", borderColor: "rgba(244,63,94,0.2)", color: "#fda4af" }}>
          Hủy game
        </button>
      </div>

      {/* PLAYERS CAROUSEL / PANEL */}
      <div style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        padding: "8px 4px",
        marginBottom: "16px",
        background: "rgba(255,255,255,0.01)",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.04)"
      }}>
        {playerIds.map((id, index) => {
          const p = players[id];
          const isActive = index === roomData.turnIndex;
          const handSize = p.hand?.length || 0;
          const isWarning = handSize === 1;
          const hasDeclared = unoDeclared[id] === true;

          return (
            <div
              key={id}
              style={{
                flexShrink: 0,
                minWidth: "100px",
                padding: "8px",
                background: isActive ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.02)",
                border: `1.5px solid ${isActive ? "rgba(16, 185, 129, 0.4)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "12px",
                textAlign: "center",
                transition: "all 0.3s"
              }}
            >
              <div style={{
                fontSize: "0.8rem",
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "#34d399" : "var(--text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {p.name}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                🃏 {handSize} lá
              </div>
              {isWarning && (
                <div style={{ marginTop: "4px" }}>
                  {hasDeclared ? (
                    <span style={{ fontSize: "0.6rem", background: "rgba(16,185,129,0.2)", border: "1px solid #10b981", color: "#34d399", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>UNO!</span>
                  ) : (
                    id !== playerId ? (
                      <button
                        onClick={() => catchUnoFailure(id, p.name)}
                        style={{
                          fontSize: "0.6rem",
                          background: "#ef4444",
                          border: "none",
                          color: "#ffffff",
                          padding: "2px 6px",
                          borderRadius: "10px",
                          fontWeight: 700,
                          cursor: "pointer",
                          animation: "pulse 1.5s infinite"
                        }}
                      >
                        BẮT LỖI
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.6rem", background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", color: "#fca5a5", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>QUÊN HÔ!</span>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GAME STATUS / WARNINGS */}
      {drawPenalty > 0 && (
        <div className="animated-bounce-in" style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#fca5a5",
          padding: "10px",
          borderRadius: "12px",
          fontSize: "0.85rem",
          fontWeight: 600,
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        }}>
          <AlertTriangle size={16} />
          {isMyTurn 
            ? `BẠN BỊ PHẠT RÚT +${drawPenalty} LÁ! Đánh lá +2 hoặc +4 để cộng dồn, hoặc nhấp Rút bài để chịu phạt.` 
            : `Hình phạt +${drawPenalty} lá đang chờ người chơi kế tiếp.`}
        </div>
      )}

      {/* MAIN PLAYING BOARD */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "12px 0",
        position: "relative"
      }}>
        {/* DIRECTION SPINNING INDICATOR */}
        <div style={{
          position: "absolute",
          width: "220px",
          height: "220px",
          border: `2px dashed ${getColorHex(activeColor)}30`,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          animation: `spin ${direction === "CW" ? "20s" : "-20s"} linear infinite`
        }}>
          {direction === "CW" ? <RotateCw size={180} style={{ opacity: 0.08, color: getColorHex(activeColor) }} /> : <RotateCcw size={180} style={{ opacity: 0.08, color: getColorHex(activeColor) }} />}
        </div>

        <div style={{ display: "flex", gap: "24px", zIndex: 5, alignItems: "center" }}>
          {/* DECK PILE */}
          <div
            onClick={handleDrawCard}
            style={{
              width: "110px",
              height: "160px",
              background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
              border: `2.5px solid ${isMyTurn ? "rgba(16, 185, 129, 0.8)" : "rgba(255, 255, 255, 0.15)"}`,
              boxShadow: isMyTurn ? "0 0 15px rgba(16, 185, 129, 0.4)" : "none",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: isMyTurn ? "pointer" : "default",
              transition: "all 0.2s"
            }}
          >
            <div style={{ fontSize: "2.5rem" }}>🃏</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, marginTop: "8px", color: "var(--text-secondary)" }}>RÚT BÀI</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>({roomData.drawPile?.length || 0} lá)</div>
          </div>

          {/* DISCARD PILE (TOP CARD) */}
          <div style={{
            width: "110px",
            height: "160px",
            background: "#18181b",
            border: `3px solid ${getColorHex(activeColor)}`,
            boxShadow: `0 0 20px ${getColorHex(activeColor)}50`,
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Colored background glow */}
            <div style={{
              position: "absolute",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: getColorHex(activeColor),
              opacity: 0.1,
              filter: "blur(20px)"
            }} />

            <div style={{ fontSize: "2.8rem", color: getColorHex(activeColor), zIndex: 2 }}>
              {topCard?.type === "NUMBER" ? topCard.value : (
                topCard?.type === "SKIP" ? "🚫" : (
                  topCard?.type === "REVERSE" ? "🔄" : (
                    topCard?.type === "DRAW_TWO" ? "+2" : (
                      topCard?.type === "WILD_CHOOSE" ? "🎨" : "+4"
                    )
                  )
                )
              )}
            </div>
            
            <div style={{
              position: "absolute",
              bottom: "8px",
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#ffffff",
              background: "rgba(0,0,0,0.6)",
              padding: "2px 8px",
              borderRadius: "10px",
              zIndex: 2
            }}>
              {getCardName(topCard)}
            </div>
          </div>
        </div>
      </div>

      {/* CHAT / GAME LOGS FEED */}
      <div style={{
        background: "rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "16px",
        padding: "10px 14px",
        height: "85px",
        overflowY: "auto",
        textAlign: "left",
        fontSize: "0.8rem",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        marginBottom: "16px",
        scrollBehavior: "smooth"
      }}
      ref={(el) => {
        if (el) el.scrollTop = el.scrollHeight;
      }}>
        {logs.slice(-15).map((log: string, idx: number) => (
          <div key={idx} style={{ color: log.startsWith("🏆") ? "#34d399" : (log.startsWith("⚠️") || log.startsWith("🚫") ? "#fca5a5" : "#d1d5db") }}>
            {log}
          </div>
        ))}
      </div>

      {/* SELECTIVE 3D CARD PREVIEW */}
      <div style={{ height: "140px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selectedCardIndex !== null && myHand[selectedCardIndex] ? (() => {
          const card = myHand[selectedCardIndex];
          const colorHex = getCardColorHex(card.color === "WILD" ? activeColor : card.color);
          const name = getCardName(card);
          const caption = UNO_FUNNY_CAPTIONS[card.type] || UNO_FUNNY_CAPTIONS.NUMBER;

          return (
            <div className="animated-slide-in" style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "12px 18px",
              borderRadius: "20px",
              maxWidth: "460px",
              width: "100%"
            }}>
              {/* Miniature card rendering */}
              <div style={{
                width: "55px",
                height: "80px",
                background: "#18181b",
                border: `2px solid ${colorHex}`,
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 10px ${colorHex}40`,
                flexShrink: 0
              }}>
                <div style={{ fontSize: "1.4rem", color: colorHex }}>
                  {card.type === "NUMBER" ? card.value : (
                    card.type === "SKIP" ? "🚫" : (
                      card.type === "REVERSE" ? "🔄" : (
                        card.type === "DRAW_TWO" ? "+2" : (
                          card.type === "WILD_CHOOSE" ? "🎨" : "+4"
                        )
                      )
                    )
                  )}
                </div>
              </div>

              {/* Text metadata */}
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#ffffff" }}>{name}</span>
                  <span style={{ fontSize: "0.65rem", padding: "1px 6px", background: `${colorHex}20`, color: colorHex, border: `1px solid ${colorHex}40`, borderRadius: "8px", fontWeight: 700 }}>
                    {card.color === "WILD" ? "Đổi màu" : getColorName(card.color)}
                  </span>
                </div>
                {/* Yellow illustration comic ribbon */}
                <div style={{
                  background: "#fef08a",
                  color: "#854d0e",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  transform: "rotate(-1deg)",
                  marginBottom: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
                }}>
                  {caption}
                </div>
                
                {isMyTurn && (
                  <button
                    onClick={() => handlePlayCard(selectedCardIndex)}
                    className="btn btn-primary"
                    style={{
                      height: "28px",
                      padding: "0 12px",
                      fontSize: "0.78rem",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      borderColor: "#059669"
                    }}
                  >
                    ĐÁNH LÁ BÀI NÀY
                  </button>
                )}
              </div>
            </div>
          );
        })() : (
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
            {isMyTurn ? "Chọn một quân bài trên tay để xem chi tiết và đánh" : `Chờ đến lượt của ${activePlayerName}...`}
          </div>
        )}
      </div>

      {/* PLAYER HAND & CONTROL PANEL */}
      <div style={{ marginTop: "auto", position: "relative", zIndex: 10 }}>
        {isMyTurn && (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
            {myHand.length === 1 && !unoDeclared[playerId] && (
              <button onClick={declareUno} className="btn animate-pulse" style={{ height: "36px", padding: "0 16px", fontSize: "0.85rem", background: "#ef4444", borderColor: "#dc2626", fontWeight: 800 }}>
                📢 HÔ UNO!
              </button>
            )}
            
            {drawPenalty === 0 && (
              <button
                onClick={handlePassTurn}
                disabled={passing}
                className="btn btn-outline"
                style={{ height: "36px", padding: "0 16px", fontSize: "0.85rem", color: "#e4e4e7" }}
              >
                {passing ? "Đang xử lý..." : "BỎ QUA LƯỢT"}
              </button>
            )}
          </div>
        )}

        {/* FANNED CARD HAND */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          height: "110px",
          position: "relative",
          margin: "10px auto 14px auto",
          maxWidth: "480px",
          width: "100%"
        }}>
          {myHand.map((card, idx) => {
            const colorHex = getCardColorHex(card.color === "WILD" ? activeColor : card.color);
            const isSelected = selectedCardIndex === idx;
            const fStyle = getFannedStyle(idx, myHand.length);

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCardIndex(isSelected ? null : idx)}
                style={{
                  width: "60px",
                  height: "90px",
                  background: "#18181b",
                  border: `2px solid ${colorHex}`,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "absolute",
                  bottom: isSelected ? "30px" : "0",
                  boxShadow: isSelected 
                    ? `0 0 18px ${colorHex}aa, 0 -5px 10px ${colorHex}40` 
                    : `0 4px 6px rgba(0,0,0,0.3), 0 0 4px ${colorHex}20`,
                  transition: "bottom 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.25s",
                  transformOrigin: "bottom center",
                  ...fStyle
                }}
              >
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: colorHex }}>
                  {card.type === "NUMBER" ? card.value : (
                    card.type === "SKIP" ? "🚫" : (
                      card.type === "REVERSE" ? "🔄" : (
                        card.type === "DRAW_TWO" ? "+2" : (
                          card.type === "WILD_CHOOSE" ? "🎨" : "+4"
                        )
                      )
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WILD COLOR PICKER OVERLAY */}
      {showColorPicker && selectedCardIndexForWild !== null && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <h3 style={{ color: "#ffffff", marginBottom: "20px", fontSize: "1.3rem", fontWeight: 800 }}>CHỌN MÀU SẮC ĐỔI TIẾP THEO</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            width: "260px",
            height: "260px"
          }}>
            {(["RED", "YELLOW", "GREEN", "BLUE"] as UnoColor[]).map((color) => {
              const hex = getColorHex(color);
              return (
                <button
                  key={color}
                  onClick={() => handlePlayCard(selectedCardIndexForWild, color)}
                  style={{
                    background: hex,
                    border: "2px solid #ffffff",
                    borderRadius: "16px",
                    cursor: "pointer",
                    boxShadow: `0 0 15px ${hex}80`,
                    transition: "transform 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "1rem"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {getColorName(color)}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => {
              setShowColorPicker(false);
              setSelectedCardIndexForWild(null);
            }}
            className="btn btn-outline"
            style={{ marginTop: "24px", width: "120px", height: "38px" }}
          >
            Hủy
          </button>
        </div>
      )}
    </div>
  );
};
