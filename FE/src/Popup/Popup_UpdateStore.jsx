import { useState, useRef, useEffect } from "react";
import { updateStore, deleteStore } from "../API/API_Store";
import { getStoresItemsByStoreId } from "../API/API_StoresItemsItemInformation";
import { uploadImage } from "../API/API_Cloudinary";
import { useLocationSync } from "../Hooks/useLocationSync";
import { showToast } from "../Components/Toast/Toast";
import Popup_LocationPicker from "./Popup_LocationPicker";
import "./Style/Popup_UpdateStore.css";

const Popup_UpdateStore = ({ store, onClose, onSuccess }) => {
  const getInitialLat = (storeObj) => {
    return (
      storeObj?.storeAddressInGpsLatitude ??
      storeObj?.storeAddressInGpslatitude ??
      ""
    );
  };
  const getInitialLng = (storeObj) => {
    return (
      storeObj?.storeAddressInGpsLongitude ??
      storeObj?.storeAddressInGpslongitude ??
      ""
    );
  };

  const [storeName, setStoreName] = useState(store?.storeName || "");
  const [storeImg, setStoreImg] = useState(store?.storeImg || "");
  const [isActive, setIsActive] = useState(store?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [productCount, setProductCount] = useState(null);
  const [checkingProducts, setCheckingProducts] = useState(() => Boolean(store?.storeId || store?.id));
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
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
    setInitialValues,
    syncAddressFromCoords,
  } = useLocationSync({
    initialAddress: store?.storeAddressInText || "",
    initialLat: getInitialLat(store),
    initialLng: getInitialLng(store),
    debounceTime: 700,
  });

  const [prevStore, setPrevStore] = useState(store);
  if (store !== prevStore) {
    setPrevStore(store);
    setStoreName(store?.storeName || "");
    setStoreImg(store?.storeImg || "");
    setIsActive(store?.isActive ?? true);
    setInitialValues({
      addr: store?.storeAddressInText || "",
      lat: getInitialLat(store),
      lng: getInitialLng(store),
    });
  }

  useEffect(() => {
    let ignore = false;
    const storeId = store?.storeId || store?.id;
    if (!storeId) {
      return;
    }

    async function checkProducts() {
      try {
        setCheckingProducts(true);
        const res = await getStoresItemsByStoreId(storeId);
        const items = res.data || [];
        if (!ignore) {
          setProductCount(items.length);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra sản phẩm của cửa hàng:", err);
        if (!ignore) {
          setProductCount(0);
        }
      } finally {
        if (!ignore) {
          setCheckingProducts(false);
        }
      }
    }

    checkProducts();
    return () => {
      ignore = true;
    };
  }, [store?.storeId, store?.id]);

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

    const storeId = store?.storeId || store?.id;
    if (!storeId) {
      showToast.error("Không tìm thấy mã định danh cửa hàng.");
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
      storeId: storeId,
      storeName: trimmedName,
      storeImg: storeImg.trim() || null,
      storeAddressInText: storeAddressInText.trim() || null,
      storeAddressInGpsLatitude: lat,
      storeAddressInGpsLongitude: lng,
      isActive: Boolean(isActive),
    };

    setLoading(true);
    try {
      await updateStore(storeId, payload);
      showToast.success("Cập nhật thông tin cửa hàng thành công!");
      if (onSuccess) {
        onSuccess(payload);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin cửa hàng:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi cập nhật thông tin cửa hàng. Vui lòng thử lại!";
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (checkingProducts) return;

    if (productCount > 0) {
      showToast.warning(
        `Không thể xóa cửa hàng này vì vẫn còn ${productCount} sản phẩm. Vui lòng xóa hết sản phẩm của cửa hàng trước khi xóa!`,
      );
      return;
    }

    const storeId = store?.storeId || store?.id;
    if (!storeId) {
      showToast.error("Không tìm thấy mã định danh cửa hàng.");
      return;
    }

    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    const storeId = store?.storeId || store?.id;
    if (!storeId) {
      showToast.error("Không tìm thấy mã định danh cửa hàng.");
      return;
    }

    setDeleting(true);
    try {
      await deleteStore(storeId);
      setShowConfirmDelete(false);
      showToast.success("Xóa cửa hàng thành công!");
      if (onSuccess) {
        onSuccess({ type: "delete", storeId });
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Lỗi khi xóa cửa hàng:", err);
      const msg =
        err.response?.data?.message ||
        "Không thể xóa cửa hàng. Vui lòng thử lại!";
      showToast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container update-store-popup">
        <div className="popup-header">
          <h2>Chỉnh sửa thông tin cửa hàng</h2>
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
                  <span>cửa hàng</span>
                </div>
              )}

              {isDragging && (
                <div className="drag-drop-overlay ready">
                  <span className="drag-icon">📥</span>
                  <span className="drag-text">
                    Sẵn sàng tải ảnh! Thả ảnh vào đây
                  </span>
                </div>
              )}
              {isUploading && (
                <div className="drag-drop-overlay uploading">
                  <div className="upload-spinner"></div>
                  <span className="upload-text">
                    Đang tải ảnh lên Cloudinary...
                  </span>
                </div>
              )}
              {!isDragging && !isUploading && (
                <div className="upload-hint-badge">
                  📷 Bấm hoặc kéo thả ảnh vào đây để tải lên
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
                <label>Tên Cửa Hàng</label>
                <input
                  type="text"
                  placeholder="Nhập tên cửa hàng..."
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  disabled={loading}
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

        <div className="popup-footer update-store-footer">
          <button
            type="button"
            className={`btn-delete-store ${productCount > 0 ? "btn-delete-disabled" : ""}`}
            onClick={handleDelete}
            disabled={loading || deleting || checkingProducts}
            title={
              checkingProducts
                ? "Đang kiểm tra sản phẩm..."
                : productCount > 0
                  ? `Không thể xóa vì cửa hàng còn ${productCount} sản phẩm`
                  : "Xóa cửa hàng này"
            }
          >
            {deleting ? "Đang xóa..." : "Xóa"}
          </button>

          <div className="footer-right-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading || deleting}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn-save"
              onClick={handleSave}
              disabled={loading || deleting}
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        <Popup_LocationPicker
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onConfirm={handleMapConfirm}
          initialLat={storeLat}
          initialLng={storeLng}
          initialAddress={storeAddressInText}
        />

        {showConfirmDelete && (
          <div className="confirm-delete-overlay">
            <div className="confirm-delete-card">
              <div className="confirm-delete-icon">⚠️</div>
              <h3 className="confirm-delete-title">Xác nhận xóa cửa hàng</h3>
              <p className="confirm-delete-desc">
                Bạn có chắc chắn muốn xóa vĩnh viễn cửa hàng{" "}
                <strong>"{storeName || store?.storeName}"</strong> không?
                <br />
                <span className="confirm-delete-note">
                  Hành động này sẽ không thể khôi phục.
                </span>
              </p>
              <div className="confirm-delete-actions">
                <button
                  type="button"
                  className="btn-confirm-cancel"
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={deleting}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn-confirm-delete"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup_UpdateStore;
