import React, { useState, useEffect } from "react";
import { Settings, Key, HelpCircle, ArrowLeft, Database } from "lucide-react";
import { soundManager } from "../../utils/SoundManager";
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  forceReloadFirebaseDb,
  createRoom,
  joinRoom
} from "../../utils/firebase";
import type { FirebaseConfig } from "../../utils/firebase";

const IS_ENV_CONFIGURED = !!(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_DATABASE_URL);

interface ExplodingSetupProps {
  onBack: () => void;
  onRoomJoined: (roomCode: string, playerId: string, playerName: string) => void;
}

export const ExplodingSetup: React.FC<ExplodingSetupProps> = ({ onBack, onRoomJoined }) => {
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem("lucid_bose_player_name") || "";
  });
  const [roomCode, setRoomCode] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  
  // Firebase configuration state
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>({
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  });
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState<boolean>(false);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Generate or retrieve persistent playerId
  useEffect(() => {
    let pid = localStorage.getItem("lucid_bose_player_id");
    if (!pid) {
      pid = `p-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("lucid_bose_player_id", pid);
    }
    setPlayerId(pid);

    if (IS_ENV_CONFIGURED) {
      setIsFirebaseConfigured(true);
    } else {
      const savedConfig = getSavedFirebaseConfig();
      if (savedConfig) {
        setFirebaseConfig(savedConfig);
        setIsFirebaseConfigured(true);
      }
    }
  }, []);

  const handleSaveConfig = () => {
    if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
      alert("Vui lòng nhập ít nhất API Key và Database URL!");
      return;
    }
    saveFirebaseConfig(firebaseConfig);
    const success = forceReloadFirebaseDb();
    if (success) {
      setIsFirebaseConfigured(true);
      setShowConfigModal(false);
      soundManager.playSuccess();
    } else {
      alert("Cấu hình máy chủ không hợp lệ hoặc lỗi kết nối!");
    }
  };

  const handleClearConfig = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cấu hình kết nối hiện tại?")) {
      clearFirebaseConfig();
      setFirebaseConfig({
        apiKey: "",
        authDomain: "",
        databaseURL: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
      });
      setIsFirebaseConfigured(false);
      forceReloadFirebaseDb();
    }
  };

  const generateRoomCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setErrorMessage("Vui lòng nhập tên của bạn trước!");
      return;
    }
    if (!isFirebaseConfigured) {
      setErrorMessage("Vui lòng nhấp vào biểu tượng bánh răng ⚙️ để cấu hình máy chủ trước!");
      setShowConfigModal(true);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    soundManager.playSuccess();

    try {
      const code = generateRoomCode();
      localStorage.setItem("lucid_bose_player_name", playerName.trim());
      const success = await createRoom(code, playerId, playerName.trim());
      if (success) {
        onRoomJoined(code, playerId, playerName.trim());
      } else {
        setErrorMessage("Lỗi khi tạo phòng chơi. Hãy kiểm tra lại cấu hình kết nối máy chủ.");
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Không thể kết nối đến máy chủ trực tuyến!");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setErrorMessage("Vui lòng nhập tên của bạn trước!");
      return;
    }
    if (!roomCode.trim() || roomCode.trim().length !== 4) {
      setErrorMessage("Vui lòng nhập mã phòng gồm 4 ký tự!");
      return;
    }
    if (!isFirebaseConfigured) {
      setErrorMessage("Vui lòng nhấp vào biểu tượng bánh răng ⚙️ để cấu hình máy chủ trước!");
      setShowConfigModal(true);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    soundManager.playSuccess();

    const formattedCode = roomCode.trim().toUpperCase();
    try {
      localStorage.setItem("lucid_bose_player_name", playerName.trim());
      const result = await joinRoom(formattedCode, playerId, playerName.trim());
      if (result.success) {
        onRoomJoined(formattedCode, playerId, playerName.trim());
      } else {
        setErrorMessage(result.message);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Có lỗi xảy ra khi kết nối. Hãy kiểm tra cấu hình máy chủ hoặc mã phòng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel max-width-container animated-slide-in text-center" style={{ padding: "30px 20px" }}>
      {/* HEADER */}
      <div className="setup-header">
        <button onClick={onBack} className="btn-icon" title="Quay lại">
          <ArrowLeft size={20} />
        </button>
        <h2 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>
          MÈO NỔ (Multiplayer)
        </h2>
        {IS_ENV_CONFIGURED ? (
          <div style={{ width: "42px" }} />
        ) : (
          <button
            onClick={() => {
              soundManager.playSuccess();
              setShowConfigModal(true);
            }}
            className="btn-icon"
            style={{ borderColor: isFirebaseConfigured ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.4)" }}
            title="Cấu hình Máy chủ"
          >
            <Settings size={20} style={{ color: isFirebaseConfigured ? "var(--color-emerald)" : "var(--color-danger)" }} />
          </button>
        )}
      </div>

      {!IS_ENV_CONFIGURED && (
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
          <span className="badge-new" style={{
            background: isFirebaseConfigured ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
            color: isFirebaseConfigured ? "#34d399" : "#fb7185",
            fontSize: "0.8rem",
            padding: "4px 12px",
            borderRadius: "20px",
            border: `1px solid ${isFirebaseConfigured ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <Database size={14} />
            {isFirebaseConfigured ? "Máy chủ: Đã kết nối" : "Máy chủ: Chưa cấu hình"}
          </span>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div style={{
          background: "rgba(244, 63, 94, 0.1)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          color: "#fda4af",
          padding: "12px",
          borderRadius: "14px",
          marginBottom: "20px",
          fontSize: "0.85rem",
          textAlign: "left"
        }}>
          {errorMessage}
        </div>
      )}

      {/* MAIN FORM */}
      <div className="setup-form">
        <div className="form-group">
          <label className="input-label">Tên của bạn:</label>
          <input
            type="text"
            className="text-input"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Nhập biệt danh..."
            maxLength={15}
            disabled={loading}
          />
        </div>

        <div style={{ margin: "10px 0", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }} />

        {/* HOST GAME */}
        <button
          onClick={handleCreateRoom}
          disabled={loading}
          className="btn btn-primary btn-block"
          style={{ height: "54px" }}
        >
          {loading ? "Đang xử lý..." : "TẠO PHÒNG CHƠI MỚI"}
        </button>

        <div style={{ margin: "8px 0", color: "#71717a", fontSize: "0.85rem" }}>— HOẶC THAM GIA PHÒNG —</div>

        {/* JOIN GAME */}
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            className="text-input"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="MÃ PHÒNG (4 chữ cái)"
            maxLength={4}
            disabled={loading}
            style={{ flex: 1, textTransform: "uppercase", textAlign: "center", letterSpacing: "2px", fontWeight: "bold" }}
          />
          <button
            onClick={handleJoinRoom}
            disabled={loading}
            className="btn btn-secondary"
            style={{ width: "120px" }}
          >
            VÀO
          </button>
        </div>
      </div>

      <div className="help-box" style={{ marginTop: "32px", fontSize: "0.8rem" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "6px" }}><HelpCircle size={16} /> Cách hoạt động</h3>
        <p style={{ color: "#a1a1aa", lineHeight: "1.4" }}>
          Mèo Nổ Multiplayer chạy trực tiếp trên thiết bị của các bạn qua kết nối máy chủ trực tuyến. Để chơi chung, 1 người tạo phòng và gửi mã 4 chữ cái cho những người khác nhập để cùng vào lobby.
        </p>
      </div>

      {/* CONFIG MODAL */}
      {showConfigModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "420px",
            background: "#09090b",
            border: "1px solid rgba(255,255,255,0.15)",
            padding: "24px",
            maxHeight: "90vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Key size={18} /> Cấu hình Máy chủ Kết nối
              </h3>
              <button
                onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#a78bfa",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  textDecoration: "underline"
                }}
              >
                {showFirebaseGuide ? "Ẩn Hướng Dẫn" : "Xem Hướng Dẫn"}
              </button>
            </div>

            {showFirebaseGuide && (
              <div style={{
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "0.78rem",
                textAlign: "left",
                lineHeight: "1.45",
                color: "#cbd5e1"
              }}>
                <ol style={{ paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <li>Truy cập <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" style={{ color: "#818cf8" }}>Firebase Console</a> (miễn phí).</li>
                  <li>Tạo dự án mới (bỏ qua Google Analytics).</li>
                  <li>Nhấn icon Web <b>(&lt;/&gt;)</b> ở dashboard để đăng ký app và lấy config object.</li>
                  <li>Tạo <b>Realtime Database</b> trong menu trái (chọn vị trí gần bạn, ví dụ Singapore).</li>
                  <li>Tại tab <b>Rules</b> của Database, đặt: <code style={{ color: "#fda4af" }}>{`".read": true, ".write": true`}</code> để cho phép chơi game không cần login.</li>
                  <li>Copy <b>databaseURL</b> và <b>apiKey</b> dán vào bên dưới.</li>
                </ol>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "4px", display: "block" }}>API Key *</label>
                <input
                  type="text"
                  className="text-input"
                  style={{ height: "38px", fontSize: "0.85rem" }}
                  value={firebaseConfig.apiKey}
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="AIzaSy..."
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "4px", display: "block" }}>Database URL *</label>
                <input
                  type="text"
                  className="text-input"
                  style={{ height: "38px", fontSize: "0.85rem" }}
                  value={firebaseConfig.databaseURL}
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, databaseURL: e.target.value }))}
                  placeholder="https://your-app-default-rtdb.firebaseio.com"
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "4px", display: "block" }}>Project ID</label>
                <input
                  type="text"
                  className="text-input"
                  style={{ height: "38px", fontSize: "0.85rem" }}
                  value={firebaseConfig.projectId}
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, projectId: e.target.value }))}
                  placeholder="your-app-id"
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "4px", display: "block" }}>App ID</label>
                <input
                  type="text"
                  className="text-input"
                  style={{ height: "38px", fontSize: "0.85rem" }}
                  value={firebaseConfig.appId}
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, appId: e.target.value }))}
                  placeholder="1:12345:web:abcdef"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              {isFirebaseConfigured && (
                <button
                  onClick={handleClearConfig}
                  className="btn btn-outline"
                  style={{ flex: 1, height: "42px", fontSize: "0.9rem" }}
                >
                  Xóa
                </button>
              )}
              <button
                onClick={() => setShowConfigModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, height: "42px", fontSize: "0.9rem" }}
              >
                Đóng
              </button>
              <button
                onClick={handleSaveConfig}
                className="btn btn-primary"
                style={{ flex: 1, height: "42px", fontSize: "0.9rem" }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
