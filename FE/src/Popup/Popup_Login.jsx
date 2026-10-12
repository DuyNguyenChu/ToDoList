import { useState } from "react";
import { login } from "../API/API_Authen";
import "./Style/Popup_Login.css";

const Popup_Login = ({ onClose, onSwitchToRegister, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (username && password) {
      setLoading(true);
      try {
        const response = await login({
          emailPhone: username,
          password: password,
        });

        if (response.status === 200) {
          const user = {
            id: response.data.userId,
            name: response.data.userName,
            role: response.data.role,
            token: response.data.token,
          };
          localStorage.setItem("user", JSON.stringify(user));
          if (onLoginSuccess) {
            onLoginSuccess(user);
          } else if (onClose) {
            onClose();
          }
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError("Vui lòng nhập tài khoản và mật khẩu");
    }
  };

  return (
    <div className="popup-login-overlay" onClick={onClose}>
      <div
        className="popup-login-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-header-row">
          <h2>Đăng Nhập</h2>
          {onClose && (
            <button type="button" className="popup-close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Tài khoản</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập email hoặc số điện thoại..."
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
            />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="auth-link">
          <span>Chưa có tài khoản? </span>
          {onSwitchToRegister ? (
            <button
              type="button"
              className="btn-switch-auth"
              onClick={onSwitchToRegister}
            >
              Đăng ký ngay
            </button>
          ) : (
            <a href="#register">Đăng ký ngay</a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup_Login;
