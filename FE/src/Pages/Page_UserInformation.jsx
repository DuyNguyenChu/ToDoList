import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  getUserById,
  getAllUsers,
  updateCurrentUser,
  updateUser,
  changePassword,
  changePasswordById,
  updateContact,
  updateContactById,
} from "../API/API_User";
import { uploadImage } from "../API/API_Cloudinary";
import { useLocationSync } from "../Hooks/useLocationSync";
import Popup_LocationPicker from "../Popup/Popup_LocationPicker";
import "./Style/Page_UserInformation.css";

const Page_UserInformation = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const loggedInUser = outletContext?.user;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [userName, setUserName] = useState("");
  const [userImg, setUserImg] = useState("");
  const [userGender, setUserGender] = useState("null");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSuccessMsg, setInfoSuccessMsg] = useState("");

  const {
    address: userAddressInText,
    latitude,
    longitude,
    isLocating,
    isGeocoding,
    isReverseGeocoding,
    isMapOpen,
    setIsMapOpen,
    syncStatus,
    handleAddressChange,
    handleLatitudeChange,
    handleLongitudeChange,
    handleGetCurrentLocation,
    handleMapConfirm,
    setInitialValues: setLocationInitialValues,
    syncAddressFromCoords,
  } = useLocationSync({
    initialAddress: "",
    initialLat: "",
    initialLng: "",
    debounceTime: 700,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const avatarInputRef = useRef(null);

  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [contactPassword, setContactPassword] = useState("");
  const [showContactPassword, setShowContactPassword] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [contactSuccessMsg, setContactSuccessMsg] = useState("");
  const [contactErrorMsg, setContactErrorMsg] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passErrorMsg, setPassErrorMsg] = useState("");
  const [passSuccessMsg, setPassSuccessMsg] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchUserData() {
      try {
        setLoading(true);
        setErrorMsg("");

        let activeUser = loggedInUser;
        if (!activeUser) {
          try {
            const raw = localStorage.getItem("user");
            if (raw) activeUser = JSON.parse(raw);
          } catch {
            void 0;
          }
        }

        let res;
        try {
          res = await getCurrentUser(activeUser?.id);
        } catch (meErr) {
          if (activeUser?.id) {
            try {
              res = await getUserById(activeUser.id);
            } catch (idErr) {
              console.warn("Lỗi getUserById:", idErr);
            }
          }

          if (!res?.data && activeUser?.name) {
            try {
              const allRes = await getAllUsers();
              if (Array.isArray(allRes?.data)) {
                const found = allRes.data.find(
                  (u) =>
                    u.userName?.toLowerCase() === activeUser.name.toLowerCase() ||
                    u.userEmail?.toLowerCase() === activeUser.name.toLowerCase()
                );
                if (found) {
                  res = { data: found };
                  const updatedUser = { ...activeUser, id: found.userId };
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                }
              }
            } catch (allErr) {
              console.warn("Lỗi tìm kiếm user từ danh sách:", allErr);
            }
          }

          if (!res?.data) {
            throw meErr;
          }
        }

        if (!ignore && res?.data) {
          const u = res.data;
          setUserData(u);
          setUserName(u.userName || "");
          setUserImg(u.userImg || "");
          setUserGender(
            u.userGender === true
              ? "true"
              : u.userGender === false
                ? "false"
                : "null"
          );
          setLocationInitialValues({
            addr: u.userAddressInText || "",
            lat:
              u.userAddressInGpsLatitude !== undefined &&
              u.userAddressInGpsLatitude !== null
                ? String(u.userAddressInGpsLatitude)
                : "",
            lng:
              u.userAddressInGpsLongitude !== undefined &&
              u.userAddressInGpsLongitude !== null
                ? String(u.userAddressInGpsLongitude)
                : "",
          });
          setUserEmail(u.userEmail || "");
          setUserPhone(u.userPhone || "");
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin người dùng:", err);
        if (!ignore) {
          setErrorMsg(
            err.response?.data?.message ||
              "Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại!"
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchUserData();

    return () => {
      ignore = true;
    };
  }, [loggedInUser, setLocationInitialValues]);

  const handleAvatarFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh (.jpg, .jpeg, .png, .webp,...)");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadImage(file, "todolist/users");
      const url = res.data?.secureUrl || res.data?.url;
      if (url) {
        setUserImg(url);
      } else {
        alert("Không nhận được đường dẫn ảnh từ máy chủ.");
      }
    } catch (err) {
      console.error("Lỗi tải ảnh đại diện:", err);
      alert(err.response?.data?.message || "Tải ảnh đại diện thất bại!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarFile(file);
    }
    e.target.value = "";
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert("Tên người dùng không được để trống!");
      return;
    }

    setSavingInfo(true);
    setInfoSuccessMsg("");

    const updatePayload = {
      userId: userData?.userId || loggedInUser?.id,
      userImg: userImg.trim() || null,
      userName: userName.trim(),
      userGender:
        userGender === "true" ? true : userGender === "false" ? false : null,
      userAddressInText: userAddressInText.trim() || null,
      userAddressInGpsLatitude: latitude ? parseFloat(latitude) : null,
      userAddressInGpsLongitude: longitude ? parseFloat(longitude) : null,
    };

    try {
      try {
        await updateCurrentUser(updatePayload);
      } catch (err) {
        if (userData?.userId) {
          await updateUser(userData.userId, updatePayload);
        } else {
          throw err;
        }
      }

      setInfoSuccessMsg("Cập nhật thông tin cá nhân thành công!");
      setUserData((prev) => ({
        ...prev,
        ...updatePayload,
      }));

      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.name = userName.trim();
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch {
          void 0;
        }
      }

      setTimeout(() => setInfoSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Lỗi cập nhật thông tin:", err);
      alert(
        err.response?.data?.message || "Cập nhật thông tin cá nhân thất bại!"
      );
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setContactErrorMsg("");
    setContactSuccessMsg("");

    if (!contactPassword) {
      setContactErrorMsg("Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi.");
      return;
    }

    setSavingContact(true);
    const contactPayload = {
      userEmail: userEmail.trim(),
      userPhone: userPhone.trim(),
      currentPassword: contactPassword,
    };

    try {
      try {
        await updateContact(contactPayload, userData?.userId);
      } catch (err) {
        if (userData?.userId) {
          await updateContactById(userData.userId, contactPayload);
        } else {
          throw err;
        }
      }

      setContactSuccessMsg("Cập nhật thông tin liên hệ thành công!");
      setUserData((prev) => ({
        ...prev,
        userEmail: contactPayload.userEmail,
        userPhone: contactPayload.userPhone,
      }));
      setContactPassword("");
      setTimeout(() => setContactSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Lỗi cập nhật thông tin liên hệ:", err);
      setContactErrorMsg(
        err.response?.data?.message ||
          "Cập nhật thông tin liên hệ thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại!"
      );
    } finally {
      setSavingContact(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassErrorMsg("");
    setPassSuccessMsg("");

    if (!oldPassword) {
      setPassErrorMsg("Vui lòng nhập mật khẩu cũ.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPassErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassErrorMsg("Xác nhận mật khẩu mới không khớp!");
      return;
    }

    setChangingPass(true);
    const passPayload = {
      oldPassword,
      newPassword,
    };

    try {
      try {
        await changePassword(passPayload);
      } catch (err) {
        if (userData?.userId) {
          await changePasswordById(userData.userId, passPayload);
        } else {
          throw err;
        }
      }

      setPassSuccessMsg("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      setPassErrorMsg(
        err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại!"
      );
    } finally {
      setChangingPass(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="user-info-loading-container">
        <div className="user-info-spinner"></div>
        <h2>Đang tải thông tin cá nhân...</h2>
      </div>
    );
  }

  if (errorMsg && !userData) {
    return (
      <div className="user-info-error-container">
        <div className="error-card">
          <span className="error-icon">⚠️</span>
          <h3>{errorMsg}</h3>
          <p>Bạn cần đăng nhập để xem và quản lý trang thông tin cá nhân.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
            <button
              className="btn-back-home"
              style={{ background: "#4f46e5" }}
              onClick={() => window.dispatchEvent(new CustomEvent("auth:open-login"))}
            >
              Đăng nhập ngay
            </button>
            <button className="btn-back-home" onClick={() => navigate("/")}>
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-info-page">
      <div className="user-info-header-banner">
        <div className="header-banner-content">
          <h1>Hồ Sơ & Thông Tin Cá Nhân</h1>
          <p>Quản lý thông tin hồ sơ, liên hệ và cài đặt bảo mật tài khoản của bạn</p>
        </div>
      </div>

      <div className="user-info-container">
        <div className="info-card personal-info-card">
          <div className="card-header">
            <span className="card-header-icon">👤</span>
            <h2>Thông tin cá nhân</h2>
          </div>

          <form onSubmit={handleSaveInfo} className="card-body">
            <div className="avatar-role-section">
              <div
                className={`avatar-wrapper ${isDragging ? "drag-over" : ""} ${isUploading ? "uploading" : ""}`}
                onClick={() => avatarInputRef.current?.click()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer?.files?.[0];
                  if (file) handleAvatarFile(file);
                }}
                title="Bấm hoặc kéo thả ảnh để đổi ảnh đại diện"
              >
                <input
                  type="file"
                  ref={avatarInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
                {userImg ? (
                  <img
                    src={userImg}
                    alt={userName}
                    className="user-avatar-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {userName ? userName.charAt(0).toUpperCase() : "👤"}
                  </div>
                )}

                {isDragging && (
                  <div className="avatar-overlay ready">
                    <span>📥 Thả ảnh</span>
                  </div>
                )}
                {isUploading && (
                  <div className="avatar-overlay uploading">
                    <div className="avatar-spinner"></div>
                  </div>
                )}
                {!isDragging && !isUploading && (
                  <div className="avatar-hover-hint">📷 Đổi ảnh</div>
                )}
              </div>

              <div className="avatar-meta-info">
                <div className="user-display-name">
                  {userName || "Người dùng"}
                </div>
                <div className="role-badge-wrapper">
                  <span className="role-label">Vai trò:</span>
                  <span className={`role-badge ${userData?.roleName?.toLowerCase() === "admin" ? "admin" : "user"}`}>
                    {userData?.roleName?.toLowerCase() === "admin" ? "Quản trị viên" : "Người dùng"}
                  </span>
                </div>
                <div className="create-date-text">
                  📅 Ngày tạo tài khoản: <strong>{formatDate(userData?.userCreateDate)}</strong>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={savingInfo}
                  required
                />
              </div>

              <div className="form-group">
                <label>Giới tính</label>
                <select
                  value={userGender}
                  onChange={(e) => setUserGender(e.target.value)}
                  disabled={savingInfo}
                >
                  <option value="true">Nam</option>
                  <option value="false">Nữ</option>
                  <option value="null">Khác / Chưa xác định</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  placeholder="Nhập địa chỉ của bạn (số nhà, tên đường, phường/xã)..."
                  value={userAddressInText}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  disabled={savingInfo}
                />
                {isGeocoding && (
                  <div className="gps-sync-status" style={{ color: "#d97706" }}>
                    <span>⏳</span> Đang tra cứu tọa độ GPS từ địa chỉ...
                  </div>
                )}
              </div>

              <div className="form-group full-width gps-group">
                <div className="gps-header">
                  <label>Tọa Độ GPS</label>
                  <div className="gps-header-actions">
                    <button
                      type="button"
                      className="btn-get-location"
                      onClick={handleGetCurrentLocation}
                      disabled={isLocating || savingInfo}
                      title="Lấy tọa độ hiện tại từ thiết bị"
                    >
                      {isLocating ? "⏳ Đang định vị..." : "📍 Lấy vị trí hiện tại"}
                    </button>
                    <button
                      type="button"
                      className="btn-open-map"
                      onClick={() => setIsMapOpen(true)}
                      disabled={savingInfo}
                      title="Mở bản đồ OpenStreetMap để chọn vị trí"
                    >
                      🗺️ Mở bản đồ để chọn vị trí
                    </button>
                  </div>
                </div>
                <div className="gps-inputs-row">
                  <div className="gps-input-col">
                    <span className="gps-col-label">Vĩ độ:</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ví dụ: 10.762622"
                      value={latitude}
                      onChange={(e) => handleLatitudeChange(e.target.value)}
                      onBlur={() => syncAddressFromCoords(latitude, longitude)}
                      disabled={savingInfo}
                    />
                  </div>
                  <div className="gps-input-col">
                    <span className="gps-col-label">Kinh độ:</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ví dụ: 106.660172"
                      value={longitude}
                      onChange={(e) => handleLongitudeChange(e.target.value)}
                      onBlur={() => syncAddressFromCoords(latitude, longitude)}
                      disabled={savingInfo}
                    />
                  </div>
                </div>
                {(syncStatus || isReverseGeocoding) && (
                  <div className="gps-sync-status">
                    <span>{isReverseGeocoding ? "⏳" : "✓"}</span>
                    <span>
                      {isReverseGeocoding
                        ? "Đang tra cứu tên địa chỉ từ tọa độ..."
                        : syncStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {infoSuccessMsg && (
              <div className="alert-box success-alert">
                ✓ {infoSuccessMsg}
              </div>
            )}

            <div className="card-footer-action">
              <button
                type="submit"
                className="btn-submit-info"
                disabled={savingInfo || isUploading}
              >
                {savingInfo ? "Đang lưu..." : "Lưu thay đổi thông tin"}
              </button>
            </div>
          </form>
        </div>

        <div className="info-card contact-info-card">
          <div className="card-header">
            <span className="card-header-icon">📇</span>
            <h2>Thông tin liên hệ</h2>
          </div>
          <form onSubmit={handleSaveContact} className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email..."
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  disabled={savingContact}
                  required
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại..."
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  disabled={savingContact}
                />
              </div>

              <div className="form-group full-width">
                <label>Nhập mật khẩu hiện tại</label>
                <div className="password-input-wrapper">
                  <input
                    type={showContactPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu hiện tại để xác nhận..."
                    value={contactPassword}
                    onChange={(e) => setContactPassword(e.target.value)}
                    disabled={savingContact}
                    required
                  />
                  <button
                    type="button"
                    className="btn-toggle-eye"
                    onClick={() => setShowContactPassword(!showContactPassword)}
                  >
                    {showContactPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>
            </div>

            {contactErrorMsg && (
              <div className="alert-box error-alert">
                ⚠️ {contactErrorMsg}
              </div>
            )}

            {contactSuccessMsg && (
              <div className="alert-box success-alert">
                ✓ {contactSuccessMsg}
              </div>
            )}

            <div className="card-footer-action">
              <button
                type="submit"
                className="btn-submit-contact"
                disabled={savingContact}
              >
                {savingContact ? "Đang lưu..." : "Lưu thông tin liên hệ"}
              </button>
            </div>
          </form>
        </div>

        <div className="info-card password-card">
          <div className="card-header">
            <span className="card-header-icon">🔒</span>
            <h2>Đổi mật khẩu</h2>
          </div>

          <form onSubmit={handleChangePassword} className="card-body">
            <div className="password-form-grid">
              <div className="form-group">
                <label>Mật khẩu cũ *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu hiện tại..."
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={changingPass}
                    required
                  />
                  <button
                    type="button"
                    className="btn-toggle-eye"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Mật khẩu mới *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={changingPass}
                    required
                  />
                  <button
                    type="button"
                    className="btn-toggle-eye"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={changingPass}
                    required
                  />
                  <button
                    type="button"
                    className="btn-toggle-eye"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>
            </div>

            {passErrorMsg && (
              <div className="alert-box error-alert">
                ⚠️ {passErrorMsg}
              </div>
            )}

            {passSuccessMsg && (
              <div className="alert-box success-alert">
                ✓ {passSuccessMsg}
              </div>
            )}

            <div className="card-footer-action">
              <button
                type="submit"
                className="btn-submit-password"
                disabled={changingPass}
              >
                {changingPass ? "Đang đổi mật khẩu..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Popup_LocationPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleMapConfirm}
        initialLat={latitude}
        initialLng={longitude}
        initialAddress={userAddressInText}
      />
    </div>
  );
};

export default Page_UserInformation;
