import React, { useState, useEffect } from "react";
import { Moon, Sun, Shield, Eye, Skull, ArrowRight, Volume2, UserCheck, AlertTriangle, Users } from "lucide-react";
import { soundManager } from "../../utils/SoundManager";
import { WEREWOLF_ROLES } from "../../data/werewolfRoles";
import type { WerewolfRoleType } from "../../data/werewolfRoles";

interface WerewolfBoardProps {
  config: {
    playerNames: string[];
    roles: Record<WerewolfRoleType, number>;
  };
  onGameOver: (winner: string, finalPlayers: any[]) => void;
  onQuit: () => void;
}

interface Player {
  id: string;
  name: string;
  role: WerewolfRoleType;
  isAlive: boolean;
  hasSeenRole: boolean;
}

type WerewolfStage = 
  | "ROLE_REVEAL"
  | "NIGHT_START"
  | "CUPID_TURN"
  | "BODYGUARD_TURN"
  | "WEREWOLF_TURN"
  | "SEER_TURN"
  | "WITCH_TURN"
  | "DAY_ANNOUNCE"
  | "DAY_DISCUSS"
  | "DAY_VOTE"
  | "HUNTER_SHOT_TURN";

export const WerewolfBoard: React.FC<WerewolfBoardProps> = ({ config, onGameOver, onQuit }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [revealIndex, setRevealIndex] = useState<number>(0);
  const [showRoleCard, setShowRoleCard] = useState<boolean>(false);

  // Game tracking states
  const [stage, setStage] = useState<WerewolfStage>("ROLE_REVEAL");
  const [nightNumber, setNightNumber] = useState<number>(1);
  const [logs, setLogs] = useState<string[]>(["🎮 Bắt đầu chia vai trò bí mật."]);

  // Night decisions
  const [bodyguardTarget, setBodyguardTarget] = useState<string | null>(null);
  const [werewolfTarget, setWerewolfTarget] = useState<string | null>(null);
  const [seerTarget, setSeerTarget] = useState<string | null>(null);
  const [witchSave, setWitchSave] = useState<boolean>(false);
  const [witchKillTarget, setWitchKillTarget] = useState<string | null>(null);
  const [cupidLover1, setCupidLover1] = useState<string | null>(null);
  const [cupidLover2, setCupidLover2] = useState<string | null>(null);

  // Persistent states
  const [lovers, setLovers] = useState<string[]>([]); // 2 player IDs
  const [witchPotions, setWitchPotions] = useState<{ save: boolean; kill: boolean }>({ save: true, kill: true });
  const [lastBodyguardTarget, setLastBodyguardTarget] = useState<string | null>(null);
  const [deadThisNight, setDeadThisNight] = useState<string[]>([]); // player IDs who died tonight
  const [hunterPendingId, setHunterPendingId] = useState<string | null>(null); // hunter who needs to shoot

  // Discussion timer
  const [discussionTimeLeft, setDiscussionTimeLeft] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Initialize roles on mount
  useEffect(() => {
    const { playerNames, roles: configRoles } = config;
    
    // Create role pool
    const pool: WerewolfRoleType[] = [];
    Object.entries(configRoles).forEach(([role, count]) => {
      for (let i = 0; i < count; i++) {
        pool.push(role as WerewolfRoleType);
      }
    });

    // Shuffle pool
    const shuffledPool = pool.sort(() => Math.random() - 0.5);

    const generatedPlayers: Player[] = playerNames.map((name, index) => ({
      id: `w-${index}-${Date.now()}`,
      name,
      role: shuffledPool[index] || "VILLAGER",
      isAlive: true,
      hasSeenRole: false
    }));

    setPlayers(generatedPlayers);
  }, [config]);

  // Handle Discussion Timer
  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && discussionTimeLeft > 0 && stage === "DAY_DISCUSS") {
      timer = setInterval(() => {
        setDiscussionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerRunning(false);
            soundManager.playSuccess(); // alarm sound
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, discussionTimeLeft, stage]);

  const activeRevealPlayer = players[revealIndex];

  const handleRevealConfirm = () => {
    soundManager.playSuccess();
    setPlayers(prev => {
      const updated = [...prev];
      updated[revealIndex].hasSeenRole = true;
      return updated;
    });
    setShowRoleCard(false);

    if (revealIndex < players.length - 1) {
      setRevealIndex(prev => prev + 1);
    } else {
      // All players saw their role, transition to night start
      setStage("NIGHT_START");
      soundManager.playSuccess();
      setLogs(prev => [...prev, "🌃 Đêm thứ nhất buông xuống... Mọi người nhắm mắt đi ngủ."]);
    }
  };

  const getRoleBadgeColor = (role: WerewolfRoleType) => {
    const roleInfo = WEREWOLF_ROLES[role];
    if (roleInfo.side === "WEREWOLF") return "#ef4444";
    if (role === "VILLAGER") return "#22c55e";
    return "#8b5cf6";
  };

  // ==========================================
  // NIGHT PHASES FLOW HANDLERS
  // ==========================================

  const startNight = () => {
    soundManager.playSuccess();
    // Cupid only wakes up night 1
    if (nightNumber === 1 && config.roles.CUPID > 0) {
      setStage("CUPID_TURN");
    } else if (config.roles.BODYGUARD > 0) {
      setStage("BODYGUARD_TURN");
    } else {
      setStage("WEREWOLF_TURN");
    }
  };

  const handleCupidSelection = (id1: string, id2: string) => {
    soundManager.playSuccess();
    setCupidLover1(id1);
    setCupidLover2(id2);
    setLovers([id1, id2]);
    
    const p1 = players.find(p => p.id === id1)?.name;
    const p2 = players.find(p => p.id === id2)?.name;

    setLogs(prev => [...prev, `💘 Cupid đã liên kết hai người yêu nhau: ${p1} & ${p2}.`]);
    
    // Transition to next role
    if (config.roles.BODYGUARD > 0) {
      setStage("BODYGUARD_TURN");
    } else {
      setStage("WEREWOLF_TURN");
    }
  };

  const handleBodyguardSelection = (targetId: string | null) => {
    soundManager.playSuccess();
    setBodyguardTarget(targetId);
    setLastBodyguardTarget(targetId);
    
    const targetName = targetId ? players.find(p => p.id === targetId)?.name : "không ai";
    setLogs(prev => [...prev, `🛡️ Bảo vệ đã chọn bảo vệ ${targetName} đêm nay.`]);

    setStage("WEREWOLF_TURN");
  };

  const handleWerewolfSelection = (targetId: string) => {
    soundManager.playSuccess();
    setWerewolfTarget(targetId);
    
    const targetName = players.find(p => p.id === targetId)?.name;
    setLogs(prev => [...prev, `🐺 Ma sói đã cắn chết ${targetName}.`]);

    if (config.roles.SEER > 0) {
      setStage("SEER_TURN");
    } else if (config.roles.WITCH > 0) {
      setStage("WITCH_TURN");
    } else {
      resolveNightData();
    }
  };

  const handleSeerSelection = (targetId: string) => {
    soundManager.playSuccess();
    setSeerTarget(targetId);
    
    const target = players.find(p => p.id === targetId);
    const isWolf = target?.role === "WEREWOLF";
    
    // Alert moderator
    alert(`Tiên Tri soi vai trò của ${target?.name}: \n-> ${isWolf ? "Là MA SÓI! 🐺" : "Là DÂN THƯỜNG / CHỨC NĂNG! 🧑‍🌾"}`);
    
    setLogs(prev => [...prev, `🔮 Tiên tri đã soi vai trò của ${target?.name}.`]);

    if (config.roles.WITCH > 0) {
      setStage("WITCH_TURN");
    } else {
      resolveNightData();
    }
  };

  const handleWitchSelection = (save: boolean, killId: string | null) => {
    soundManager.playSuccess();
    setWitchSave(save);
    setWitchKillTarget(killId);

    // Consume potions
    const nextPotions = { ...witchPotions };
    if (save) {
      nextPotions.save = false;
      setLogs(prev => [...prev, "🧪 Phù thủy đã dùng bình thuốc CỨU nạn nhân."]);
    }
    if (killId) {
      nextPotions.kill = false;
      const targetName = players.find(p => p.id === killId)?.name;
      setLogs(prev => [...prev, `🧪 Phù thủy dùng bình ĐỘC tiễn ${targetName} lên đường.`]);
    }
    setWitchPotions(nextPotions);

    resolveNightData();
  };

  // ==========================================
  // NIGHT RESOLUTION LOGIC
  // ==========================================
  const resolveNightData = () => {
    const deadIds: string[] = [];

    // 1. Did wolf target die?
    if (werewolfTarget) {
      // Saved by bodyguard?
      const isSavedByGuard = bodyguardTarget === werewolfTarget;
      // Saved by witch?
      const isSavedByWitch = witchSave;

      if (!isSavedByGuard && !isSavedByWitch) {
        deadIds.push(werewolfTarget);
      }
    }

    // 2. Did witch poison anyone?
    if (witchKillTarget) {
      deadIds.push(witchKillTarget);
    }

    // Deduplicate deaths
    const uniqueDeadIds = Array.from(new Set(deadIds));

    // 3. Process lover chain-reactions
    // If one lover died, the other must die too
    if (lovers.length === 2) {
      const p1 = lovers[0];
      const p2 = lovers[1];

      if (uniqueDeadIds.includes(p1) && !uniqueDeadIds.includes(p2)) {
        uniqueDeadIds.push(p2);
        setLogs(prev => [...prev, `💘 Đau lòng khôn xiết, người yêu của nạn nhân cũng qua đời.`]);
      } else if (uniqueDeadIds.includes(p2) && !uniqueDeadIds.includes(p1)) {
        uniqueDeadIds.push(p1);
        setLogs(prev => [...prev, `💘 Đau lòng khôn xiết, người yêu của nạn nhân cũng qua đời.`]);
      }
    }

    // Apply deaths to players
    let hunterDied = false;
    let hunterId = "";

    const updatedPlayers = players.map(p => {
      if (uniqueDeadIds.includes(p.id)) {
        if (p.role === "HUNTER") {
          hunterDied = true;
          hunterId = p.id;
        }
        return { ...p, isAlive: false };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    setDeadThisNight(uniqueDeadIds);

    // Save logs for who died
    if (uniqueDeadIds.length === 0) {
      setLogs(prev => [...prev, "🌅 Bình minh hé rạng! Đêm qua thật bình yên, không có ai chết cả."]);
    } else {
      const names = uniqueDeadIds.map(id => players.find(p => p.id === id)?.name).join(", ");
      setLogs(prev => [...prev, `🌅 Bình minh hé rạng! Đêm qua những người sau đã chết: ${names}.`]);
    }

    // Check game status or Hunter trigger
    setStage("DAY_ANNOUNCE");
    
    if (hunterDied && players.find(p => p.id === hunterId)?.isAlive) {
      // Only set hunter trigger if they were alive before this night
      setHunterPendingId(hunterId);
    }
  };

  // Hunter shot action
  const handleHunterShot = (targetId: string) => {
    soundManager.playSuccess();
    
    // Shoot target
    const targetName = players.find(p => p.id === targetId)?.name;
    const hunterName = players.find(p => p.id === hunterPendingId)?.name;

    const updatedPlayers = players.map(p => {
      if (p.id === targetId) {
        return { ...p, isAlive: false };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    setLogs(prev => [...prev, `🏹 Thợ Săn ${hunterName} hấp hối bắn chết ${targetName}!`]);
    setHunterPendingId(null);

    // Re-check win conditions
    checkWinConditions(updatedPlayers);
  };

  // Start discussion countdown
  const startDiscussion = () => {
    soundManager.playSuccess();
    setDiscussionTimeLeft(60);
    setIsTimerRunning(true);
    setStage("DAY_DISCUSS");
  };

  // Input voted player to hang
  const handleVoteHanging = (votedId: string | null) => {
    soundManager.playSuccess();
    
    let updatedPlayers = [...players];
    let hunterDied = false;
    let hunterId = "";

    if (votedId) {
      const target = players.find(p => p.id === votedId);
      updatedPlayers = players.map(p => {
        if (p.id === votedId) {
          if (p.role === "HUNTER") {
            hunterDied = true;
            hunterId = p.id;
          }
          return { ...p, isAlive: false };
        }
        return p;
      });

      setPlayers(updatedPlayers);
      setLogs(prev => [...prev, `⚖️ Cư dân bỏ phiếu treo cổ ${target?.name}!`]);

      // Check lover chain deaths
      if (lovers.length === 2 && lovers.includes(votedId)) {
        const otherLoverId = lovers.find(id => id !== votedId)!;
        updatedPlayers = updatedPlayers.map(p => {
          if (p.id === otherLoverId) {
            if (p.role === "HUNTER") {
              hunterDied = true;
              hunterId = p.id;
            }
            return { ...p, isAlive: false };
          }
          return p;
        });
        setPlayers(updatedPlayers);
        const otherLoverName = players.find(p => p.id === otherLoverId)?.name;
        setLogs(prev => [...prev, `💘 Đau xót cho tình nhân bị treo cổ, ${otherLoverName} cũng quyên sinh theo.`]);
      }
    } else {
      setLogs(prev => [...prev, "⚖️ Cư dân nhất trí bỏ qua việc biểu quyết treo cổ ngày hôm nay."]);
    }

    if (hunterDied) {
      setHunterPendingId(hunterId);
      setStage("HUNTER_SHOT_TURN");
    } else {
      // Check win conditions or start next night
      const nextGameFinished = checkWinConditions(updatedPlayers);
      if (!nextGameFinished) {
        // Reset night choices
        setBodyguardTarget(null);
        setWerewolfTarget(null);
        setSeerTarget(null);
        setWitchSave(false);
        setWitchKillTarget(null);
        setDeadThisNight([]);
        
        // Go to next night
        setNightNumber(prev => prev + 1);
        setStage("NIGHT_START");
        setLogs(prev => [...prev, `🌃 Đêm thứ ${nightNumber + 1} sương mù giăng lối... Mọi người nhắm mắt ngủ.`]);
      }
    }
  };

  // Check Game Winner
  const checkWinConditions = (currentPlayers: Player[]): boolean => {
    const aliveList = currentPlayers.filter(p => p.isAlive);
    const aliveWolves = aliveList.filter(p => p.role === "WEREWOLF");
    const aliveVillagers = aliveList.filter(p => p.role !== "WEREWOLF");

    // Cupid Lover Neutral Side checking:
    // If the only survivors are the Cupid lovers, and one is wolf and one is good, they win together!
    const aliveLovers = aliveList.filter(p => lovers.includes(p.id));
    const isLoversNeutralWin = 
      lovers.length === 2 && 
      aliveList.length === 2 && 
      aliveLovers.length === 2 &&
      (players.find(p => p.id === lovers[0])?.role === "WEREWOLF") !== (players.find(p => p.id === lovers[1])?.role === "WEREWOLF");

    if (isLoversNeutralWin) {
      onGameOver("LOVERS", currentPlayers);
      return true;
    }

    // Standard Werewolf Victory: Sói đông bằng hoặc hơn người thường
    if (aliveWolves.length >= aliveVillagers.length) {
      onGameOver("WEREWOLVES", currentPlayers);
      return true;
    }

    // Villager Victory: Sói chết sạch
    if (aliveWolves.length === 0) {
      onGameOver("VILLAGERS", currentPlayers);
      return true;
    }

    return false;
  };

  const wrapWithLayout = (stageContent: React.ReactNode) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
        {/* Top Header Bar */}
        <div className="glass-panel max-width-container" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderRadius: "16px"
        }}>
          <button
            onClick={onQuit}
            className="btn btn-outline"
            style={{
              height: "32px",
              padding: "0 12px",
              fontSize: "0.8rem",
              borderColor: "rgba(244,63,94,0.3)",
              color: "#fda4af"
            }}
          >
            Thoát
          </button>
          <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#ffffff", letterSpacing: "1px" }}>
            QUẢN TRÒ MA SÓI 🐺
          </span>
          <span style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "var(--text-secondary)",
            background: "rgba(255,255,255,0.05)",
            padding: "2px 8px",
            borderRadius: "10px"
          }}>
            {stage === "ROLE_REVEAL" ? "Nhận vai" : `Đêm thứ ${nightNumber}`}
          </span>
        </div>

        {/* Main Stage Content */}
        {stageContent}

        {/* Moderator Event Logs */}
        {stage !== "ROLE_REVEAL" && (
          <div className="glass-panel max-width-container text-left" style={{ padding: "16px", borderRadius: "16px" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", color: "#a78bfa", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              📋 Nhật ký sự kiện
            </h4>
            <div style={{
              maxHeight: "120px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "0.8rem",
              color: "var(--text-secondary)"
            }}>
              {logs.slice().reverse().map((log, index) => (
                <div key={index} style={{
                  padding: "6px 10px",
                  background: "rgba(255, 255, 255, 0.01)",
                  borderLeft: "3.5px solid #8b5cf6",
                  borderRadius: "0 8px 8px 0"
                }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 1. Role Distribution Reveal Pass & Play
  if (stage === "ROLE_REVEAL") {
    if (!activeRevealPlayer) return null;

    return wrapWithLayout(
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "30px 20px" }}>
        <h3 style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>PHÂN VAI TRÒ ({revealIndex + 1}/{players.length})</h3>
        
        <div style={{ margin: "24px 0" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(139, 92, 246, 0.1)", border: "2px solid rgba(139, 92, 246, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Users size={36} style={{ color: "#a78bfa" }} />
          </div>
          <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)" }}>Hãy chuyển thiết bị cho:</p>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#ffffff", margin: "8px 0" }}>{activeRevealPlayer.name}</h2>
        </div>

        {!showRoleCard ? (
          <button
            onClick={() => {
              soundManager.playSuccess();
              setShowRoleCard(true);
            }}
            className="btn btn-primary btn-block"
            style={{ height: "48px", background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", borderColor: "#6d28d9" }}
          >
            NHẤP VÀO ĐỂ XEM VAI TRÒ
          </button>
        ) : (
          <div className="animated-bounce-in" style={{
            background: "#18181b",
            border: `3px solid ${getRoleBadgeColor(activeRevealPlayer.role)}`,
            borderRadius: "20px",
            padding: "24px",
            marginTop: "16px",
            boxShadow: `0 0 20px ${getRoleBadgeColor(activeRevealPlayer.role)}40`,
            textAlign: "center"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "8px" }}>
              {WEREWOLF_ROLES[activeRevealPlayer.role]?.emoji}
            </div>
            <h3 style={{ fontSize: "1.5rem", color: "#ffffff", fontWeight: 800, margin: "4px 0" }}>
              {WEREWOLF_ROLES[activeRevealPlayer.role]?.name}
            </h3>
            <span style={{
              fontSize: "0.75rem",
              background: `${getRoleBadgeColor(activeRevealPlayer.role)}20`,
              color: getRoleBadgeColor(activeRevealPlayer.role),
              border: `1px solid ${getRoleBadgeColor(activeRevealPlayer.role)}50`,
              padding: "2px 10px",
              borderRadius: "12px",
              fontWeight: 700,
              display: "inline-block",
              marginBottom: "16px"
            }}>
              {WEREWOLF_ROLES[activeRevealPlayer.role]?.side === "WEREWOLF" ? "PHE MA SÓI" : "PHE DÂN LÀNG"}
            </span>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5", margin: "0 0 20px 0" }}>
              {WEREWOLF_ROLES[activeRevealPlayer.role]?.description}
            </p>

            <button
              onClick={handleRevealConfirm}
              className="btn btn-block"
              style={{
                height: "42px",
                background: getRoleBadgeColor(activeRevealPlayer.role),
                borderColor: "transparent",
                color: "#ffffff",
                fontWeight: 700
              }}
            >
              ĐÃ HIỂU, ĐÓNG THẺ BÀI
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. Night start
  if (stage === "NIGHT_START") {
    return wrapWithLayout(
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "30px 20px", background: "linear-gradient(135deg, #09090b 0%, #1e1b4b 100%)" }}>
        <div style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: "rgba(99,102,241,0.06)",
          border: "2px solid rgba(99,102,241,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          color: "#818cf8"
        }}>
          <Moon size={42} className="animate-pulse" />
        </div>
        <span style={{ fontSize: "0.8rem", color: "#818cf8", fontWeight: 700, letterSpacing: "2px" }}>BẮT ĐẦU ĐÊM THỨ {nightNumber}</span>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>QUẢN TRÒ CẦM MÁY</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "8px 0 24px 0", lineHeight: "1.4" }}>
          Tất cả người chơi vui lòng nhắm mắt ngủ yên. Một người được cử làm Quản trò sẽ điều hành đêm hôm nay dựa vào các bước gợi ý của ứng dụng.
        </p>

        <button
          onClick={startNight}
          className="btn btn-primary btn-block"
          style={{ height: "48px", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", borderColor: "#4f46e5" }}
        >
          TIẾN VÀO ĐÊM TỐI <ArrowRight size={18} style={{ marginLeft: "6px", display: "inline" }} />
        </button>
      </div>
    );
  }

  // 3. Cupid selection
  if (stage === "CUPID_TURN") {
    const handleCupidClick = (id: string) => {
      if (cupidLover1 === id) {
        setCupidLover1(null);
      } else if (!cupidLover1) {
        setCupidLover1(id);
      } else if (!cupidLover2) {
        handleCupidSelection(cupidLover1, id);
      }
    };

    return wrapWithLayout(
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", color: "#f472b6", marginBottom: "8px" }}>
          <UserCheck size={20} />
          <span style={{ fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase" }}>LƯỢT THẦN TÌNH YÊU</span>
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", margin: "4px 0" }}>Chọn 2 người ghép đôi yêu nhau</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          Quản trò gọi: "Thần tình yêu thức giấc, chọn hai người kết đôi lứa". Sau đó chạm chọn 2 người chơi trên màn hình.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {players.map(p => (
            <button
              key={p.id}
              onClick={() => handleCupidClick(p.id)}
              className="btn btn-outline"
              style={{
                height: "44px",
                fontSize: "0.85rem",
                color: (cupidLover1 === p.id || cupidLover2 === p.id) ? "#ffffff" : "var(--text-secondary)",
                background: (cupidLover1 === p.id || cupidLover2 === p.id) ? "#f472b6" : "rgba(255,255,255,0.02)",
                borderColor: (cupidLover1 === p.id || cupidLover2 === p.id) ? "#f472b6" : "rgba(255,255,255,0.06)",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 4. Bodyguard selection
  if (stage === "BODYGUARD_TURN") {
    return wrapWithLayout(
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", color: "#34d399", marginBottom: "8px" }}>
          <Shield size={20} />
          <span style={{ fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase" }}>LƯỢT BẢO VỆ</span>
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", margin: "4px 0" }}>Chọn 1 mục tiêu bảo vệ</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          Quản trò gọi: "Bảo vệ thức giấc, chọn người muốn bảo vệ". Người chơi làm Bảo vệ chỉ tay vào mục tiêu.
          *(Không được chọn trùng người đêm trước: {lastBodyguardTarget ? players.find(p => p.id === lastBodyguardTarget)?.name : "Không có"})*
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {players.filter(p => p.isAlive).map(p => {
            const isSelectable = p.id !== lastBodyguardTarget;
            return (
              <button
                key={p.id}
                onClick={() => handleBodyguardSelection(p.id)}
                disabled={!isSelectable}
                className="btn btn-outline"
                style={{
                  height: "44px",
                  fontSize: "0.85rem",
                  borderColor: bodyguardTarget === p.id ? "#34d399" : "rgba(255,255,255,0.06)",
                  background: bodyguardTarget === p.id ? "rgba(52, 211, 153, 0.15)" : "rgba(255,255,255,0.02)",
                  opacity: isSelectable ? 1 : 0.4
                }}
              >
                {p.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handleBodyguardSelection(null)}
          className="btn btn-outline btn-block"
          style={{ height: "38px", fontSize: "0.85rem", color: "var(--text-muted)" }}
        >
          Không bảo vệ ai đêm nay
        </button>
      </div>
    );
  }

  // 5. Werewolf selection
  if (stage === "WEREWOLF_TURN") {
    return wrapWithLayout(
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", color: "#f87171", marginBottom: "8px" }}>
          <Skull size={20} />
          <span style={{ fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase" }}>LƯỢT MA SÓI</span>
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", margin: "4px 0" }}>Chọn 1 nạn nhân cắn chết</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          Quản trò gọi: "Ma sói thức giấc, chọn nạn nhân cắn đêm nay". Những người làm Ma Sói cùng mở mắt chỉ tay thống nhất nạn nhân.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {players.filter(p => p.isAlive).map(p => (
            <button
              key={p.id}
              onClick={() => handleWerewolfSelection(p.id)}
              className="btn btn-outline"
              style={{
                height: "44px",
                fontSize: "0.85rem",
                borderColor: werewolfTarget === p.id ? "#ef4444" : "rgba(255,255,255,0.06)",
                background: werewolfTarget === p.id ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.02)",
              }}
            >
              {p.name} {p.role === "WEREWOLF" && "🐺"}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 6. Seer selection
  if (stage === "SEER_TURN") {
    return wrapWithLayout(
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", color: "#c084fc", marginBottom: "8px" }}>
          <Eye size={20} />
          <span style={{ fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase" }}>LƯỢT TIÊN TRI</span>
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", margin: "4px 0" }}>Chọn 1 người muốn soi vai trò</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          Quản trò gọi: "Tiên tri thức giấc, chọn người muốn soi vai trò". Tiên tri mở mắt chọn 1 người, quản trò gật đầu báo kết quả sói (gật) hay người (lắc).
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {players.filter(p => p.isAlive).map(p => (
            <button
              key={p.id}
              onClick={() => handleSeerSelection(p.id)}
              className="btn btn-outline"
              style={{
                height: "44px",
                fontSize: "0.85rem",
                borderColor: seerTarget === p.id ? "#c084fc" : "rgba(255,255,255,0.06)",
                background: seerTarget === p.id ? "rgba(192, 132, 252, 0.15)" : "rgba(255,255,255,0.02)",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 7. Witch selection
  if (stage === "WITCH_TURN") {
    const bittenPlayer = werewolfTarget ? players.find(p => p.id === werewolfTarget) : null;
    const canSave = witchPotions.save && bittenPlayer !== null;
    const canKill = witchPotions.kill;

    const handleConfirmWitch = () => {
      handleWitchSelection(witchSave, witchKillTarget);
    };

    return wrapWithLayout(
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", color: "#fb7185", marginBottom: "8px" }}>
          <Volume2 size={20} />
          <span style={{ fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase" }}>LƯỢT PHÙ THỦY</span>
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", margin: "4px 0" }}>Báo nạn nhân & Nhận bình thuốc</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          Quản trò chỉ tay báo người bị cắn đêm nay là **{bittenPlayer ? bittenPlayer.name : "Không có ai"}**. Người làm Phù thủy quyết định hành động.
        </p>

        {/* Save Potion Section */}
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "12px", textAlign: "left" }}>
          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#ddd6fe" }}>🧪 Bình cứu sinh (Còn: {witchPotions.save ? "1" : "0"})</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {canSave ? `Cứu sống ${bittenPlayer?.name}?` : "Không thể sử dụng bình cứu sinh"}
            </span>
            <button
              onClick={() => setWitchSave(!witchSave)}
              disabled={!canSave}
              className="btn btn-outline"
              style={{
                height: "32px",
                fontSize: "0.8rem",
                padding: "0 12px",
                background: witchSave ? "#22c55e" : "transparent",
                borderColor: witchSave ? "#22c55e" : "rgba(255,255,255,0.2)",
                color: "#ffffff"
              }}
            >
              {witchSave ? "SẼ CỨU" : "KHÔNG"}
            </button>
          </div>
        </div>

        {/* Kill Potion Section */}
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "20px", textAlign: "left" }}>
          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#ddd6fe" }}>🧪 Bình độc dược (Còn: {witchPotions.kill ? "1" : "0"})</span>
          <div style={{ marginTop: "8px" }}>
            {canKill ? (
              <>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px" }}>Chọn người muốn hạ độc chết đêm nay:</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {players.filter(p => p.isAlive).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setWitchKillTarget(witchKillTarget === p.id ? null : p.id)}
                      className="btn btn-outline"
                      style={{
                        height: "34px",
                        fontSize: "0.8rem",
                        padding: 0,
                        borderColor: witchKillTarget === p.id ? "#ef4444" : "rgba(255,255,255,0.08)",
                        background: witchKillTarget === p.id ? "rgba(239, 68, 68, 0.15)" : "transparent"
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Không thể sử dụng bình độc dược</span>
            )}
          </div>
        </div>

        <button
          onClick={handleConfirmWitch}
          className="btn btn-primary btn-block"
          style={{ height: "42px", background: "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)", borderColor: "#e11d48" }}
        >
          XÁC NHẬN HÀNH ĐỘNG PHÙ THỦY
        </button>
      </div>
    );
  }

  // 8. Day Announcements
  if (stage === "DAY_ANNOUNCE") {
    return wrapWithLayout(
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "30px 20px" }}>
        <div style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: "rgba(234,179,8,0.06)",
          border: "2px solid rgba(234,179,8,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          color: "#facc15"
        }}>
          <Sun size={42} className="animate-spin-slow" />
        </div>
        <span style={{ fontSize: "0.8rem", color: "#facc15", fontWeight: 700, letterSpacing: "2px" }}>HÔM NAY TRỜI SÁNG</span>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", marginTop: "4px", marginBottom: "16px" }}>BẢN TIN BAN NGÀY</h2>

        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "16px",
          padding: "16px",
          textAlign: "left",
          marginBottom: "24px"
        }}>
          <h4 style={{ color: "#ddd6fe", margin: "0 0 10px 0", fontSize: "0.95rem" }}>Kết quả đêm qua:</h4>
          {deadThisNight.length === 0 ? (
            <div style={{ color: "#86efac", fontSize: "0.85rem", fontWeight: 600 }}>
              🌿 Đêm qua thật yên bình, không ai chết cả! Cư dân bảo toàn số lượng.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "0.85rem", color: "#fda4af", margin: 0 }}>Có {deadThisNight.length} người chơi đã qua đời:</p>
              {deadThisNight.map(id => {
                const p = players.find(x => x.id === id);
                return (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "10px" }}>
                    <span style={{ fontWeight: 700, color: "#ffffff" }}>💀 {p?.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "#fda4af" }}>Vai trò: {WEREWOLF_ROLES[p?.role || "VILLAGER"].name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hunterPendingId ? (
          <div className="animated-bounce-in" style={{
            background: "rgba(234, 179, 8, 0.15)",
            border: "1.5px solid #eab308",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "20px",
            color: "#fef08a"
          }}>
            <h4 style={{ margin: "0 0 6px 0" }}>🏹 THỢ SĂN BỊ TIÊU DIỆT!</h4>
            <p style={{ fontSize: "0.8rem", margin: 0 }}>
              Thợ Săn <b>{players.find(p => p.id === hunterPendingId)?.name}</b> đã qua đời. Nhấn nút để kích hoạt phát súng hấp hối.
            </p>
            <button
              onClick={() => setStage("HUNTER_SHOT_TURN")}
              className="btn btn-primary btn-block"
              style={{ marginTop: "12px", background: "#eab308", borderColor: "#d97706", height: "36px", fontSize: "0.85rem", color: "#1e1b4b" }}
            >
              KÍCH HOẠT SÚNG BẮN
            </button>
          </div>
        ) : (
          <button
            onClick={startDiscussion}
            className="btn btn-primary btn-block"
            style={{ height: "48px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", borderColor: "#d97706" }}
          >
            BẮT ĐẦU THẢO LUẬN
          </button>
        )}
      </div>
    );
  }

  // 9. Hunter shot turn
  if (stage === "HUNTER_SHOT_TURN") {
    const hunterName = players.find(p => p.id === hunterPendingId)?.name;
    return wrapWithLayout(
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", color: "#facc15", marginBottom: "8px" }}>
          <AlertTriangle size={20} />
          <span style={{ fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase" }}>SÚNG THỢ SĂN KÍCH HOẠT</span>
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", margin: "4px 0" }}>{hunterName} nổ súng kéo theo ai?</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          Người chơi làm Thợ Săn chỉ tay bắn chết 1 người khác. Nhấp chọn mục tiêu đó bên dưới:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {players.filter(p => p.isAlive && p.id !== hunterPendingId).map(p => (
            <button
              key={p.id}
              onClick={() => handleHunterShot(p.id)}
              className="btn btn-outline"
              style={{
                height: "44px",
                fontSize: "0.85rem",
                borderColor: "#facc15"
              }}
            >
              🎯 {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 10. Day Discussion countdown
  if (stage === "DAY_DISCUSS") {
    return wrapWithLayout(
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "30px 20px" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Đồng hồ thảo luận dân làng
        </span>
        
        <div style={{
          fontSize: "4rem",
          fontWeight: 900,
          color: discussionTimeLeft < 15 ? "#ef4444" : "#ffffff",
          margin: "12px 0 24px",
          fontVariantNumeric: "stacked-fractions",
          fontFamily: "monospace"
        }} className={isTimerRunning ? "animate-pulse" : ""}>
          {Math.floor(discussionTimeLeft / 60)}:{(discussionTimeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "28px" }}>
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="btn btn-outline"
            style={{ flex: 1, height: "40px" }}
          >
            {isTimerRunning ? "TẠM DỪNG" : "BẮT ĐẦU"}
          </button>
          <button
            onClick={() => setDiscussionTimeLeft(60)}
            className="btn btn-outline"
            style={{ flex: 1, height: "40px" }}
          >
            ĐẶT LẠI 1P
          </button>
        </div>

        <button
          onClick={() => {
            soundManager.playSuccess();
            setIsTimerRunning(false);
            setStage("DAY_VOTE");
          }}
          className="btn btn-primary btn-block"
          style={{ height: "48px", background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", borderColor: "#8b5cf6" }}
        >
          TIẾN TỚI BIỂU QUYẾT TREO CỔ
        </button>
      </div>
    );
  }

  // 11. Day Vote (Moderator inputs hanging selection)
  if (stage === "DAY_VOTE") {
    return wrapWithLayout(
      <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", color: "#a78bfa", marginBottom: "8px" }}>
          <UserCheck size={20} />
          <span style={{ fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase" }}>BIỂU QUYẾT TREO CỔ</span>
        </div>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", margin: "4px 0" }}>Chọn người bị treo cổ hôm nay</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          Biểu quyết công khai. Nhấp chọn người có số phiếu biểu quyết cao nhất để treo cổ, hoặc chọn bỏ qua.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {players.filter(p => p.isAlive).map(p => (
            <button
              key={p.id}
              onClick={() => handleVoteHanging(p.id)}
              className="btn btn-outline"
              style={{
                height: "44px",
                fontSize: "0.85rem",
                borderColor: "#a78bfa"
              }}
            >
              💀 {p.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleVoteHanging(null)}
          className="btn btn-outline btn-block"
          style={{ height: "44px", fontSize: "0.85rem", color: "#a7f3d0", borderColor: "rgba(16,185,129,0.3)" }}
        >
          🕊️ Không treo cổ ai hôm nay
        </button>
      </div>
    );
  }

  return null;
};
