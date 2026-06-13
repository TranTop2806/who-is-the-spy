import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  off,
  Database,
  runTransaction
} from "firebase/database";

const CONFIG_KEY = "lucid_bose_firebase_config";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Check if Firebase is configured in env or localStorage
export const getSavedFirebaseConfig = (): FirebaseConfig | null => {
  // 1. Try environment variables first (injected by Vite at build time)
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envDbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;

  if (envApiKey && envDbUrl) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
      databaseURL: envDbUrl,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
    };
  }

  // 2. Fall back to localStorage (for development/custom override)
  const saved = localStorage.getItem(CONFIG_KEY);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    if (parsed.apiKey && parsed.databaseURL) {
      return parsed;
    }
  } catch (e) {
    console.error("Error parsing saved Firebase config", e);
  }
  return null;
};

// Save config to localStorage
export const saveFirebaseConfig = (config: FirebaseConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

// Clear config from localStorage
export const clearFirebaseConfig = () => {
  localStorage.removeItem(CONFIG_KEY);
};

// Initialize Firebase App dynamically
let dbInstance: Database | null = null;

export const getFirebaseDb = (): Database | null => {
  if (dbInstance) return dbInstance;

  const config = getSavedFirebaseConfig();
  if (!config) return null;

  try {
    if (getApps().length === 0) {
      initializeApp(config);
    } else {
      // If already initialized but config changed, we re-initialize
      getApp();
      // Only re-initialize if needed, or simply return existing app
    }
    dbInstance = getDatabase();
    return dbInstance;
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    return null;
  }
};

// Re-initialize Firebase DB (force config reload)
export const forceReloadFirebaseDb = (): boolean => {
  dbInstance = null;
  const db = getFirebaseDb();
  return db !== null;
};

// ==========================================
// ROOM & LOBBY DB ACTIONS
// ==========================================

export const createRoom = async (roomCode: string, hostId: string, hostName: string): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!db) return false;

  const roomRef = ref(db, `rooms/${roomCode}`);
  const initialRoomState = {
    status: "LOBBY",
    hostId,
    turnIndex: 0,
    attackTurns: 0,
    players: {
      [hostId]: {
        name: hostName,
        isAlive: true,
        isReady: true,
        hand: []
      }
    },
    logs: [`${hostName} đã tạo phòng ${roomCode}`],
    timestamp: Date.now()
  };

  await set(roomRef, initialRoomState);
  return true;
};

export const joinRoom = async (roomCode: string, playerId: string, playerName: string): Promise<{ success: boolean; message: string }> => {
  const db = getFirebaseDb();
  if (!db) return { success: false, message: "Máy chủ trực tuyến chưa được cấu hình!" };

  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    return { success: false, message: "Phòng chơi không tồn tại!" };
  }

  const roomData = snapshot.val();
  if (roomData.status !== "LOBBY") {
    return { success: false, message: "Trận đấu đã bắt đầu hoặc kết thúc!" };
  }

  const players = roomData.players || {};
  const currentCount = Object.keys(players).length;

  if (currentCount >= 8) {
    return { success: false, message: "Phòng chơi đã đầy (tối đa 8 người)!" };
  }

  // Add player to room
  const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
  await set(playerRef, {
    name: playerName,
    isAlive: true,
    isReady: true,
    hand: []
  });

  // Append join log
  const logsRef = ref(db, `rooms/${roomCode}/logs`);
  const currentLogs = roomData.logs || [];
  await set(logsRef, [...currentLogs, `${playerName} đã vào phòng`]);

  return { success: true, message: "Vào phòng thành công!" };
};

export const listenToRoom = (roomCode: string, onUpdate: (data: any) => void) => {
  const db = getFirebaseDb();
  if (!db) return () => {};

  const roomRef = ref(db, `rooms/${roomCode}`);
  const callback = onValue(roomRef, (snapshot) => {
    onUpdate(snapshot.val());
  });

  // Return unsubscribe function
  return () => {
    off(roomRef, "value", callback);
  };
};

export const updateRoomState = async (roomCode: string, updates: any) => {
  const db = getFirebaseDb();
  if (!db) return;

  const roomRef = ref(db, `rooms/${roomCode}`);
  await update(roomRef, updates);
};

// Transaction to safely draw a card and sync
export const drawCardTransaction = async (roomCode: string, playerId: string, playerName: string) => {
  const db = getFirebaseDb();
  if (!db) return null;

  const roomRef = ref(db, `rooms/${roomCode}`);
  
  const result = await runTransaction(roomRef, (currentData) => {
    if (!currentData) return;
    if (currentData.status !== "PLAYING") return;
    if (!currentData.drawPile || currentData.drawPile.length === 0) return;

    const players = currentData.players;
    const player = players[playerId];
    
    // Check if player is alive
    if (!player || !player.isAlive) return;

    // Draw the card
    const nextDeck = [...currentData.drawPile];
    const drawnCard = nextDeck.shift(); // take the top card

    if (!drawnCard) return;

    // Mutate state based on card type
    let logMsg = "";
    if (drawnCard === "KITTEN") {
      logMsg = `⚠️ ${playerName} đã rút phải MÈO NỔ!`;
      // We don't advance the turn yet. The player must play a Defuse or explode.
      // Let's set a state showing they have drawn the kitten.
      currentData.kittenDrawnBy = playerId;
    } else {
      logMsg = `${playerName} đã rút 1 lá bài`;
      
      // Add card to hand
      const currentHand = player.hand || [];
      player.hand = [...currentHand, drawnCard];

      // Handle Attack turn decrements
      if (currentData.attackTurns > 1) {
        currentData.attackTurns -= 1;
        logMsg += ` (Lượt đi thêm: còn lại ${currentData.attackTurns} lượt)`;
      } else {
        currentData.attackTurns = 0;
        // Advance turn index
        const playerIds = Object.keys(players);
        let nextIndex = currentData.turnIndex;
        
        // Find next alive player
        do {
          nextIndex = (nextIndex + 1) % playerIds.length;
        } while (!players[playerIds[nextIndex]].isAlive && nextIndex !== currentData.turnIndex);
        
        currentData.turnIndex = nextIndex;
      }
    }

    currentData.drawPile = nextDeck;
    currentData.logs = [...(currentData.logs || []), logMsg];
    
    // Record drawn card temporarily to show animate reveal
    currentData.lastAction = {
      type: "DRAW",
      senderId: playerId,
      card: drawnCard,
      timestamp: Date.now()
    };

    return currentData;
  });

  return result.committed ? result.snapshot.val() : null;
};

// ==========================================
// UNO ROOM & GAME ACTIONS
// ==========================================

export const createUnoRoom = async (roomCode: string, hostId: string, hostName: string): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!db) return false;

  const roomRef = ref(db, `rooms/${roomCode}`);
  const initialRoomState = {
    gameType: "UNO",
    status: "LOBBY",
    hostId,
    turnIndex: 0,
    direction: "CW", // CW or CCW
    drawPenalty: 0,
    currentActiveColor: "",
    topCard: null,
    players: {
      [hostId]: {
        name: hostName,
        isReady: true,
        hand: []
      }
    },
    logs: [`${hostName} đã tạo phòng Uno ${roomCode}`],
    timestamp: Date.now()
  };

  await set(roomRef, initialRoomState);
  return true;
};

export const unoDrawCardTransaction = async (roomCode: string, playerId: string, playerName: string) => {
  const db = getFirebaseDb();
  if (!db) return null;

  const roomRef = ref(db, `rooms/${roomCode}`);

  const result = await runTransaction(roomRef, (currentData) => {
    if (!currentData) return;
    if (currentData.status !== "PLAYING") return;

    const players = currentData.players;
    const player = players[playerId];
    if (!player) return;

    let drawPile = currentData.drawPile || [];
    let discardPile = currentData.discardPile || [];
    const penalty = currentData.drawPenalty || 0;
    const cardsToDraw = penalty > 0 ? penalty : 1;

    // Helper to refill deck if needed
    const ensureCardsInDeck = (countNeeded: number) => {
      if (drawPile.length < countNeeded) {
        // Recycle discard pile except top card
        const top = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
        const toShuffle = top ? discardPile.slice(0, -1) : discardPile;
        
        // Shuffle
        const shuffled = toShuffle.sort(() => Math.random() - 0.5);
        drawPile = [...drawPile, ...shuffled];
        discardPile = top ? [top] : [];
      }
    };

    ensureCardsInDeck(cardsToDraw);

    // Draw cards
    const drawnCards: any[] = [];
    for (let i = 0; i < cardsToDraw; i++) {
      if (drawPile.length > 0) {
        drawnCards.push(drawPile.shift());
      }
    }

    if (drawnCards.length === 0) return;

    // Add to hand
    player.hand = [...(player.hand || []), ...drawnCards];

    let logMsg = "";
    if (penalty > 0) {
      logMsg = `📥 ${playerName} bị phạt rút ${penalty} lá bài và cấm lượt!`;
      currentData.drawPenalty = 0;
      
      // Advance turn
      const playerIds = Object.keys(players);
      let nextIndex = currentData.turnIndex;
      const step = currentData.direction === "CW" ? 1 : -1;
      nextIndex = (nextIndex + step + playerIds.length) % playerIds.length;
      currentData.turnIndex = nextIndex;
    } else {
      logMsg = `📥 ${playerName} đã rút 1 lá bài.`;
    }

    currentData.drawPile = drawPile;
    currentData.discardPile = discardPile;
    currentData.logs = [...(currentData.logs || []), logMsg];

    currentData.lastAction = {
      type: "DRAW",
      senderId: playerId,
      cards: drawnCards,
      timestamp: Date.now()
    };

    return currentData;
  });

  return result.committed ? result.snapshot.val() : null;
};

