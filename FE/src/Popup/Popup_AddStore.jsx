import { useState, useRef } from "react";
import { createStore } from "../API/API_Store";
import { uploadImage } from "../API/API_Cloudinary";
import { useLocationSync } from "../Hooks/useLocationSync";
import { showToast } from "../Components/Toast/Toast";
import Popup_LocationPicker from "./Popup_LocationPicker";
import "./Style/Popup_AddStore.css";

const Popup_AddStore = ({ onClose, onSuccess, initialStoreName = "" }) => {
  const [storeName, setStoreName] = useState(initialStoreName || "");
  const [storeImg, setStoreImg] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    address: storeAddressInText,
    latitude: storeLat,
    longitude: storeLng,
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
    syncAddressFromCoords,
  } = useLocationSync({
    initialAddress: "",
    initialLat: "",
    initialLng: "",
    debounceTime: 700,
  });

  const handleUploadFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast.error("Vui lòng chọn file hình ảnh (.jpg, .jpeg, .png, .webp,...)");
      return;
    }
    setIsUploading(true);
    try {
      const res = await uploadImage(file, "todolist/stores");
      const uploadedUrl = res.data?.secureUrl || res.data?.url;
      if (uploadedUrl) {
        setStoreImg(uploadedUrl);
        showToast.success("Tải ảnh lên thành công!");
      } else {
        showToast.error("Không nhận được đường dẫn ảnh từ máy chủ.");
      }
    } catch (err) {
      console.error("Lỗi khi tải ảnh lên:", err);
      showToast.error(
        err.response?.data?.message ||
          "Tải ảnh lên thất bại. Vui lòng thử lại!",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleTriggerFileInput = () => {
    if (!isUploading && !loading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
    e.target.value = "";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleSave = async () => {
    const trimmedName = storeName.trim();
    if (!trimmedName) {
      showToast.warning("Tên cửa hàng không được để trống!");
      return;
    }

    let lat = null;
    let lng = null;
    if (storeLat !== "" && storeLat != null) {
      const parsedLat = parseFloat(storeLat);
      if (!isNaN(parsedLat)) lat = parsedLat;
    }
    if (storeLng !== "" && storeLng != null) {
      const parsedLng = parseFloat(storeLng);
      if (!isNaN(parsedLng)) lng = parsedLng;
    }

    const payload = {
      storeName: trimmedName,
      storeImg: storeImg.trim() || null,
      storeAddressInText: storeAddressInText.trim() || null,
      storeAddressInGpsLatitude: lat,
      storeAddressInGpsLongitude: lng,
      isActive: Boolean(isActive),
    };

    setLoading(true);
    try {
      const res = await createStore(payload);
      const createdStore = res.data;
      showToast.success("Tạo cửa hàng mới thành công!");
      if (onSuccess) {
        onSuccess(createdStore);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Lỗi khi tạo cửa hàng mới:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi tạo cửa hàng mới. Vui lòng thử lại!";
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay add-store-overlay">
      <div className="popup-container add-store-popup">
        <div className="popup-header">
          <h2>Thêm Cửa Hàng Mới</h2>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="popup-body">
          <div className="edit-store-banner-wrapper">
            <div
              className={`edit-store-banner-preview ${isDragging ? "drag-over" : ""} ${isUploading ? "uploading" : ""}`}
              onClick={handleTriggerFileInput}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              title="Bấm hoặc kéo thả ảnh vào đây để tải lên"
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading || loading}
              />
              {storeImg ? (
                <img
                  src={storeImg}
                  alt="Xem trước ảnh cửa hàng"
                  className="edit-store-banner-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="edit-store-banner-placeholder">
                  <span>Ảnh cửa hàng (Tùy chọn)</span>
                </div>
              )}

              {!isDragging && !isUploading && (
                <div className="upload-hint-badge">
                  📷 Bấm hoặc kéo thả ảnh để tải lên
                </div>
              )}
            </div>
            <div className="banner-input-wrapper">
              <label>Đường dẫn hình ảnh</label>
              <input
                type="text"
                placeholder="Nhập đường dẫn hình ảnh cửa hàng..."
                value={storeImg}
                onChange={(e) => setStoreImg(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="edit-store-form-fields">
            <div className="edit-store-row-two-cols">
              <div className="input-group">
                <label>Tên Cửa Hàng *</label>
                <input
                  type="text"
                  placeholder="Nhập tên cửa hàng..."
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>Trạng Thái</label>
                <select
                  value={isActive ? "true" : "false"}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                  disabled={loading}
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Ngừng hoạt động</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Địa Chỉ</label>
              <input
                type="text"
                placeholder="Nhập địa chỉ cửa hàng..."
                value={storeAddressInText}
                onChange={(e) => handleAddressChange(e.target.value)}
                disabled={loading}
              />
              {isGeocoding && (
                <div className="input-feedback-tag">
                  <span>⏳</span> Đang tìm tọa độ GPS từ địa chỉ...
                </div>
              )}
            </div>

            <div className="input-group">
              <div className="store-gps-header">
                <label style={{ margin: 0 }}>Tọa Độ GPS</label>
                <div className="store-gps-btn-group">
                  <button
                    type="button"
                    className="btn-store-gps"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating || loading}
                    title="Lấy vị trí GPS từ thiết bị"
                  >
                    {isLocating ? "⏳ Đang lấy..." : "📍 Lấy vị trí hiện tại"}
                  </button>
                  <button
                    type="button"
                    className="btn-store-map"
                    onClick={() => setIsMapOpen(true)}
                    disabled={loading}
                    title="Mở bản đồ OpenStreetMap để chọn vị trí"
                  >
                    🗺️ Mở bản đồ để chọn vị trí
                  </button>
                </div>
              </div>

              <div className="store-coords-grid">
                <div className="store-coords-col">
                  <label>Vĩ độ</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ví dụ: 10.762622"
                    value={storeLat}
                    onChange={(e) => handleLatitudeChange(e.target.value)}
                    onBlur={() => syncAddressFromCoords(storeLat, storeLng)}
                    disabled={loading}
                  />
                </div>
                <div className="store-coords-col">
                  <label>Kinh độ</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ví dụ: 106.660172"
                    value={storeLng}
                    onChange={(e) => handleLongitudeChange(e.target.value)}
                    onBlur={() => syncAddressFromCoords(storeLat, storeLng)}
                    disabled={loading}
                  />
                </div>
              </div>

              {(syncStatus || isReverseGeocoding) && (
                <div
                  className={`store-sync-feedback ${isReverseGeocoding ? "loading" : ""}`}
                >
                  <span>{isReverseGeocoding ? "⏳" : "✓"}</span>
                  <span>
                    {isReverseGeocoding
                      ? "Đang dịch tọa độ sang địa chỉ..."
                      : syncStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="popup-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn-save"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo Cửa Hàng"}
          </button>
        </div>

        <Popup_LocationPicker
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onConfirm={handleMapConfirm}
          initialLat={storeLat}
          initialLng={storeLng}
          initialAddress={storeAddressInText}
          title="Chọn vị trí cửa hàng trên bản đồ"
        />
      </div>
    </div>
  );
};

export default Popup_AddStore;
