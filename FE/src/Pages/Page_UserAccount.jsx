import { useState, useEffect, useMemo } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import { getAllUsers, deleteUser, updateUserRole } from "../API/API_User";
import { getAllRoles } from "../API/API_Role";
import signalrService, { useSignalREvent } from "../Hooks/useSignalR";
import { useDebounce } from "../Hooks/useDebounce";
import Popup_UserAccountDetail from "../Popup/Popup_UserAccountDetail";
import "./Style/Page_UserAccount.css";

const Page_UserAccount = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);

  const [activeMenuUserId, setActiveMenuUserId] = useState(null);
  const [rolesList, setRolesList] = useState([]);
  const [userForRoleEdit, setUserForRoleEdit] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const [roleModalError, setRoleModalError] = useState("");

  const [isPermanentRole, setIsPermanentRole] = useState(true);
  const [roleStartDate, setRoleStartDate] = useState("");
  const [roleEndDate, setRoleEndDate] = useState("");

  const [userForDelete, setUserForDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [notificationMsg, setNotificationMsg] = useState("");

  const outletContext = useOutletContext();
  const currentUser = outletContext?.user;
  const location = useLocation();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách tài khoản:", err);
      setErrorMsg(
        err?.response?.data?.message ||
          "Không thể tải danh sách tài khoản. Vui lòng kiểm tra lại quyền truy cập!"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAndSync = async () => {
      await fetchUsers();
      try {
        const conn = signalrService.getConnection();
        if (conn) {
          if (conn.state !== "Connected") {
            await signalrService.start();
          }
          if (conn.state === "Connected") {
            const onlineIds = await conn.invoke("GetOnlineUsers");
            if (Array.isArray(onlineIds)) {
              const onlineSet = new Set(
                onlineIds.map((id) => String(id).toLowerCase())
              );
              setUsers((prev) =>
                prev.map((u) => ({
                  ...u,
                  isOnline: onlineSet.has(String(u.userId).toLowerCase()),
                }))
              );
            }
          }
        }
      } catch (err) {
        console.warn("Không thể đồng bộ trạng thái online ban đầu:", err);
      }
    };

    loadAndSync();
  }, [location.search]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getAllRoles();
        if (Array.isArray(res.data)) {
          setRolesList(res.data);
        }
      } catch (err) {
        console.warn("Chưa tải được danh sách vai trò:", err);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuUserId(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const showNotification = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg("");
    }, 3500);
  };

  const toDateTimeLocal = (dateVal) => {
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "";
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  const formatRoleName = (role) => {
    if (!role) return "Người dùng";
    const lower = String(role).trim().toLowerCase();
    if (lower === "admin") return "Quản trị viên";
    if (lower === "user") return "Người dùng";
    return role;
  };

  const openRoleModal = async (user) => {
    setUserForRoleEdit(user);
    const initialRoleId = user.rolesId || user.RolesId || "";
    setSelectedRoleId(initialRoleId);
    setRoleModalError("");

    let currentRoles = rolesList;
    if (currentRoles.length === 0) {
      try {
        const res = await getAllRoles();
        if (Array.isArray(res.data) && res.data.length > 0) {
          currentRoles = res.data;
          setRolesList(res.data);
        }
      } catch (e) {
        console.error("Lỗi khi tải vai trò:", e);
      }
    }

    if (!initialRoleId && currentRoles.length > 0) {
      const match = currentRoles.find(
        (r) =>
          (r.rolesName || r.RolesName)?.toLowerCase() ===
          (user.roleName || user.RoleName)?.toLowerCase()
      );
      if (match) setSelectedRoleId(match.rolesId || match.RolesId);
    }

    const now = new Date();
    const startStr = user.userRoleStartDate
      ? toDateTimeLocal(user.userRoleStartDate)
      : toDateTimeLocal(now);
    setRoleStartDate(startStr);

    if (user.userRoleEndDate) {
      setIsPermanentRole(false);
      setRoleEndDate(toDateTimeLocal(user.userRoleEndDate));
    } else {
      setIsPermanentRole(true);
      const defaultEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      setRoleEndDate(toDateTimeLocal(defaultEnd));
    }
  };

  const handleApplyPresetDuration = (days) => {
    setIsPermanentRole(false);
    const startBase = roleStartDate ? new Date(roleStartDate) : new Date();
    const endTarget = new Date(startBase.getTime() + days * 24 * 60 * 60 * 1000);
    setRoleEndDate(toDateTimeLocal(endTarget));
  };

  const handleSaveRole = async () => {
    if (!userForRoleEdit) return;

    let targetRoleId = selectedRoleId;
    if (!targetRoleId && rolesList.length > 0) {
      const match = rolesList.find(
        (r) =>
          (r.rolesName || r.RolesName)?.toLowerCase() ===
          (userForRoleEdit.roleName || userForRoleEdit.RoleName)?.toLowerCase()
      );
      if (match) targetRoleId = match.rolesId || match.RolesId;
    }

    if (!targetRoleId) {
      setRoleModalError("Vui lòng chọn một vai trò hợp lệ!");
      return;
    }

    let payloadStartDate = null;
    let payloadEndDate = null;

    if (roleStartDate) {
      payloadStartDate = new Date(roleStartDate).toISOString();
    }

    if (!isPermanentRole) {
      if (!roleEndDate) {
        setRoleModalError("Vui lòng chọn ngày kết thúc cho vai trò có thời hạn!");
        return;
      }
      const startObj = roleStartDate ? new Date(roleStartDate) : new Date();
      const endObj = new Date(roleEndDate);
      if (endObj <= startObj) {
        setRoleModalError("Ngày kết thúc phải lớn hơn ngày bắt đầu hiệu lực!");
        return;
      }
      payloadEndDate = endObj.toISOString();
    } else {
      payloadEndDate = null;
    }

    try {
      setSavingRole(true);
      setRoleModalError("");
      await updateUserRole(userForRoleEdit.userId, {
        userId: userForRoleEdit.userId,
        rolesId: targetRoleId,
        userRoleStartDate: payloadStartDate,
        userRoleEndDate: payloadEndDate,
      });

      const matchedRole = rolesList.find(
        (r) =>
          String(r.rolesId || r.RolesId).toLowerCase() ===
          String(targetRoleId).toLowerCase()
      );
      const newRoleName = matchedRole
        ? matchedRole.rolesName || matchedRole.RolesName
        : userForRoleEdit.roleName;

      setUsers((prev) =>
        prev.map((u) =>
          u.userId === userForRoleEdit.userId
            ? {
                ...u,
                rolesId: targetRoleId,
                roleName: newRoleName,
                userRoleStartDate: payloadStartDate,
                userRoleEndDate: payloadEndDate,
              }
            : u
        )
      );

      const durationInfo = isPermanentRole
        ? "vĩnh viễn"
        : `đến ${new Date(payloadEndDate).toLocaleDateString("vi-VN")}`;

      showNotification(
        `Cập nhật vai trò "${newRoleName}" (${durationInfo}) cho "${userForRoleEdit.userName}" thành công!`
      );
      setUserForRoleEdit(null);
    } catch (err) {
      console.error("Lỗi cập nhật vai trò:", err);
      setRoleModalError(
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Không thể cập nhật vai trò. Vui lòng thử lại!"
      );
    } finally {
      setSavingRole(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserForDelete(user);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!userForDelete) return;
    if (String(userForDelete.userId).toLowerCase() === String(currentUser?.id).toLowerCase()) {
      setDeleteError("Bạn không thể xóa tài khoản của chính mình!");
      return;
    }
    try {
      setDeleting(true);
      setDeleteError("");
      await deleteUser(userForDelete.userId);
      setUsers((prev) => prev.filter((u) => u.userId !== userForDelete.userId));
      showNotification(`Đã xóa tài khoản "${userForDelete.userName}" thành công!`);
      setUserForDelete(null);
    } catch (err) {
      console.error("Lỗi khi xóa tài khoản:", err);
      setDeleteError(
        err?.response?.data?.message || "Không thể xóa tài khoản. Vui lòng thử lại!"
      );
    } finally {
      setDeleting(false);
    }
  };

  useSignalREvent("UserIsOnline", (onlineUserId) => {
    if (!onlineUserId) return;
    const targetId = String(onlineUserId).toLowerCase();
    setUsers((prev) =>
      prev.map((u) =>
        String(u.userId).toLowerCase() === targetId ? { ...u, isOnline: true } : u
      )
    );
  });

  useSignalREvent("UserIsOffline", (offlineUserId) => {
    if (!offlineUserId) return;
    const targetId = String(offlineUserId).toLowerCase();
    setUsers((prev) =>
      prev.map((u) =>
        String(u.userId).toLowerCase() === targetId ? { ...u, isOnline: false } : u
      )
    );
  });

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return users;
    const term = debouncedSearchTerm.toLowerCase();
    return users.filter((u) => {
      return (
        u.userName?.toLowerCase().includes(term) ||
        u.userEmail?.toLowerCase().includes(term) ||
        u.userPhone?.toLowerCase().includes(term) ||
        u.roleName?.toLowerCase().includes(term)
      );
    });
  }, [users, debouncedSearchTerm]);

  const onlineCount = users.filter(
    (u) => (u.isOnline ?? u.IsOnline) === true
  ).length;

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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("vi-VN", {
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

  if (currentUser && currentUser.role?.toLowerCase() !== "admin") {
    return (
      <div className="user-account-container">
        <div className="account-error-box">
          <h2 style={{ color: "#dc3545", marginBottom: "0.5rem" }}>
            Truy cập bị từ chối
          </h2>
          <p>Chỉ tài khoản Quản trị viên (Admin) mới có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-account-container">
      {selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="close-btn"
              onClick={() => setSelectedImage(null)}
              title="Đóng"
            >
              &times;
            </span>
            <img src={selectedImage} alt="Phóng to" className="zoomed-image" />
          </div>
        </div>
      )}

      <div className="account-page-header">
        <div className="header-title-box">
          <h2 className="account-page-title">Quản Lý Tài Khoản</h2>
          <p className="account-page-subtitle">
            Danh sách toàn bộ người dùng trong hệ thống ({filteredUsers.length} tài khoản •{" "}
            <span className="online-count-badge">{onlineCount} đang online</span>)
          </p>
        </div>

        <div className="account-search-box">
          <input
            type="text"
            className="account-search-input"
            placeholder="Tìm theo tên, email, SĐT, vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="account-loading">
          <div className="spinner"></div>
          <p>Đang tải danh sách tài khoản...</p>
        </div>
      ) : errorMsg ? (
        <div className="account-error-box">
          <p>{errorMsg}</p>
          <button className="btn-retry" onClick={fetchUsers}>
            Thử lại
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="account-empty-box">
          <p>Không tìm thấy tài khoản nào phù hợp.</p>
        </div>
      ) : (
        <div className="table-responsive-container">
          <table className="user-account-table">
            <thead>
              <tr>
                <th className="col-stt">STT</th>
                <th className="col-avatar">Ảnh</th>
                <th>Tên người dùng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th className="col-status">Trạng thái</th>
                <th className="col-action">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((item, index) => {
                const isUserOnline = item.isOnline ?? item.IsOnline ?? false;

                return (
                  <tr
                    key={item.userId || index}
                    className="clickable-user-row"
                    onClick={() => setSelectedUserForDetail(item)}
                    title="Bấm để xem chi tiết tài khoản"
                  >
                    <td className="col-stt">{index + 1}</td>
                    <td className="col-avatar">
                      <div className="account-avatar-wrapper">
                        {item.userImg ? (
                          <img
                            src={item.userImg}
                            alt={item.userName}
                            className="account-avatar-img zoomable-avatar"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(item.userImg);
                            }}
                            title="Bấm để phóng to ảnh đại diện"
                          />
                        ) : (
                          <div className="account-avatar-placeholder">
                            {(item.userName || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="user-name-cell">
                      <strong>{item.userName}</strong>
                      {currentUser?.id === item.userId && (
                        <span className="current-user-tag">(Bạn)</span>
                      )}
                    </td>
                    <td>{item.userEmail || "—"}</td>
                    <td>{item.userPhone || "—"}</td>
                    <td>
                      <div className="role-cell-wrapper">
                        <span
                          className={`role-badge ${
                            item.roleName?.toLowerCase() === "admin"
                              ? "role-admin"
                              : "role-user"
                          }`}
                        >
                          {formatRoleName(item.roleName)}
                        </span>
                        {item.userRoleEndDate ? (
                          <span
                            className={`role-validity-tag ${
                              new Date(item.userRoleEndDate) < new Date()
                                ? "expired"
                                : "active"
                            }`}
                            title={`Bắt đầu: ${formatDate(item.userRoleStartDate)} | Kết thúc: ${formatDate(item.userRoleEndDate)}`}
                          >
                            {new Date(item.userRoleEndDate) < new Date()
                              ? "⚠️ Hết hạn"
                              : `⏳ Đến ${formatDate(item.userRoleEndDate)}`}
                          </span>
                        ) : (
                          <span className="role-validity-tag permanent" title="Quyền có hiệu lực vĩnh viễn">
                            ♾️ Vĩnh viễn
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(item.userCreateDate)}</td>
                    <td className="col-status">
                      <span
                        className={`status-badge ${
                          isUserOnline ? "status-online" : "status-offline"
                        }`}
                      >
                        <span className="dot"></span>
                        {isUserOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td
                      className="col-action"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="action-menu-wrapper">
                        <button
                          type="button"
                          className="btn-dots-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuUserId(
                              activeMenuUserId === item.userId ? null : item.userId
                            );
                          }}
                          title="Thao tác"
                          aria-label="Thao tác"
                        >
                          ⋮
                        </button>
                        {activeMenuUserId === item.userId && (
                          <div
                            className={`action-dropdown-menu ${
                              filteredUsers.length > 2 && index === filteredUsers.length - 1
                                ? "dropdown-upward"
                                : ""
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="action-menu-item"
                              onClick={() => {
                                setActiveMenuUserId(null);
                                openRoleModal(item);
                              }}
                            >
                              <span className="menu-item-icon">🛡️</span>
                              <span>Vai trò</span>
                            </button>
                            <button
                              type="button"
                              className="action-menu-item action-menu-delete"
                              onClick={() => {
                                setActiveMenuUserId(null);
                                openDeleteModal(item);
                              }}
                            >
                              <span className="menu-item-icon">🗑️</span>
                              <span>Xóa</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {userForRoleEdit && (
        <div className="account-modal-overlay" onClick={() => setUserForRoleEdit(null)}>
          <div
            className="account-modal-card role-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="account-modal-header">
              <div className="account-modal-title">
                <span className="modal-header-icon">🛡️</span>
                <h3>Phân Quyền & Vai Trò</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setUserForRoleEdit(null)}
              >
                ✕
              </button>
            </div>

            <div className="account-modal-body">
              <div className="role-user-preview">
                {userForRoleEdit.userImg ? (
                  <img
                    src={userForRoleEdit.userImg}
                    alt={userForRoleEdit.userName}
                    className="modal-user-avatar"
                  />
                ) : (
                  <div className="modal-user-avatar placeholder">
                    {(userForRoleEdit.userName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="modal-user-info">
                  <h4>{userForRoleEdit.userName}</h4>
                  <p>{userForRoleEdit.userEmail || "Chưa có email"}</p>
                  <div className="modal-current-role-meta">
                    <span className="modal-current-role">
                      Vai trò hiện tại: <strong>{formatRoleName(userForRoleEdit.roleName)}</strong>
                    </span>
                    <span className="modal-current-duration">
                      {userForRoleEdit.userRoleEndDate
                        ? `(Hạn dùng: ${formatDate(userForRoleEdit.userRoleStartDate)} - ${formatDate(userForRoleEdit.userRoleEndDate)})`
                        : "(Hiệu lực: Vĩnh viễn)"}
                    </span>
                  </div>
                </div>
              </div>

              {roleModalError && (
                <div className="modal-alert-error">
                  <span>⚠️</span> {roleModalError}
                </div>
              )}

              <div className="role-select-group">
                <label htmlFor="role-select">Chọn vai trò mới:</label>
                <select
                  id="role-select"
                  className="role-select-input"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                >
                  <option value="" disabled>-- Chọn vai trò --</option>
                  {rolesList.length > 0 ? (
                    rolesList.map((r) => (
                      <option key={r.rolesId} value={r.rolesId}>
                        {formatRoleName(r.rolesName)}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value={userForRoleEdit.rolesId || "user"}>
                        {formatRoleName(userForRoleEdit.roleName)}
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div className="role-duration-config-section">
                <label className="section-label">Thời hạn sử dụng vai trò:</label>

                <div className="duration-options-tabs">
                  <label className={`duration-option-tab ${isPermanentRole ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="durationOption"
                      checked={isPermanentRole}
                      onChange={() => setIsPermanentRole(true)}
                    />
                    <div className="tab-label-content">
                      <span className="tab-icon">♾️</span>
                      <div>
                        <strong>Vĩnh viễn</strong>
                        <p>Không giới hạn thời gian kết thúc</p>
                      </div>
                    </div>
                  </label>

                  <label className={`duration-option-tab ${!isPermanentRole ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="durationOption"
                      checked={!isPermanentRole}
                      onChange={() => setIsPermanentRole(false)}
                    />
                    <div className="tab-label-content">
                      <span className="tab-icon">⏳</span>
                      <div>
                        <strong>Có thời hạn</strong>
                        <p>Tùy chỉnh thời gian kết thúc vai trò</p>
                      </div>
                    </div>
                  </label>
                </div>

                {!isPermanentRole && (
                  <div className="temporary-duration-container">
                    <div className="quick-preset-bar">
                      <span className="quick-preset-title">Chọn nhanh thời hạn:</span>
                      <div className="quick-preset-buttons">
                        <button
                          type="button"
                          className="btn-preset-pill"
                          onClick={() => handleApplyPresetDuration(7)}
                        >
                          7 ngày
                        </button>
                        <button
                          type="button"
                          className="btn-preset-pill"
                          onClick={() => handleApplyPresetDuration(30)}
                        >
                          30 ngày (1 tháng)
                        </button>
                        <button
                          type="button"
                          className="btn-preset-pill"
                          onClick={() => handleApplyPresetDuration(90)}
                        >
                          90 ngày (3 tháng)
                        </button>
                        <button
                          type="button"
                          className="btn-preset-pill"
                          onClick={() => handleApplyPresetDuration(365)}
                        >
                          1 năm
                        </button>
                      </div>
                    </div>

                    <div className="date-inputs-grid">
                      <div className="date-input-group">
                        <label htmlFor="role-start-date">
                          📅 Ngày bắt đầu:
                        </label>
                        <input
                          id="role-start-date"
                          type="datetime-local"
                          className="role-date-picker"
                          value={roleStartDate}
                          onChange={(e) => setRoleStartDate(e.target.value)}
                        />
                      </div>

                      <div className="date-input-group">
                        <label htmlFor="role-end-date">
                          🏁 Ngày kết thúc:
                        </label>
                        <input
                          id="role-end-date"
                          type="datetime-local"
                          className="role-date-picker"
                          value={roleEndDate}
                          onChange={(e) => setRoleEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    {roleEndDate && (
                      <div className="duration-preview-alert">
                        <span>ℹ️</span>
                        <span>
                          Vai trò sẽ có hiệu lực từ{" "}
                          <strong>{formatDateTime(roleStartDate)}</strong> đến{" "}
                          <strong>{formatDateTime(roleEndDate)}</strong>.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="account-modal-footer">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setUserForRoleEdit(null)}
                disabled={savingRole}
              >
                Hủy
              </button>
              <button
                type="button"
                className="modal-btn-save"
                onClick={handleSaveRole}
                disabled={savingRole || !selectedRoleId}
              >
                {savingRole ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {userForDelete && (
        <div className="account-modal-overlay" onClick={() => setUserForDelete(null)}>
          <div
            className="account-modal-card delete-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="account-modal-header danger-header">
              <div className="account-modal-title">
                <span className="modal-header-icon danger">⚠️</span>
                <h3>Xác Nhận Xóa Tài Khoản</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setUserForDelete(null)}
              >
                ✕
              </button>
            </div>

            <div className="account-modal-body">
              {String(userForDelete.userId).toLowerCase() === String(currentUser?.id).toLowerCase() ? (
                <div className="modal-alert-error">
                  <p><strong>Cảnh báo:</strong> Bạn không thể xóa tài khoản của chính mình khi đang đăng nhập!</p>
                </div>
              ) : (
                <>
                  <p className="delete-confirm-text">
                    Bạn có chắc chắn muốn xóa tài khoản của người dùng:
                  </p>
                  <div className="delete-user-card">
                    <strong>{userForDelete.userName}</strong>
                    <span>{userForDelete.userEmail || "Không có email"}</span>
                    <span className="delete-role-tag">Vai trò: {formatRoleName(userForDelete.roleName)}</span>
                  </div>
                  <p className="delete-warning-note">
                    ⚠️ Hành động này sẽ xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan.
                  </p>
                </>
              )}

              {deleteError && (
                <div className="modal-alert-error">
                  <span>⚠️</span> {deleteError}
                </div>
              )}
            </div>

            <div className="account-modal-footer">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setUserForDelete(null)}
                disabled={deleting}
              >
                Hủy
              </button>
              {String(userForDelete.userId).toLowerCase() !== String(currentUser?.id).toLowerCase() && (
                <button
                  type="button"
                  className="modal-btn-delete-confirm"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {notificationMsg && (
        <div className="account-toast-notification">
          <span>✅</span>
          <p>{notificationMsg}</p>
        </div>
      )}

      {selectedUserForDetail && (
        <Popup_UserAccountDetail
          user={selectedUserForDetail}
          onClose={() => setSelectedUserForDetail(null)}
          isOnline={
            selectedUserForDetail.isOnline ?? selectedUserForDetail.IsOnline
          }
        />
      )}
    </div>
  );
};

export default Page_UserAccount;
