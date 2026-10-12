import "./Style/Popup_UserAccountDetail.css";

const Popup_UserAccountDetail = ({ user, onClose, isOnline }) => {
  if (!user) return null;

  const formatGender = (genderVal) => {
    if (genderVal === true || genderVal === "true") return "Nam";
    if (genderVal === false || genderVal === "false") return "Nữ";
    return "Chưa cập nhật";
  };

  const formatRoleName = (role) => {
    if (!role) return "Người dùng";
    const lower = String(role).trim().toLowerCase();
    if (lower === "admin") return "Quản trị viên";
    if (lower === "user") return "Người dùng";
    return role;
  };

  const formatGps = (lat, lng) => {
    if (lat != null && lng != null && lat !== "" && lng !== "") {
      return `${lat}, ${lng}`;
    }
    return null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const gpsCoordinates = formatGps(
    user.userAddressInGpsLatitude ?? user.userAddressInGpslatitude,
    user.userAddressInGpsLongitude ?? user.userAddressInGpslongitude,
  );

  const isUserOnline = isOnline ?? user.isOnline ?? user.IsOnline ?? false;
  const isAdmin = user.roleName?.toLowerCase() === "admin";

  return (
    <div className="popup-user-info-overlay" onClick={onClose}>
      <div
        className="popup-user-info-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-user-info-card">
          <div className="popup-card-header">
            <div className="popup-card-header-title">
              <span className="popup-card-header-icon">👤</span>
              <h2>Thông tin tài khoản</h2>
            </div>
            <button
              type="button"
              className="popup-card-close-btn"
              onClick={onClose}
              title="Đóng"
            >
              ✕
            </button>
          </div>

          <div className="popup-card-body">
            <div className="popup-avatar-role-section">
              <div className="popup-avatar-wrapper">
                {user.userImg ? (
                  <img
                    src={user.userImg}
                    alt={user.userName}
                    className="popup-user-avatar-img"
                  />
                ) : (
                  <div className="popup-avatar-placeholder">
                    {user.userName
                      ? user.userName.charAt(0).toUpperCase()
                      : "👤"}
                  </div>
                )}
              </div>

              <div className="popup-avatar-meta-info">
                <div className="popup-user-display-name">{user.userName}</div>
                <div className="popup-role-badge-wrapper">
                  <span className="popup-role-label">Vai trò:</span>
                  <span
                    className={`popup-role-badge ${isAdmin ? "admin" : "user"}`}
                  >
                    {formatRoleName(user.roleName)}
                  </span>
                  <span
                    className={`popup-status-badge ${
                      isUserOnline ? "online" : "offline"
                    }`}
                  >
                    <span className="status-dot-indicator" />
                    {isUserOnline ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="popup-role-validity-info">
                  <span className="validity-label">Thời hạn:</span>
                  {user.userRoleEndDate ? (
                    <span
                      className={`validity-tag ${
                        new Date(user.userRoleEndDate) < new Date()
                          ? "expired"
                          : "temporary"
                      }`}
                    >
                      {new Date(user.userRoleEndDate) < new Date()
                        ? `⚠️ Đã hết hạn (${formatDate(user.userRoleStartDate)} - ${formatDate(user.userRoleEndDate)})`
                        : `⏳ Có thời hạn (từ ${formatDate(user.userRoleStartDate)} đến ${formatDate(user.userRoleEndDate)})`}
                    </span>
                  ) : (
                    <span className="validity-tag permanent">
                      ♾️ Vĩnh viễn (Không thời hạn)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="popup-form-grid">
              <div className="popup-form-group">
                <label>Họ và tên</label>
                <div className="popup-readonly-field">
                  {user.userName || "—"}
                </div>
              </div>

              <div className="popup-form-group">
                <label>Giới tính</label>
                <div className="popup-readonly-field">
                  {formatGender(user.userGender)}
                </div>
              </div>

              <div className="popup-form-group">
                <label>
                  Email <span className="required-star">*</span>
                </label>
                <div className="popup-readonly-field">
                  {user.userEmail ? (
                    <a
                      href={`mailto:${user.userEmail}`}
                      className="popup-link"
                      title="Gửi email"
                    >
                      {user.userEmail}
                    </a>
                  ) : (
                    <span className="empty-text">Chưa cập nhật</span>
                  )}
                </div>
              </div>

              <div className="popup-form-group">
                <label>Số điện thoại</label>
                <div className="popup-readonly-field">
                  {user.userPhone ? (
                    <a
                      href={`tel:${user.userPhone}`}
                      className="popup-link"
                      title="Gọi điện"
                    >
                      {user.userPhone}
                    </a>
                  ) : (
                    <span className="empty-text">Chưa cập nhật</span>
                  )}
                </div>
              </div>

              <div className="popup-form-group full-width">
                <label>Địa chỉ</label>
                <div className="popup-readonly-field">
                  {user.userAddressInText || "Chưa cập nhật"}
                </div>
              </div>

              <div className="popup-form-group full-width">
                <div className="popup-gps-header">
                  <label>Tọa Độ GPS</label>
                  {gpsCoordinates && (
                    <a
                      href={`https://www.google.com/maps?q=${gpsCoordinates}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="popup-btn-get-location"
                    >
                      Xem trên Google Maps ↗
                    </a>
                  )}
                </div>
                <div className="popup-readonly-field">
                  {gpsCoordinates ? (
                    <span className="gps-coordinate-val">
                      📍 {gpsCoordinates}
                    </span>
                  ) : (
                    <span className="empty-text">Chưa cập nhật tọa độ</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="popup-card-footer">
            <button
              type="button"
              className="popup-btn-close-action"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup_UserAccountDetail;
