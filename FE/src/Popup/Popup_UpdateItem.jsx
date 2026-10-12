import { useState, useEffect, useRef } from "react";
import { searchStores, createStore } from "../API/API_Store";
import {
  searchItemInformations,
  createItemInformation,
} from "../API/API_ItemInformation";
import { searchItems, createItem, updateItem } from "../API/API_Item";
import {
  updateStoresItemsItemInformation,
  deleteStoresItemsItemInformation,
} from "../API/API_StoresItemsItemInformation";
import { uploadImage } from "../API/API_Cloudinary";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
} from "../utils/formatCurrency";
import Popup_AddStore from "./Popup_AddStore";
import "./Style/Popup_UpdateItem.css";

const Popup_UpdateItem = ({ item, onClose, onSuccess }) => {
  const [itemName, setItemName] = useState(item?.itemName || "");
  const [itemImg, setItemImg] = useState(item?.itemImg || "");
  const [selectedItemId, setSelectedItemId] = useState(item?.itemId || null);
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);

  const [storeName, setStoreName] = useState(item?.storeName || "");
  const [selectedStoreId, setSelectedStoreId] = useState(item?.storeId || null);
  const [storeSuggestions, setStoreSuggestions] = useState([]);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);

  const [price, setPrice] = useState(
    item?.itemInformationPrice !== undefined &&
      item?.itemInformationPrice !== null
      ? formatCurrency(item.itemInformationPrice)
      : "",
  );
  const [type, setType] = useState(item?.itemInformationItemType || "");

  const [showAddStorePopup, setShowAddStorePopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh (.jpg, .jpeg, .png, .webp,...)");
      return;
    }
    setIsUploading(true);
    try {
      const res = await uploadImage(file, "todolist/items");
      const uploadedUrl = res.data?.secureUrl || res.data?.url;
      if (uploadedUrl) {
        setItemImg(uploadedUrl);
      } else {
        alert("Không nhận được đường dẫn ảnh từ máy chủ.");
      }
    } catch (err) {
      console.error("Lỗi khi tải ảnh lên:", err);
      alert(
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

  const [prevItem, setPrevItem] = useState(item);
  if (item !== prevItem) {
    setPrevItem(item);
    setItemName(item?.itemName || "");
    setItemImg(item?.itemImg || "");
    setSelectedItemId(item?.itemId || null);
    setStoreName(item?.storeName || "");
    setSelectedStoreId(item?.storeId || null);
    setPrice(
      item?.itemInformationPrice !== undefined &&
        item?.itemInformationPrice !== null
        ? formatCurrency(item.itemInformationPrice)
        : "",
    );
    setType(item?.itemInformationItemType || "");
  }

  useEffect(() => {
    const fetchItems = async () => {
      if (!itemName || selectedItemId) {
        setItemSuggestions([]);
        setIsItemDropdownOpen(false);
        return;
      }
      try {
        const res = await searchItems(itemName);
        let results = [];
        if (res.data && Array.isArray(res.data.items)) {
          results = res.data.items;
        } else if (Array.isArray(res.data)) {
          results = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          results = res.data.data;
        }
        setItemSuggestions(results);
        setIsItemDropdownOpen(results.length > 0);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm Item:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [itemName, selectedItemId]);

  const handleItemNameChange = (e) => {
    setItemName(e.target.value);
    setSelectedItemId(null);
  };

  const handleSelectItem = (selected) => {
    setItemName(selected.itemName || selected.name || "");
    setSelectedItemId(selected.itemId || selected.id);
    if (selected.itemImg) {
      setItemImg(selected.itemImg);
    }
    setIsItemDropdownOpen(false);
  };

  useEffect(() => {
    const fetchStores = async () => {
      if (!storeName || selectedStoreId) {
        setStoreSuggestions([]);
        setIsStoreDropdownOpen(false);
        return;
      }
      try {
        const res = await searchStores(storeName);
        let results = [];
        if (res.data && Array.isArray(res.data.items)) {
          results = res.data.items;
        } else if (Array.isArray(res.data)) {
          results = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          results = res.data.data;
        }
        setStoreSuggestions(results);
        setIsStoreDropdownOpen(results.length > 0);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm Store:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchStores();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [storeName, selectedStoreId]);

  const handleStoreNameChange = (e) => {
    setStoreName(e.target.value);
    setSelectedStoreId(null);
  };

  const handleSelectStore = (store) => {
    setStoreName(store.storeName || store.name || "");
    setSelectedStoreId(store.storeId || store.id);
    setIsStoreDropdownOpen(false);
  };

  const handleDelete = async () => {
    if (!item?.storesItemsItemInformationId) {
      alert("Không tìm thấy thông tin định danh để xóa.");
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa "${itemName || "vật phẩm này"}" khỏi danh sách không?`,
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await deleteStoresItemsItemInformation(item.storesItemsItemInformationId);
      alert("Xóa vật phẩm thành công!");
      if (onSuccess) {
        onSuccess({ type: "delete", id: item.storesItemsItemInformationId });
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Lỗi khi xóa vật phẩm:", error);
      alert(
        error.response?.data?.message ||
          "Xóa vật phẩm thất bại. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const trimmedItemName = itemName.trim();
    const trimmedStoreName = storeName.trim();
    const trimmedType = type.trim();
    const trimmedPriceStr = price.toString().trim();

    if (
      !trimmedItemName ||
      !trimmedStoreName ||
      !trimmedType ||
      !trimmedPriceStr
    ) {
      alert("Vui lòng điền đầy đủ Tên vật phẩm, Tên cửa hàng, Giá và Đơn vị.");
      return;
    }

    const cleanPrice = parseCurrencyInput(price);
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      alert("Giá tiền không hợp lệ. Vui lòng nhập số!");
      return;
    }

    setLoading(true);
    try {
      let finalStoreId = selectedStoreId;
      if (!finalStoreId) {
        const storeSearchRes = await searchStores(trimmedStoreName, 1, 100);
        const storeList =
          storeSearchRes.data?.items ||
          storeSearchRes.data?.data ||
          storeSearchRes.data ||
          [];
        const existingStore = storeList.find(
          (s) =>
            (s.storeName || s.name || "").trim().toLowerCase() ===
            trimmedStoreName.toLowerCase(),
        );
        if (existingStore) {
          finalStoreId = existingStore.storeId || existingStore.id;
        } else {
          const newStoreRes = await createStore({
            storeName: trimmedStoreName,
            storeAddressInText: "",
          });
          finalStoreId = newStoreRes.data.storeId || newStoreRes.data.id;
        }
      }

      let finalItemId = selectedItemId;
      if (!finalItemId) {
        const itemSearchRes = await searchItems(trimmedItemName, 1, 100);
        const itemList =
          itemSearchRes.data?.items ||
          itemSearchRes.data?.data ||
          itemSearchRes.data ||
          [];
        const existingItem = itemList.find(
          (i) =>
            (i.itemName || i.name || "").trim().toLowerCase() ===
            trimmedItemName.toLowerCase(),
        );
        if (existingItem) {
          finalItemId = existingItem.itemId || existingItem.id;
          if (itemImg.trim() && existingItem.itemImg !== itemImg.trim()) {
            try {
              await updateItem(finalItemId, {
                itemId: finalItemId,
                itemName: existingItem.itemName || trimmedItemName,
                itemImg: itemImg.trim(),
              });
            } catch (err) {
              console.warn("Lỗi cập nhật ảnh item:", err);
            }
          }
        } else {
          const newItemRes = await createItem({
            itemName: trimmedItemName,
            itemImg: itemImg.trim() || null,
          });
          finalItemId = newItemRes.data.itemId || newItemRes.data.id;
        }
      } else {
        try {
          await updateItem(finalItemId, {
            itemId: finalItemId,
            itemName: trimmedItemName,
            itemImg: itemImg.trim() || null,
          });
        } catch (err) {
          console.warn("Lỗi cập nhật item:", err);
        }
      }

      let finalInfoId = null;
      const infoSearchRes = await searchItemInformations(trimmedType, 1, 100);
      const infoList =
        infoSearchRes.data?.items ||
        infoSearchRes.data?.data ||
        infoSearchRes.data ||
        [];
      const existingInfo = infoList.find(
        (inf) =>
          Number(inf.itemInformationPrice ?? inf.price) === cleanPrice &&
          (inf.itemInformationItemType || inf.type || "")
            .trim()
            .toLowerCase() === trimmedType.toLowerCase(),
      );
      if (existingInfo) {
        finalInfoId = existingInfo.itemInformationId || existingInfo.id;
      } else {
        const newInfoRes = await createItemInformation({
          itemInformationPrice: cleanPrice,
          itemInformationItemType: trimmedType,
        });
        finalInfoId = newInfoRes.data.itemInformationId || newInfoRes.data.id;
      }

      await updateStoresItemsItemInformation(
        item.storesItemsItemInformationId,
        {
          storesItemsItemInformationId: item.storesItemsItemInformationId,
          storeId: finalStoreId,
          itemId: finalItemId,
          itemInformationId: finalInfoId,
        },
      );

      alert("Cập nhật thông tin vật phẩm thành công!");
      if (onSuccess) {
        onSuccess({ type: "update" });
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin vật phẩm:", error);
      alert(
        error.response?.data?.message ||
          "Cập nhật vật phẩm thất bại. Vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container add-item-popup">
        <div className="popup-header">
          <h2>Chỉnh sửa vật phẩm</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        <div className="popup-body">
          <div className="item-store-section">
            <div
              className={`img-placeholder ${isDragging ? "drag-over" : ""} ${isUploading ? "uploading" : ""}`}
              onClick={handleTriggerFileInput}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              title="Bấm hoặc kéo thả ảnh vật phẩm vào đây để tải lên"
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading || loading}
              />
              {itemImg ? (
                <img
                  src={itemImg}
                  alt="vật phẩm"
                  className="item-preview-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <span>vật phẩm</span>
              )}

              {isDragging && (
                <div className="img-drag-overlay ready">
                  <span className="drag-icon">📥</span>
                  <span>Sẵn sàng! Thả ảnh vào đây</span>
                </div>
              )}
              {isUploading && (
                <div className="img-drag-overlay uploading">
                  <div className="mini-spinner"></div>
                  <span>Đang tải ảnh...</span>
                </div>
              )}
              {!isDragging && !isUploading && (
                <div className="img-upload-hint">📷 Đổi ảnh</div>
              )}
            </div>

            <div className="item-store-inputs">
              <div className="input-group dropdown-wrapper">
                <label>Tên vật phẩm</label>
                <input
                  type="text"
                  placeholder="Nhập tên vật phẩm..."
                  value={itemName}
                  onChange={handleItemNameChange}
                  disabled={loading}
                  onFocus={() => {
                    if (itemSuggestions.length > 0) setIsItemDropdownOpen(true);
                  }}
                  onBlur={() =>
                    setTimeout(() => setIsItemDropdownOpen(false), 200)
                  }
                />

                {isItemDropdownOpen && itemSuggestions.length > 0 && (
                  <ul className="autocomplete-dropdown">
                    {itemSuggestions.map((it) => (
                      <li
                        key={it.itemId || it.id}
                        onMouseDown={() => handleSelectItem(it)}
                      >
                        <div className="store-name">
                          {it.itemName || it.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="input-group dropdown-wrapper">
                <label>Tên Cửa Hàng</label>
                <input
                  type="text"
                  placeholder="Nhập tên cửa hàng..."
                  value={storeName}
                  onChange={handleStoreNameChange}
                  disabled={loading}
                  onFocus={() => {
                    if (storeSuggestions.length > 0)
                      setIsStoreDropdownOpen(true);
                  }}
                  onBlur={() =>
                    setTimeout(() => setIsStoreDropdownOpen(false), 200)
                  }
                />

                {isStoreDropdownOpen && storeSuggestions.length > 0 && (
                  <ul className="autocomplete-dropdown">
                    {storeSuggestions.map((st) => (
                      <li
                        key={st.storeId || st.id}
                        onMouseDown={() => handleSelectStore(st)}
                      >
                        <div className="store-name">
                          {st.storeName || st.name}
                        </div>
                        <div className="store-address">
                          {st.storeAddressInText
                            ? `--${st.storeAddressInText}--`
                            : st.address
                              ? `--${st.address}--`
                              : st.location
                                ? `--${st.location}--`
                                : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  className="btn-create-store-manual"
                  onClick={() => setShowAddStorePopup(true)}
                  disabled={loading}
                >
                  + Tạo Cửa Hàng Mới Thủ Công
                </button>
              </div>
            </div>
          </div>

          <div className="input-group item-image-input-group">
            <label>Đường dẫn hình ảnh</label>
            <input
              type="text"
              placeholder="Nhập đường dẫn hình ảnh vật phẩm..."
              value={itemImg}
              onChange={(e) => setItemImg(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="dynamic-infos">
            <h4>Thông tin Giá & Đơn vị</h4>
            <div className="form-row info-row">
              <div className="input-group">
                <label>Giá</label>
                <input
                  type="text"
                  placeholder="vd: 10.000"
                  value={price}
                  onChange={(e) => setPrice(formatCurrencyInput(e.target.value))}
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>Đơn vị</label>
                <input
                  type="text"
                  placeholder="vd: lon"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="popup-footer update-item-footer">
          <button
            type="button"
            className="btn-delete-item"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Xóa"}
          </button>
          <div className="footer-right-actions">
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
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </div>

      {showAddStorePopup && (
        <Popup_AddStore
          initialStoreName={storeName}
          onClose={() => setShowAddStorePopup(false)}
          onSuccess={(newStore) => {
            setShowAddStorePopup(false);
            if (newStore) {
              setStoreName(newStore.storeName || storeName);
              setSelectedStoreId(newStore.storeId);
            }
          }}
        />
      )}
    </div>
  );
};

export default Popup_UpdateItem;
