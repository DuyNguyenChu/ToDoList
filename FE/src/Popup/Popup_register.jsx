import { useState } from "react";
import { register } from "../API/API_Authen";
import "./Style/Popup_register.css";

const Popup_register = ({ onClose, onSwitchToLogin }) => {
  const [Name, setUserName] = useState("");
  const [Email, setUserEmail] = useState("");
  const [Phone, setUserPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!Name || !password || (!Email && !Phone)) {
      setError(
        "Vui lòng nhập tên người dùng, mật khẩu, và (email hoặc số điện thoại)",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await register({
        userName: Name,
        userEmail: Email,
        userPhone: Phone,
        password: password,
      });

      if (response.status === 200) {
        setSuccess(
          "Đăng ký thành công! Đang chuyển sang màn hình Đăng nhập...",
        );
        setTimeout(() => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          } else if (onClose) {
            onClose();
          }
        }, 1500);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-register-overlay" onClick={onClose}>
      <div
        className="popup-register-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-header-row">
          <h2>Đăng Ký</h2>
          {onClose && (
            <button type="button" className="popup-close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Tên người dùng</label>
            <input
              type="text"
              value={Name}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Nhập tên người dùng..."
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={Email}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Nhập email..."
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              value={Phone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="Nhập số điện thoại..."
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
          <button
            type="submit"
            className="btn-register"
            disabled={loading || !!success}
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <div className="auth-link">
          <span>Đã có tài khoản? </span>
          {onSwitchToLogin ? (
            <button
              type="button"
              className="btn-switch-auth"
              onClick={onSwitchToLogin}
            >
              Đăng nhập ngay
            </button>
          ) : (
            <a href="#login">Đăng nhập ngay</a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup_register;
