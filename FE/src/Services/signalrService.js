import * as signalR from "@microsoft/signalr";

const API_BASE = import.meta.env.VITE_API_URL || "https://todolist-nq3a.onrender.com";
const HUB_URL = `${API_BASE.replace(/\/+$/, "")}/hub/app`;

class SignalRService {
  constructor() {
    this.connection = null;
    this.isStarting = false;
  }

  getConnection() {
    if (!this.connection) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => {
            try {
              const stored = localStorage.getItem("user");
              if (stored) {
                const parsed = JSON.parse(stored);
                return parsed?.token || "";
              }
            } catch (err) {
              console.error("Lỗi đọc token cho SignalR:", err);
            }
            return "";
          },
          withCredentials: true,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.onreconnecting((error) => {
        console.warn("[SignalR] Đang thử kết nối lại...", error);
      });

      this.connection.onreconnected((connectionId) => {
        console.log("[SignalR] Đã kết nối lại thành công, ID:", connectionId);
      });

      this.connection.onclose((error) => {
        console.warn("[SignalR] Đã ngắt kết nối:", error);
      });
    }
    return this.connection;
  }

  async start() {
    const conn = this.getConnection();
    if (conn.state === signalR.HubConnectionState.Connected) {
      return conn;
    }
    if (this.isStarting) {
      return conn;
    }

    try {
      this.isStarting = true;
      await conn.start();
      console.log("[SignalR] Kết nối thành công tới Hub!");
    } catch (err) {
      console.warn("[SignalR] Chưa thể kết nối (có thể do chưa đăng nhập hoặc token hết hạn):", err?.message || err);
    } finally {
      this.isStarting = false;
    }
    return conn;
  }

  async stop() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("[SignalR] Đã đóng kết nối.");
      } catch (err) {
        console.error("[SignalR] Lỗi đóng kết nối:", err);
      }
    }
  }

  on(eventName, callback) {
    const conn = this.getConnection();
    conn.on(eventName, callback);
    return () => {
      conn.off(eventName, callback);
    };
  }

  off(eventName, callback) {
    if (this.connection) {
      if (callback) {
        this.connection.off(eventName, callback);
      } else {
        this.connection.off(eventName);
      }
    }
  }
}

const signalrService = new SignalRService();
export default signalrService;
