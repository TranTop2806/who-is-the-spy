import React, { useEffect, useState, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Eye,
  Timer,
  LogOut,
  X,
  Flame,
  User,
  Loader2,
  List
} from "lucide-react";
import { soundManager } from "../../utils/SoundManager";
import { listenToRoom, updateRoomState, getFirebaseDb, drawCardTransaction } from "../../utils/firebase";
import { EXPLODING_CARDS, shuffleDeck } from "../../data/explodingCards";
import type { ExplodingCardType } from "../../data/explodingCards";
import { ref, runTransaction, set } from "firebase/database";

interface ExplodingBoardProps {
  roomCode: string;
  playerId: string;
  playerName: string;
  onGameOver: () => void;
  onQuit: () => void;
}

export const ExplodingBoard: React.FC<ExplodingBoardProps> = ({
  roomCode,
  playerId,
  playerName,
  onGameOver,
  onQuit,
}) => {
  const [roomData, setRoomData] = useState<any>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]); // indexes in hand
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(5);

  // See Future State
  const [futureCards, setFutureCards] = useState<string[] | null>(null);

  // Steal Target State
  const [showStealModal, setShowStealModal] = useState<{
    type: "FAVOR" | "CAT_PAIR";
    cardsToPlay?: string[]; // for CAT_PAIR
  } | null>(null);

  // Ref for local interval
  const nopeIntervalRef = useRef<any>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Listen to database
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
      if (nopeIntervalRef.current) clearInterval(nopeIntervalRef.current);
    };
  }, [roomCode, onQuit, onGameOver]);

  // Scroll to bottom of logs on updates
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [roomData?.logs, showLogs]);

  // Handle Nope Countdown Timer
  useEffect(() => {
    if (!roomData?.pendingAction) {
      if (nopeIntervalRef.current) {
        clearInterval(nopeIntervalRef.current);
        nopeIntervalRef.current = null;
      }
      return;
    }

    const pending = roomData.pendingAction;
    
    // Clear old interval
    if (nopeIntervalRef.current) clearInterval(nopeIntervalRef.current);

    const updateTimer = () => {
      const elapsed = Date.now() - pending.timestamp;
      const remaining = Math.max(0, 5 - elapsed / 1000);
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(nopeIntervalRef.current!);
        nopeIntervalRef.current = null;
        
        // Resolve action: only the active turn player or the host runs the resolution transaction to avoid race conditions.
        // Wait, standardizing on the player whose turn it is, OR the sender of the action if no turn.
        const isCurrentTurnPlayer = playerIds[roomData.turnIndex] === playerId;
        if (isCurrentTurnPlayer) {
          resolvePendingAction();
        }
      }
    };

    updateTimer(); // run once immediately
    nopeIntervalRef.current = setInterval(updateTimer, 100);

    return () => {
      if (nopeIntervalRef.current) clearInterval(nopeIntervalRef.current);
    };
  }, [roomData?.pendingAction, playerId]);

  if (!roomData) {
    return (
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "40px 20px" }}>
        <Loader2 className="animate-spin block-center" size={40} style={{ color: "var(--color-primary)", marginBottom: "16px" }} />
        <p style={{ color: "var(--text-secondary)" }}>Đang đồng bộ bàn đấu...</p>
      </div>
    );
  }

  const players = roomData.players || {};
  const playerIds = Object.keys(players);
  const currentPlayerId = playerIds[roomData.turnIndex];
  const isMyTurn = currentPlayerId === playerId;
  const me = players[playerId] || { name: playerName, hand: [], isAlive: false };
  const myHand: string[] = me.hand || [];

  // Check if I am dead
  const isSpectator = !me.isAlive;

  // Find other players alive for stealing
  const alivePlayers = playerIds
    .filter((id) => id !== playerId && players[id].isAlive)
    .map((id) => ({ id, name: players[id].name }));

  // Helper: Get next alive player index
  const getNextAliveIndex = (currentIndex: number, allPlayers: any, allIds: string[]): number => {
    let nextIdx = currentIndex;
    let attempts = 0;
    do {
      nextIdx = (nextIdx + 1) % allIds.length;
      attempts++;
    } while (!allPlayers[allIds[nextIdx]].isAlive && attempts < allIds.length);
    return nextIdx;
  };

  // Helper: Sound wrappers
  const playFlipSound = () => soundEnabled && soundManager.playFlip();
  const playSuccessSound = () => soundEnabled && soundManager.playSuccess();
  const playExplodeSound = () => soundEnabled && soundManager.playFail();
  const playTickSound = () => soundEnabled && soundManager.playTick();

  // ==========================================
  // CARD LOGIC: DRAW CARD
  // ==========================================
  const handleDrawCard = async () => {
    if (!isMyTurn) return;
    if (roomData.pendingAction) return;
    if (roomData.kittenDrawnBy) return;

    playFlipSound();

    try {
      const updatedRoom = await drawCardTransaction(roomCode, playerId, playerName);
      if (updatedRoom) {
        // If kitten drawn, play explosion warning sound, otherwise success
        const action = updatedRoom.lastAction;
        if (action && action.card === "KITTEN") {
          playExplodeSound();
        } else {
          playSuccessSound();
        }
      }
    } catch (e) {
      console.error("Error drawing card:", e);
    }
  };

  // ==========================================
  // CARD LOGIC: PLAY CARD (INITIATE NOPE WINDOW)
  // ==========================================
  const handlePlayCard = async () => {
    if (!isMyTurn) return;
    if (selectedCards.length !== 1) return;
    if (roomData.pendingAction) return;
    if (roomData.kittenDrawnBy) return;

    const cardIdx = selectedCards[0];
    const cardType = myHand[cardIdx] as ExplodingCardType;

    // Defuse and Kitten cannot be played from hand directly
    if (cardType === "DEFUSE" || cardType === "KITTEN") return;
    if (cardType.startsWith("CAT_")) {
      alert("Mèo thường phải đánh theo cặp (2 lá giống nhau) để cướp bài!");
      return;
    }

    playFlipSound();

    // Remove card from hand
    const nextHand = [...myHand];
    nextHand.splice(cardIdx, 1);

    // Prepare pending action
    const pendingAction = {
      card: cardType,
      senderId: playerId,
      senderName: playerName,
      timestamp: Date.now(),
      nopeCount: 0,
    };

    // Update Firebase
    const updates: any = {
      pendingAction,
      [`players/${playerId}/hand`]: nextHand,
      logs: [...(roomData.logs || []), `${playerName} đã đánh lá ${EXPLODING_CARDS[cardType].name}`],
    };

    setSelectedCards([]);
    await updateRoomState(roomCode, updates);
  };

  // ==========================================
  // CARD LOGIC: PLAY CAT PAIR (STEAL)
  // ==========================================
  const handlePlayCatPair = () => {
    if (!isMyTurn) return;
    if (selectedCards.length !== 2) return;
    if (roomData.pendingAction) return;

    const idx1 = selectedCards[0];
    const idx2 = selectedCards[1];
    const card1 = myHand[idx1];
    const card2 = myHand[idx2];

    if (card1 !== card2) {
      alert("Hai lá bài phải giống nhau để tạo thành cặp!");
      return;
    }

    // Open target selection modal
    setShowStealModal({
      type: "CAT_PAIR",
      cardsToPlay: [card1, card2],
    });
  };

  const handlePlayFavor = () => {
    if (!isMyTurn) return;
    if (selectedCards.length !== 1) return;
    if (myHand[selectedCards[0]] !== "FAVOR") return;
    if (roomData.pendingAction) return;

    // Open target selection modal
    setShowStealModal({
      type: "FAVOR",
    });
  };

  const executeStealOrFavor = async (targetId: string, targetName: string) => {
    if (!showStealModal) return;

    playFlipSound();
    const type = showStealModal.type;

    const nextHand = [...myHand];
    let logMsg = "";
    let pendingAction: any = null;

    if (type === "CAT_PAIR") {
      // Delete from back to avoid shifting index bugs
      const idxsToDelete = selectedCards.sort((a, b) => b - a);
      idxsToDelete.forEach((idx) => nextHand.splice(idx, 1));

      logMsg = `${playerName} đánh cặp bài để cướp ngẫu nhiên 1 lá của ${targetName}`;
      pendingAction = {
        card: "CAT_PAIR",
        senderId: playerId,
        senderName: playerName,
        targetId,
        targetName,
        timestamp: Date.now(),
        nopeCount: 0,
      };
    } else {
      // FAVOR
      const cardIdx = selectedCards[0];
      nextHand.splice(cardIdx, 1);

      logMsg = `${playerName} yêu cầu ${targetName} ủng hộ 1 lá bài`;
      pendingAction = {
        card: "FAVOR",
        senderId: playerId,
        senderName: playerName,
        targetId,
        targetName,
        timestamp: Date.now(),
        nopeCount: 0,
      };
    }

    const updates: any = {
      pendingAction,
      [`players/${playerId}/hand`]: nextHand,
      logs: [...(roomData.logs || []), logMsg],
    };

    setSelectedCards([]);
    setShowStealModal(null);
    await updateRoomState(roomCode, updates);
  };

  // ==========================================
  // CARD LOGIC: NOPE TRIGGER
  // ==========================================
  const handleNopeAction = async () => {
    if (!roomData.pendingAction) return;

    // Find NOPE card index in my hand
    const nopeIdx = myHand.findIndex((c) => c === "NOPE");
    if (nopeIdx === -1) {
      alert("Bạn không có lá NOPE để đánh!");
      return;
    }

    playFlipSound();

    const db = getFirebaseDb();
    if (!db) return;

    const roomRef = ref(db, `rooms/${roomCode}`);

    await runTransaction(roomRef, (currentData) => {
      if (!currentData || !currentData.pendingAction) return;

      const playerHand = currentData.players[playerId].hand || [];
      const localNopeIdx = playerHand.findIndex((c: string) => c === "NOPE");
      if (localNopeIdx === -1) return; // double check

      // Remove Nope
      playerHand.splice(localNopeIdx, 1);
      currentData.players[playerId].hand = playerHand;

      // Update Nope counts
      const nextNopeCount = (currentData.pendingAction.nopeCount || 0) + 1;
      currentData.pendingAction.nopeCount = nextNopeCount;
      currentData.pendingAction.timestamp = Date.now(); // reset timer

      // Append log
      const logText = nextNopeCount % 2 === 1
        ? `🛑 ${playerName} đã đánh NOPE chặn lại!`
        : `🌀 ${playerName} đã NOPE lá NOPE trước đó! (Hủy chặn)`;
      
      currentData.logs = [...(currentData.logs || []), logText];

      return currentData;
    });
  };

  // ==========================================
  // RESOLVE PENDING ACTION (ONCE TIMER EXPIRES)
  // ==========================================
  const resolvePendingAction = async () => {
    const db = getFirebaseDb();
    if (!db) return;

    const roomRef = ref(db, `rooms/${roomCode}`);

    await runTransaction(roomRef, (currentData) => {
      if (!currentData || !currentData.pendingAction) return;

      const pending = currentData.pendingAction;
      const isNoped = pending.nopeCount % 2 === 1;

      let logMsg = "";
      
      if (isNoped) {
        logMsg = `🚫 Hành động ${EXPLODING_CARDS[pending.card as ExplodingCardType]?.name || pending.card} đã bị chặn đứng hoàn toàn!`;
        
        // Push discarded cards
        currentData.discardPile = [
          ...(currentData.discardPile || []),
          pending.card,
          ...Array(pending.nopeCount).fill("NOPE")
        ];

        currentData.pendingAction = null;
        currentData.logs = [...(currentData.logs || []), logMsg];
        return currentData;
      }

      // If NOT Noped, execute the card effect!
      logMsg = `✅ Giải quyết hành động: ${EXPLODING_CARDS[pending.card as ExplodingCardType]?.name}`;
      
      // Push discarded cards
      currentData.discardPile = [
        ...(currentData.discardPile || []),
        pending.card,
        ...Array(pending.nopeCount).fill("NOPE")
      ];

      const senderId = pending.senderId;
      const senderName = pending.senderName;
      const players = currentData.players;
      const playerIds = Object.keys(players);

      switch (pending.card) {
        case "SKIP": {
          if (currentData.attackTurns > 1) {
            currentData.attackTurns -= 1;
            logMsg += ` (Lượt đi thêm: còn lại ${currentData.attackTurns} lượt)`;
          } else {
            currentData.attackTurns = 0;
            currentData.turnIndex = getNextAliveIndex(currentData.turnIndex, players, playerIds);
            logMsg += `. Đến lượt ${players[playerIds[currentData.turnIndex]].name}`;
          }
          break;
        }

        case "ATTACK": {
          // Add 2 turns to attack counter
          currentData.attackTurns = (currentData.attackTurns || 0) + 2;
          // Transition turn to next alive player
          currentData.turnIndex = getNextAliveIndex(currentData.turnIndex, players, playerIds);
          logMsg += `. ${players[playerIds[currentData.turnIndex]].name} bị phạt ${currentData.attackTurns} lượt!`;
          break;
        }

        case "SHUFFLE": {
          if (currentData.drawPile && currentData.drawPile.length > 0) {
            currentData.drawPile = shuffleDeck(currentData.drawPile);
            logMsg += `. Bộ bài đã được xáo trộn!`;
          }
          break;
        }

        case "SEE_FUTURE": {
          // This card resolves only for the sender. 
          // We mark who was the recipient of see future, so their client will fetch the top 3 cards locally
          currentData.seeFutureBy = senderId;
          logMsg += ` (đã hiển thị trên màn hình của ${senderName})`;
          break;
        }

        case "FAVOR": {
          // Set favorState status to waiting
          currentData.favorState = {
            senderId: pending.senderId,
            senderName: pending.senderName,
            targetId: pending.targetId,
            targetName: pending.targetName,
            status: "WAITING_FOR_CARD",
          };
          logMsg += ` (đang chờ chọn bài)`;
          break;
        }

        case "CAT_PAIR": {
          // Steal a random card immediately from target
          const targetId = pending.targetId;
          const targetPlayer = players[targetId];
          const targetHand = targetPlayer.hand || [];

          if (targetHand.length > 0) {
            const randomIdx = Math.floor(Math.random() * targetHand.length);
            const stolenCard = targetHand[randomIdx];

            // Remove from target
            targetHand.splice(randomIdx, 1);
            targetPlayer.hand = targetHand;

            // Add to sender
            const senderPlayer = players[senderId];
            senderPlayer.hand = [...(senderPlayer.hand || []), stolenCard];

            logMsg += `. ${senderName} đã cướp được 1 lá bài từ ${pending.targetName}!`;
          } else {
            logMsg += `. Nhưng ${pending.targetName} không còn lá bài nào!`;
          }
          break;
        }

        default:
          break;
      }

      currentData.pendingAction = null;
      currentData.logs = [...(currentData.logs || []), logMsg];
      return currentData;
    });

    // Check if seeFuture was triggered for me
    setTimeout(async () => {
      const snap = await runTransaction(roomRef, (currentData) => {
        if (!currentData) return;
        if (currentData.seeFutureBy === playerId) {
          // Clear flag
          currentData.seeFutureBy = null;
          return currentData;
        }
      });
      
      if (snap.committed) {
        // Show top 3 cards locally
        const top3 = roomData.drawPile.slice(0, 3);
        setFutureCards(top3);
        playSuccessSound();
      }
    }, 100);
  };

  // ==========================================
  // HANDOVER CARD FOR FAVOR
  // ==========================================
  const handleHandoverFavorCard = async (cardIdx: number) => {
    if (!roomData.favorState) return;
    const { senderId, targetId, senderName } = roomData.favorState;
    if (targetId !== playerId) return; // Not me

    playFlipSound();

    const db = getFirebaseDb();
    if (!db) return;

    const roomRef = ref(db, `rooms/${roomCode}`);

    await runTransaction(roomRef, (currentData) => {
      if (!currentData || !currentData.favorState) return;

      const targetHand = currentData.players[targetId].hand || [];
      const senderHand = currentData.players[senderId].hand || [];

      // Extract card
      const givenCard = targetHand[cardIdx];
      targetHand.splice(cardIdx, 1);

      // Add to sender
      senderHand.push(givenCard);

      currentData.players[targetId].hand = targetHand;
      currentData.players[senderId].hand = senderHand;
      
      // Clear state
      currentData.favorState = null;
      
      currentData.logs = [
        ...(currentData.logs || []),
        `🤝 ${playerName} đã gửi tặng 1 lá bài cho ${senderName}.`
      ];

      return currentData;
    });
  };

  // ==========================================
  // BOMB DEFUSE PLACEMENT
  // ==========================================
  const handleDefuseKitten = async (insertIndex: number) => {
    if (roomData.kittenDrawnBy !== playerId) return;

    playFlipSound();

    const defuseIdx = myHand.findIndex((c) => c === "DEFUSE");
    if (defuseIdx === -1) return; // shouldn't happen

    const db = getFirebaseDb();
    if (!db) return;

    const roomRef = ref(db, `rooms/${roomCode}`);

    await runTransaction(roomRef, (currentData) => {
      if (!currentData || currentData.kittenDrawnBy !== playerId) return;

      const playerHand = currentData.players[playerId].hand || [];
      const localDefuseIdx = playerHand.findIndex((c: string) => c === "DEFUSE");
      
      if (localDefuseIdx === -1) return; // sanity check

      // Remove defuse
      playerHand.splice(localDefuseIdx, 1);
      currentData.players[playerId].hand = playerHand;

      // Put KITTEN back into drawPile
      const nextDeck = [...(currentData.drawPile || [])];
      
      // Clamp index
      const targetPos = Math.max(0, Math.min(nextDeck.length, insertIndex));
      nextDeck.splice(targetPos, 0, "KITTEN");
      
      currentData.drawPile = nextDeck;
      currentData.kittenDrawnBy = null;

      // Discard Defuse
      currentData.discardPile = [...(currentData.discardPile || []), "DEFUSE"];

      let logMsg = `🛠️ ${playerName} đã dùng THÁO GỠ để thoát nạn thành công!`;

      // Advance turn index
      if (currentData.attackTurns > 1) {
        currentData.attackTurns -= 1;
        logMsg += ` (Lượt đi thêm: còn lại ${currentData.attackTurns} lượt)`;
      } else {
        currentData.attackTurns = 0;
        const playerIds = Object.keys(currentData.players);
        currentData.turnIndex = getNextAliveIndex(currentData.turnIndex, currentData.players, playerIds);
        logMsg += `. Đến lượt ${currentData.players[playerIds[currentData.turnIndex]].name}`;
      }

      currentData.logs = [...(currentData.logs || []), logMsg];

      return currentData;
    });
  };

  // ==========================================
  // EXPLODE (LOSE AND DIE)
  // ==========================================
  const handleExplode = async () => {
    if (roomData.kittenDrawnBy !== playerId) return;

    playExplodeSound();

    const db = getFirebaseDb();
    if (!db) return;

    const roomRef = ref(db, `rooms/${roomCode}`);

    await runTransaction(roomRef, (currentData) => {
      if (!currentData || currentData.kittenDrawnBy !== playerId) return;

      const playerHand = currentData.players[playerId].hand || [];

      // Mark dead
      currentData.players[playerId].isAlive = false;
      currentData.players[playerId].hand = []; // empty hand

      // Dump all cards in discard pile
      currentData.discardPile = [
        ...(currentData.discardPile || []),
        ...playerHand,
        "KITTEN" // Kitten is also discarded
      ];

      currentData.kittenDrawnBy = null;

      let logMsg = `💥 BÙM!!! ${playerName} đã bị LOẠI KHỎI CUỘC CHƠI!`;

      // Check win condition
      const playerIds = Object.keys(currentData.players);
      const alivePlayers = playerIds.filter((id) => currentData.players[id].isAlive);

      if (alivePlayers.length === 1) {
        // Only one survivor! Game Over
        currentData.status = "GAMEOVER";
        currentData.winnerId = alivePlayers[0];
        currentData.winnerName = currentData.players[alivePlayers[0]].name;
        logMsg += `\n🏆 Người chiến thắng là: ${currentData.winnerName}!`;
      } else {
        // Advance turn index to next alive player
        currentData.turnIndex = getNextAliveIndex(currentData.turnIndex, currentData.players, playerIds);
        logMsg += `. Đến lượt ${currentData.players[playerIds[currentData.turnIndex]].name}`;
      }

      currentData.logs = [...(currentData.logs || []), logMsg];
      return currentData;
    });
  };

  // ==========================================
  // CARD SELECTION LOGIC
  // ==========================================
  const toggleSelectCard = (index: number) => {
    if (roomData.pendingAction) return;
    if (roomData.kittenDrawnBy) return;
    
    // Play flip sound
    playTickSound();

    setSelectedCards((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        // Limit to 2 cards selection max
        if (prev.length >= 2) {
          return [prev[1], index];
        }
        return [...prev, index];
      }
    });
  };

  // Check if selection is valid for single card play
  const isSinglePlayable = () => {
    if (selectedCards.length !== 1) return false;
    const card = myHand[selectedCards[0]] as ExplodingCardType;
    return card !== "DEFUSE" && card !== "KITTEN" && !card.startsWith("CAT_") && card !== "FAVOR";
  };

  // Check if selection is matching pair
  const isPairPlayable = () => {
    if (selectedCards.length !== 2) return false;
    return myHand[selectedCards[0]] === myHand[selectedCards[1]];
  };

  const isFavorPlayable = () => {
    if (selectedCards.length !== 1) return false;
    return myHand[selectedCards[0]] === "FAVOR";
  };

  // Discard Pile Card rendering helper
  const renderDiscardPileTop = () => {
    const pile = roomData.discardPile || [];
    if (pile.length === 0) {
      return (
        <div style={{
          width: "120px",
          height: "170px",
          border: "2px dashed rgba(255, 255, 255, 0.15)",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          background: "rgba(0, 0, 0, 0.2)"
        }}>
          Trống 💤
        </div>
      );
    }

    const topCardType = pile[pile.length - 1] as ExplodingCardType;
    const cardInfo = EXPLODING_CARDS[topCardType];

    if (!cardInfo) {
      return <div style={{ color: "var(--text-muted)" }}>Lỗi bài</div>;
    }

    return (
      <div style={{
        width: "120px",
        height: "170px",
        background: `linear-gradient(135deg, ${cardInfo.color}40 0%, ${cardInfo.color}15 100%)`,
        border: `2px solid ${cardInfo.color}`,
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 6px",
        boxShadow: `0 0 15px ${cardInfo.color}30`,
        position: "relative"
      }}>
        <div style={{ fontSize: "1.6rem" }}>{cardInfo.icon}</div>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
          {cardInfo.name.split(" ")[0]}
        </div>
        <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)", textAlign: "center" }}>
          Bỏ ({pile.length})
        </div>
      </div>
    );
  };

  const handleEndGameEarly = async () => {
    if (window.confirm("Bạn có chắc chắn muốn kết thúc trận đấu sớm? Tất cả người chơi sẽ bị thoát.")) {
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

  return (
    <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "16px", minHeight: "92vh", display: "flex", flexDirection: "column" }}>
      {/* TOP HEADER STATUS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
        <button
          onClick={handleEndGameEarly}
          className="btn-icon"
          style={{ width: "36px", height: "36px", borderColor: "rgba(244,63,94,0.3)" }}
          title="Kết thúc trận đấu"
        >
          <LogOut size={16} style={{ color: "var(--color-danger)" }} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="badge-new" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc" }}>
            Phòng: {roomCode}
          </span>
          {roomData.attackTurns > 0 && (
            <span className="badge-new animate-pulse" style={{ background: "rgba(244, 63, 94, 0.2)", border: "1px solid rgba(244, 63, 94, 0.4)", color: "#fca5a5", display: "flex", alignItems: "center", gap: "2px" }}>
              <Flame size={12} /> Phạt: {roomData.attackTurns} lượt
            </span>
          )}
        </div>

        <button
          onClick={() => {
            playTickSound();
            setSoundEnabled(!soundEnabled);
          }}
          className="btn-icon"
          style={{ width: "36px", height: "36px" }}
          title={soundEnabled ? "Tắt âm" : "Bật âm"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-muted" />}
        </button>
      </div>

      {/* TURN ANNOUNCEMENT BAR */}
      <div
        className={isMyTurn ? "animated-pulse-border" : ""}
        style={{
          background: isMyTurn ? "rgba(99, 102, 241, 0.08)" : "rgba(255,255,255,0.02)",
          border: isMyTurn ? "1.5px solid rgba(99, 102, 241, 0.3)" : "1.5px solid rgba(255,255,255,0.05)",
          padding: "10px 14px",
          borderRadius: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px"
        }}
      >
        <div style={{ textAlign: "left" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Lượt đi</span>
          <h4 style={{ color: isMyTurn ? "#c7d2fe" : "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <User size={16} />
            {isMyTurn ? "👉 Lượt của bạn!" : players[currentPlayerId]?.name || "Đang tải"}
          </h4>
        </div>
        
        <button
          onClick={() => {
            playTickSound();
            setShowLogs(!showLogs);
          }}
          className="btn btn-sm btn-secondary"
          style={{ display: "flex", gap: "4px", height: "32px", padding: "0 10px", borderRadius: "8px" }}
        >
          <List size={14} /> Nhật ký
        </button>
      </div>

      {/* COLLAPSIBLE LOGS VIEW */}
      {showLogs && (
        <div style={{
          background: "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "12px",
          maxHeight: "150px",
          overflowY: "auto",
          textAlign: "left",
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginBottom: "16px"
        }}>
          {(roomData.logs || []).map((log: string, idx: number) => (
            <div key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "2px" }}>
              {log}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}

      {/* TABLE AREA: DRAW & DISCARD PILES */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "40px", margin: "24px 0", flex: 1 }}>
        
        {/* DRAW PILE */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleDrawCard}
            disabled={!isMyTurn || !!roomData.pendingAction || !!roomData.kittenDrawnBy || isSpectator}
            style={{
              width: "120px",
              height: "170px",
              background: isMyTurn && !roomData.pendingAction && !roomData.kittenDrawnBy ? "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)" : "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
              border: isMyTurn && !roomData.pendingAction && !roomData.kittenDrawnBy ? "3px solid #818cf8" : "2px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              cursor: isMyTurn && !roomData.pendingAction && !roomData.kittenDrawnBy && !isSpectator ? "pointer" : "default",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isMyTurn && !roomData.pendingAction && !roomData.kittenDrawnBy ? "0 0 20px rgba(99, 102, 241, 0.4)" : "0 4px 12px rgba(0, 0, 0, 0.3)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              transform: isMyTurn && !roomData.pendingAction && !roomData.kittenDrawnBy && !isSpectator ? "scale(1.03)" : "scale(1)"
            }}
          >
            {/* Draw card visual patterns */}
            <div style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              right: "10px",
              bottom: "10px",
              border: "1px dashed rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ fontSize: "2rem", marginBottom: "8px" }}>🔥</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#ffffff", letterSpacing: "1px" }}>RÚT BÀI</span>
            </div>
          </button>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
            {roomData.drawPile?.length || 0} lá còn lại
          </span>
        </div>

        {/* DISCARD PILE */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          {renderDiscardPileTop()}
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
            Chồng bài bỏ
          </span>
        </div>
      </div>

      {/* GAME PLAYERS STATUS SUMMARY BAR */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "6px",
        overflowX: "auto",
        padding: "6px 0",
        marginBottom: "16px",
        borderTop: "1px solid rgba(255,255,255,0.04)"
      }}>
        {playerIds.map((id) => {
          const p = players[id];
          const active = id === currentPlayerId;
          const dead = !p.isAlive;
          
          return (
            <div
              key={id}
              style={{
                padding: "6px 10px",
                borderRadius: "10px",
                background: active ? "rgba(99, 102, 241, 0.12)" : "rgba(255, 255, 255, 0.02)",
                border: active ? "1px solid rgba(99, 102, 241, 0.25)" : "1px solid rgba(255, 255, 255, 0.05)",
                fontSize: "0.75rem",
                color: dead ? "var(--text-muted)" : active ? "#c7d2fe" : "var(--text-secondary)",
                textDecoration: dead ? "line-through" : "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flexShrink: 0
              }}
            >
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: dead ? "var(--color-danger)" : "var(--color-emerald)"
              }} />
              {p.name} ({p.hand?.length || 0} lá)
            </div>
          );
        })}
      </div>

      {/* SPECTATOR WARNING */}
      {isSpectator && (
        <div style={{
          background: "rgba(244, 63, 94, 0.1)",
          border: "1px solid rgba(244, 63, 94, 0.2)",
          padding: "8px 12px",
          borderRadius: "10px",
          color: "#fda4af",
          fontSize: "0.8rem",
          marginBottom: "12px",
          fontWeight: 500
        }}>
          👁️ BẠN ĐÃ BỊ LOẠI. Hiện đang quan sát trận đấu.
        </div>
      )}

      {/* PLAY ACTIONS TOOLBAR */}
      {isMyTurn && !roomData.pendingAction && !roomData.kittenDrawnBy && !isSpectator && (
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px"
        }}>
          {isSinglePlayable() && (
            <button
              onClick={handlePlayCard}
              className="btn btn-primary btn-block animated-bounce-in"
              style={{ height: "44px", fontSize: "0.9rem" }}
            >
              Đánh lá: {EXPLODING_CARDS[myHand[selectedCards[0]] as ExplodingCardType]?.name.split(" ")[0]}
            </button>
          )}

          {isFavorPlayable() && (
            <button
              onClick={handlePlayFavor}
              className="btn btn-primary btn-block animated-bounce-in"
              style={{ height: "44px", fontSize: "0.9rem" }}
            >
              Đòi bài (Ủng Hộ) 🤝
            </button>
          )}

          {isPairPlayable() && (
            <button
              onClick={handlePlayCatPair}
              className="btn btn-emerald btn-block animated-bounce-in"
              style={{ height: "44px", fontSize: "0.9rem" }}
            >
              Cướp bài (Đánh Cặp) 🐾
            </button>
          )}
        </div>
      )}

      {/* SELECTED CARD(S) PREVIEW DETAIL */}
      {selectedCards.length === 1 && (
        <div className="animated-bounce-in" style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          {(() => {
            const cardType = myHand[selectedCards[0]];
            const cardInfo = EXPLODING_CARDS[cardType as ExplodingCardType];
            if (!cardInfo) return null;
            
            const isKitten = cardType === "KITTEN";
            const isDefuse = cardType === "DEFUSE";
            const innerBorderColor = isDefuse ? "#fbbf24" : isKitten ? "#ef4444" : "rgba(255,255,255,0.18)";

            return (
              <div style={{
                width: "185px",
                height: "255px",
                background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)", // Charcoal carbon texture
                border: `4px solid ${cardInfo.color}`,
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${cardInfo.color}50`,
                overflow: "hidden",
                position: "relative",
                color: "#ffffff"
              }}>
                {/* Metallic Inner Border */}
                <div style={{
                  position: "absolute",
                  top: "2px",
                  left: "2px",
                  right: "2px",
                  bottom: "2px",
                  border: `1.2px solid ${innerBorderColor}`,
                  borderRadius: "14px",
                  pointerEvents: "none",
                  zIndex: 5
                }} />

                {/* Card Name Header Band */}
                <div style={{
                  background: cardInfo.color,
                  padding: "5px 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#ffffff",
                  zIndex: 2
                }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.5px" }}>{cardInfo.name.toUpperCase()}</span>
                  <span style={{ fontSize: "1rem" }}>{cardInfo.icon}</span>
                </div>

                {/* Gem Badge & Illustration Box */}
                <div style={{
                  background: "rgba(0, 0, 0, 0.25)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "10px",
                  margin: "8px 8px 4px 8px",
                  padding: "6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  zIndex: 2
                }}>
                  {/* Glowing Gem Badge */}
                  <div style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${cardInfo.color}35 0%, #1e1b4b 100%)`,
                    border: `2.2px solid ${cardInfo.color}`,
                    boxShadow: `0 0 15px ${cardInfo.color}60`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "8px"
                  }}>
                    <span style={{ fontSize: "2.2rem" }}>{cardInfo.icon}</span>
                  </div>
                </div>

                {/* Comic Ribbon */}
                <div style={{
                  background: "#fef08a", // Comic yellow
                  border: "1px solid #eab308",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  margin: "0 10px 8px 10px",
                  fontSize: "0.62rem",
                  fontStyle: "italic",
                  color: "#78350f", // Dark brown text
                  fontWeight: 700,
                  textAlign: "center",
                  lineHeight: "1.3",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                  transform: "rotate(-1.5deg)",
                  zIndex: 2
                }}>
                  "{cardInfo.illustration}"
                </div>

                {/* Action Rules Text */}
                <div style={{
                  background: "rgba(0,0,0,0.35)",
                  padding: "8px 10px",
                  borderTop: "1.5px solid rgba(255, 255, 255, 0.08)",
                  fontSize: "0.6rem",
                  color: "#d6d3d1",
                  lineHeight: "1.3",
                  textAlign: "left",
                  zIndex: 2
                }}>
                  <b>Hiệu lực:</b> {cardInfo.description}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {selectedCards.length === 2 && (
        <div className="animated-bounce-in" style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          {(() => {
            const cardType1 = myHand[selectedCards[0]];
            const cardInfo1 = EXPLODING_CARDS[cardType1 as ExplodingCardType];
            if (!cardInfo1) return null;
            
            const isKitten1 = cardType1 === "KITTEN";
            const isDefuse1 = cardType1 === "DEFUSE";
            const innerBorderColor1 = isDefuse1 ? "#fbbf24" : isKitten1 ? "#ef4444" : "rgba(255,255,255,0.18)";

            return (
              <div style={{ display: "flex", position: "relative", width: "220px", height: "255px", justifyContent: "center" }}>
                
                {/* Left Card (Card 1) */}
                <div style={{
                  width: "185px",
                  height: "255px",
                  background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
                  border: `4px solid ${cardInfo1.color}`,
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
                  overflow: "hidden",
                  position: "absolute",
                  left: 0,
                  transform: "rotate(-6deg)",
                  color: "#ffffff"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "2px",
                    left: "2px",
                    right: "2px",
                    bottom: "2px",
                    border: `1.2px solid ${innerBorderColor1}`,
                    borderRadius: "14px",
                    pointerEvents: "none",
                    zIndex: 5
                  }} />
                  <div style={{ background: cardInfo1.color, padding: "5px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#ffffff" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800 }}>{cardInfo1.name.split(" ")[0]}</span>
                    <span style={{ fontSize: "1rem" }}>{cardInfo1.icon}</span>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", margin: "8px 8px 4px 8px", padding: "6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: `radial-gradient(circle, ${cardInfo1.color}35 0%, #1e1b4b 100%)`, border: `2.2px solid ${cardInfo1.color}`, boxShadow: `0 0 10px ${cardInfo1.color}50`, display: "flex", alignItems: "center", margin: "0 auto", justifyContent: "center" }}>
                      <span style={{ fontSize: "1.8rem" }}>{cardInfo1.icon}</span>
                    </div>
                  </div>
                  <div style={{ background: "#fef08a", border: "1px solid #eab308", borderRadius: "6px", padding: "4px 8px", margin: "0 10px 8px 10px", fontSize: "0.6rem", fontStyle: "italic", color: "#78350f", fontWeight: 700, textAlign: "center", lineHeight: "1.3", boxShadow: "0 3px 6px rgba(0,0,0,0.1)" }}>
                    "{cardInfo1.illustration}"
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.35)", padding: "8px 10px", borderTop: "1.5px solid rgba(255, 255, 255, 0.08)", fontSize: "0.6rem", color: "#d6d3d1", lineHeight: "1.25", textAlign: "left" }}>
                    <b>Cặp đôi:</b> Cướp ngẫu nhiên 1 lá bài.
                  </div>
                </div>

                {/* Right Card (Card 2) */}
                <div style={{
                  width: "185px",
                  height: "255px",
                  background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
                  border: `4px solid ${cardInfo1.color}`,
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.5)",
                  overflow: "hidden",
                  position: "absolute",
                  right: 0,
                  transform: "rotate(6deg)",
                  zIndex: 2,
                  color: "#ffffff"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "2px",
                    left: "2px",
                    right: "2px",
                    bottom: "2px",
                    border: `1.2px solid ${innerBorderColor1}`,
                    borderRadius: "14px",
                    pointerEvents: "none",
                    zIndex: 5
                  }} />
                  <div style={{ background: cardInfo1.color, padding: "5px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#ffffff" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800 }}>{cardInfo1.name.split(" ")[0]}</span>
                    <span style={{ fontSize: "1rem" }}>{cardInfo1.icon}</span>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", margin: "8px 8px 4px 8px", padding: "6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: `radial-gradient(circle, ${cardInfo1.color}35 0%, #1e1b4b 100%)`, border: `2.2px solid ${cardInfo1.color}`, boxShadow: `0 0 10px ${cardInfo1.color}50`, display: "flex", alignItems: "center", margin: "0 auto", justifyContent: "center" }}>
                      <span style={{ fontSize: "1.8rem" }}>{cardInfo1.icon}</span>
                    </div>
                  </div>
                  <div style={{ background: "#fef08a", border: "1px solid #eab308", borderRadius: "6px", padding: "4px 8px", margin: "0 10px 8px 10px", fontSize: "0.6rem", fontStyle: "italic", color: "#78350f", fontWeight: 700, textAlign: "center", lineHeight: "1.3", boxShadow: "0 3px 6px rgba(0,0,0,0.1)" }}>
                    "{cardInfo1.illustration}"
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.35)", padding: "8px 10px", borderTop: "1.5px solid rgba(255, 255, 255, 0.08)", fontSize: "0.6rem", color: "#d6d3d1", lineHeight: "1.25", textAlign: "left" }}>
                    <b>Cặp đôi:</b> Cướp ngẫu nhiên 1 lá bài.
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      )}

      {/* MY HAND CARDS CONTAINER */}
      <div style={{ textAlign: "left", marginTop: "auto" }}>
        <h4 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 600 }}>
          Bài trên tay bạn ({myHand.length})
        </h4>
        
        {myHand.length === 0 ? (
          <div style={{
            padding: "20px",
            border: "1px dashed rgba(255,255,255,0.08)",
            borderRadius: "14px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.85rem"
          }}>
            Không còn lá bài nào! Hãy rút bài từ chồng bài rút.
          </div>
        ) : (
          <div style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            padding: "18px 0 24px 0",
            WebkitOverflowScrolling: "touch",
            minHeight: "170px" // ensure enough spacing for fanned cards fanning down
          }}>
            {(() => {
              const numCards = myHand.length;
              const centerIdx = (numCards - 1) / 2;
              const maxRotation = 14; // max rotation in degrees
              // dynamic step size based on player hand size
              const rotationStep = numCards <= 1 ? 0 : Math.min(4.5, maxRotation / centerIdx);

              return myHand.map((cardType: string, idx: number) => {
                const cardInfo = EXPLODING_CARDS[cardType as ExplodingCardType];
                if (!cardInfo) return null;
                
                const isSelected = selectedCards.includes(idx);
                const disabled = isSpectator || !!roomData.kittenDrawnBy || (roomData.pendingAction && cardType !== "NOPE");

                // Mathematical fanning logic calculations
                const angle = (idx - centerIdx) * rotationStep;
                const translateY = Math.abs(idx - centerIdx) * Math.abs(idx - centerIdx) * 1.6;

                // Lift and straighten selected cards
                const finalAngle = isSelected ? 0 : angle;
                const finalTranslateY = isSelected ? -24 : translateY;
                const finalScale = isSelected ? 1.05 : 1;

                const isKitten = cardType === "KITTEN";
                const isDefuse = cardType === "DEFUSE";
                const innerBorderColor = isDefuse ? "#fbbf24" : isKitten ? "#ef4444" : "rgba(255,255,255,0.18)";

                return (
                  <div
                    key={idx}
                    onClick={() => !disabled && toggleSelectCard(idx)}
                    style={{
                      width: "88px",
                      height: "128px",
                      background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)", // Carbon black theme
                      border: isSelected ? `2.5px solid #ffffff` : `1.8px solid ${cardInfo.color}`,
                      borderRadius: "10px",
                      display: "flex",
                      flexDirection: "column",
                      cursor: disabled ? "default" : "pointer",
                      boxShadow: isSelected ? `0 0 15px ${cardInfo.color}, 0 6px 12px rgba(0,0,0,0.5)` : "0 3px 6px rgba(0,0,0,0.25)",
                      flexShrink: 0,
                      opacity: disabled ? 0.45 : 1,
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: `translateY(${finalTranslateY}px) rotate(${finalAngle}deg) scale(${finalScale})`,
                      overflow: "hidden",
                      color: "#ffffff",
                      position: "relative"
                    }}
                  >
                    {/* Metallic Inner Border */}
                    <div style={{
                      position: "absolute",
                      top: "2px",
                      left: "2px",
                      right: "2px",
                      bottom: "2px",
                      border: `0.8px solid ${innerBorderColor}`,
                      borderRadius: "8px",
                      pointerEvents: "none",
                      zIndex: 5
                    }} />

                    {/* Card Name Header Band */}
                    <div style={{
                      background: cardInfo.color,
                      padding: "2.5px 4px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "#ffffff",
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      zIndex: 2
                    }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cardInfo.name.split(" ")[0]}
                      </span>
                      <span>{cardInfo.icon}</span>
                    </div>

                    {/* Card Illustration Gem Badge */}
                    <div style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "6px",
                      margin: "3px 3px 2px 3px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: 1,
                      zIndex: 2
                    }}>
                      {/* Gem Badge */}
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${cardInfo.color}35 0%, #1e1b4b 100%)`,
                        border: `1.2px solid ${cardInfo.color}`,
                        boxShadow: `0 0 8px ${cardInfo.color}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <span style={{ fontSize: "1.3rem" }}>{cardInfo.icon}</span>
                      </div>
                    </div>

                    {/* Card Description Footer */}
                    <div style={{
                      padding: "2.5px 4px",
                      fontSize: "0.45rem",
                      lineHeight: "1.15",
                      textAlign: "center",
                      background: "rgba(0,0,0,0.3)",
                      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      fontWeight: 500,
                      color: "#cbd5e1",
                      zIndex: 2
                    }}>
                      {cardInfo.description.replace("Bùm! Bạn bị loại trừ ngay lập tức nếu không có Tháo Gỡ.", "Thua ngay nếu không có Tháo Gỡ")}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* ==========================================
          MODALS & OVERLAYS 
          ========================================== */}

      {/* NOPE COUNTDOWN BANNER OVERLAY */}
      {roomData.pendingAction && (
        <div style={{
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: "468px",
          background: "#18181b",
          border: "2px solid #ef4444",
          borderRadius: "20px",
          padding: "16px",
          zIndex: 100,
          boxShadow: "0 10px 30px rgba(239, 68, 68, 0.25)",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h4 style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fca5a5" }}>
              <Timer size={18} className="animate-pulse" />
              🛑 ĐANG ĐỢI CHẶN (NOPE)
            </h4>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ef4444" }}>
              {countdown.toFixed(1)}s
            </span>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "12px", lineHeight: "1.4" }}>
            <b>{roomData.pendingAction.senderName}</b> đã đánh lá bài{" "}
            <span style={{ color: EXPLODING_CARDS[roomData.pendingAction.card as ExplodingCardType]?.color, fontWeight: 700 }}>
              {EXPLODING_CARDS[roomData.pendingAction.card as ExplodingCardType]?.name}
            </span>.
            {roomData.pendingAction.nopeCount > 0 && (
              <span style={{ display: "block", color: "#fb7185", fontWeight: 600, fontSize: "0.78rem", marginTop: "2px" }}>
                ⚠️ Bị chặn bởi {roomData.pendingAction.nopeCount} lá NOPE (Hiệu lực: {roomData.pendingAction.nopeCount % 2 === 1 ? "BỊ CHẶN" : "BÌNH THƯỜNG"})
              </span>
            )}
          </p>

          {/* Countdown Progress Bar */}
          <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", marginBottom: "12px" }}>
            <div style={{ height: "100%", background: "#ef4444", width: `${(countdown / 5) * 100}%`, transition: "width 0.1s linear" }} />
          </div>

          {/* Trigger Nope button if I have a Nope card */}
          {myHand.includes("NOPE") && !isSpectator ? (
            <button
              onClick={handleNopeAction}
              className="btn btn-danger btn-block"
              style={{ height: "42px", display: "flex", gap: "8px" }}
            >
              ĐÁNH NOPE! 🛑
            </button>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.78rem", padding: "6px 0" }}>
              Bạn không thể chặn (không có thẻ NOPE)
            </div>
          )}
        </div>
      )}

      {/* KITTEN DRAWN / DEFUSING SCREEN */}
      {roomData.kittenDrawnBy && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(9, 9, 11, 0.95)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          {roomData.kittenDrawnBy === playerId ? (
            /* ACTIVE EXPLOSION INTERACTIVE SCREEN */
            <div className="glass-panel animated-bounce-in text-center" style={{ maxWidth: "420px", border: "2px solid var(--color-danger)" }}>
              <div style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "rgba(244, 63, 94, 0.1)",
                border: "2.5px solid var(--color-danger)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 0 20px rgba(244,63,94,0.3)",
                fontSize: "3rem"
              }} className="animate-pulse">
                💣
              </div>

              <h2 className="color-spy" style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
                ⚠️ RÚT PHẢI MÈO NỔ! ⚠️
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px", lineHeight: "1.5" }}>
                Nếu không dùng lá bài <b>Tháo Gỡ (Defuse)</b> ngay lập tức, bạn sẽ bị nổ tung và rời trò chơi!
              </p>

              {myHand.includes("DEFUSE") ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", padding: "16px", borderRadius: "16px" }}>
                  <h4 style={{ fontSize: "0.85rem", color: "#34d399", fontWeight: 700, textAlign: "left", marginBottom: "4px" }}>
                    Chọn vị trí đặt lại Mèo Nổ vào bộ bài:
                  </h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <button onClick={() => handleDefuseKitten(0)} className="btn btn-sm btn-emerald">
                      Trên cùng (Top)
                    </button>
                    <button onClick={() => handleDefuseKitten(Math.floor(Math.random() * (roomData.drawPile?.length || 1)))} className="btn btn-sm btn-emerald">
                      Ngẫu nhiên
                    </button>
                    <button onClick={() => handleDefuseKitten(roomData.drawPile?.length || 0)} className="btn btn-sm btn-emerald">
                      Dưới cùng
                    </button>
                    <button onClick={() => handleDefuseKitten(1)} className="btn btn-sm btn-emerald">
                      Thứ hai (Vị trí 2)
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ margin: "20px 0" }}>
                  <div style={{
                    background: "rgba(244, 63, 94, 0.15)",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                    color: "#fda4af",
                    padding: "12px",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    marginBottom: "16px"
                  }}>
                    Bạn không có lá Tháo Gỡ trên tay!
                  </div>
                  <button onClick={handleExplode} className="btn btn-danger btn-block">
                    💥 TÔI CHẤP NHẬN LOẠI CẬU! 💥
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* SPECTATING OTHER PLAYER GỠ BOM */
            <div className="glass-panel text-center" style={{ maxWidth: "380px" }}>
              <Loader2 className="animate-spin block-center" size={40} style={{ color: "var(--color-danger)", marginBottom: "16px" }} />
              <h3 style={{ marginBottom: "8px" }}>⚠️ MÈO NỔ ĐÃ XUẤT HIỆN!</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>
                <b>{players[roomData.kittenDrawnBy]?.name}</b> đã rút phải Mèo Nổ! Đang chờ họ tháo gỡ hoặc phát nổ...
              </p>
            </div>
          )}
        </div>
      )}

      {/* SEE THE FUTURE MODAL */}
      {futureCards && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 250,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div className="glass-panel animated-bounce-in text-center" style={{ maxWidth: "400px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center", marginBottom: "8px", color: "var(--color-secondary)" }}>
              <Eye size={20} /> XEM TRƯỚC TƯƠNG LAI
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Đây là 3 lá bài tiếp theo trên đỉnh chồng bài rút (từ trên xuống dưới):
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {futureCards.map((cardType, i) => {
                const info = EXPLODING_CARDS[cardType as ExplodingCardType];
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      background: "rgba(255,255,255,0.03)",
                      border: `1.5px solid ${info?.color || "rgba(255,255,255,0.1)"}`,
                      borderRadius: "12px",
                      textAlign: "left"
                    }}
                  >
                    <span style={{ fontSize: "1.6rem" }}>{info?.icon || "❓"}</span>
                    <div>
                      <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.9rem" }}>
                        {i + 1}. {info?.name || cardType}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        {info?.description}
                      </div>
                    </div>
                  </div>
                );
              })}
              {futureCards.length === 0 && (
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Hết bài để xem!</div>
              )}
            </div>

            <button onClick={() => setFutureCards(null)} className="btn btn-primary btn-block">
              ĐÃ HIỂU 👍
            </button>
          </div>
        </div>
      )}

      {/* STEAL TARGET SELECTOR MODAL */}
      {showStealModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 210,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div className="glass-panel animated-bounce-in text-center" style={{ maxWidth: "380px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Chọn mục tiêu cướp bài 🎯</h3>
              <button onClick={() => setShowStealModal(null)} className="btn-icon" style={{ width: "32px", height: "32px" }}>
                <X size={16} />
              </button>
            </div>

            {alivePlayers.length === 0 ? (
              <p style={{ color: "var(--text-muted)", padding: "16px" }}>Không còn người chơi nào khác còn sống!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {alivePlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => executeStealOrFavor(player.id, player.name)}
                    className="btn btn-secondary btn-block"
                    style={{ justifyContent: "space-between", height: "46px" }}
                  >
                    <span>{player.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      ({players[player.id].hand?.length || 0} lá bài)
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAVOR CARD HANDOVER WINDOW */}
      {roomData.favorState && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.9)",
          zIndex: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          {roomData.favorState.targetId === playerId ? (
            /* I MUST HANDOVER CARD TO SENDER */
            <div className="glass-panel animated-bounce-in text-center" style={{ maxWidth: "420px", border: "1.5px solid var(--color-primary)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🤝</div>
              <h3 style={{ marginBottom: "8px" }}>BẠN ĐƯỢC XIN ỦNG HỘ BÀI</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.4" }}>
                <b>{roomData.favorState.senderName}</b> đã dùng lá Ủng Hộ để xin bài bạn. Hãy chạm chọn một lá bài bất kỳ từ tay bạn để gửi cho họ:
              </p>

              {myHand.length === 0 ? (
                <div>
                  <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>Bạn không còn lá bài nào để tặng!</p>
                  {/* Instantly clear favor state if nothing to give */}
                  <button
                    onClick={async () => {
                      const db = getFirebaseDb();
                      if (db) await set(ref(db, `rooms/${roomCode}/favorState`), null);
                    }}
                    className="btn btn-primary btn-block"
                  >
                    Xác nhận không có bài
                  </button>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  maxHeight: "220px",
                  overflowY: "auto",
                  padding: "6px"
                }}>
                  {myHand.map((cardType: string, idx: number) => {
                    const info = EXPLODING_CARDS[cardType as ExplodingCardType];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleHandoverFavorCard(idx)}
                        style={{
                          background: `linear-gradient(135deg, ${info?.color || "#fff"}20 0%, ${info?.color || "#fff"}05 100%)`,
                          border: `1px solid ${info?.color || "rgba(255,255,255,0.15)"}`,
                          borderRadius: "10px",
                          padding: "8px 4px",
                          color: "#ffffff",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>{info?.icon}</span>
                        <span>{info?.name.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : roomData.favorState.senderId === playerId ? (
            /* I AM SENDER WAITING FOR CARD */
            <div className="glass-panel text-center" style={{ maxWidth: "380px" }}>
              <Loader2 className="animate-spin block-center" size={40} style={{ color: "var(--color-primary)", marginBottom: "16px" }} />
              <h3 style={{ marginBottom: "8px" }}>🤝 YÊU CẦU ỦNG HỘ</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>
                Đang chờ <b>{roomData.favorState.targetName}</b> chọn lá bài gửi tặng cho bạn...
              </p>
            </div>
          ) : (
            /* OTHERS SPECTATING */
            <div className="glass-panel text-center" style={{ maxWidth: "380px" }}>
              <h3 style={{ marginBottom: "8px" }}>🤝 THỦ TỤC XIN BÀI</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>
                <b>{roomData.favorState.senderName}</b> đang xin ủng hộ 1 lá bài từ tay của <b>{roomData.favorState.targetName}</b>...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
