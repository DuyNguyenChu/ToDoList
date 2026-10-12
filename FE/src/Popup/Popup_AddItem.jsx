import { useState, useEffect, useRef } from "react";
import { searchStores, createStore } from "../API/API_Store";
import {
  searchItemInformations,
  createItemInformation,
} from "../API/API_ItemInformation";
import { searchItems, createItem } from "../API/API_Item";
import { createStoresItemsItemInformation } from "../API/API_StoresItemsItemInformation";
import { uploadImage } from "../API/API_Cloudinary";
import { showToast } from "../Components/Toast/Toast";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
} from "../utils/formatCurrency";
import "./Style/Popup_AddItem.css";
import Popup_AddStore from "./Popup_AddStore";

const Popup_AddItem = ({ onClose, onSuccess }) => {
  const [itemName, setItemName] = useState("");
  const [itemImg, setItemImg] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [storeSuggestions, setStoreSuggestions] = useState([]);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [itemInformations, setItemInformations] = useState([
    { price: "", type: "", id: null },
  ]);

  const [activeInfoRowIndex, setActiveInfoRowIndex] = useState(null);
  const [activeInfoField, setActiveInfoField] = useState(null);
  const [infoSuggestions, setInfoSuggestions] = useState([]);

  const [showAddStorePopup, setShowAddStorePopup] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [matchesFound, setMatchesFound] = useState({
    item: null,
    store: null,
    infos: [],
  });
  const [reuseSelections, setReuseSelections] = useState({
    item: false,
    store: false,
    infos: {},
  });
  const [isCheckingMatches, setIsCheckingMatches] = useState(false);
  const [pendingSaveSelections, setPendingSaveSelections] = useState(null);

  const handleUploadFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast.error("Vui lòng chọn file hình ảnh (.jpg, .jpeg, .png, .webp,...)");
      return;
    }
    setIsUploading(true);
    try {
      const res = await uploadImage(file, "todolist/items");
      const uploadedUrl = res.data?.secureUrl || res.data?.url;
      if (uploadedUrl) {
        setItemImg(uploadedUrl);
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
    if (!isUploading) {
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

  const handleSelectItem = (item) => {
    setItemName(item.itemName || item.name || "");
    setSelectedItemId(item.itemId || item.id);
    if (item.itemImg) {
      setItemImg(item.itemImg);
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

  useEffect(() => {
    const fetchInfoSuggestions = async () => {
      if (activeInfoRowIndex === null || activeInfoField === null) {
        setInfoSuggestions([]);
        return;
      }
      const currentRow = itemInformations[activeInfoRowIndex];
      if (!currentRow) {
        setInfoSuggestions([]);
        return;
      }
      const keyword = currentRow[activeInfoField];

      if (!keyword || !keyword.toString().trim() || currentRow.id) {
        setInfoSuggestions([]);
        return;
      }

      try {
        const res = await searchItemInformations(keyword.toString().trim());
        let results = [];
        if (res.data && Array.isArray(res.data.items)) {
          results = res.data.items;
        } else if (Array.isArray(res.data)) {
          results = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          results = res.data.data;
        }
        setInfoSuggestions(results);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm ItemInformation:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchInfoSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [itemInformations, activeInfoRowIndex, activeInfoField]);

  const handleAddInfoRow = () => {
    setItemInformations([
      ...itemInformations,
      { price: "", type: "", id: null },
    ]);
  };

  const handleRemoveInfoRow = (index) => {
    const newInfos = [...itemInformations];
    newInfos.splice(index, 1);
    setItemInformations(newInfos);
  };

  const handleInfoChange = (index, field, value) => {
    const newInfos = [...itemInformations];
    if (field === "price") {
      newInfos[index][field] = formatCurrencyInput(value);
    } else {
      newInfos[index][field] = value;
    }
    newInfos[index].id = null;
    setItemInformations(newInfos);
    setActiveInfoRowIndex(index);
    setActiveInfoField(field);
  };

  const handleSelectInfo = (index, infoResult) => {
    const newInfos = [...itemInformations];
    const p = infoResult.itemInformationPrice ?? infoResult.price;
    newInfos[index].price =
      p !== undefined && p !== null ? formatCurrency(p) : "";
    newInfos[index].type =
      infoResult.itemInformationItemType || infoResult.type || "";
    newInfos[index].id = infoResult.itemInformationId || infoResult.id;
    setItemInformations(newInfos);
    setActiveInfoRowIndex(null);
    setInfoSuggestions([]);
  };

  const executeSave = async (selections, matches, knownStoreId = null) => {
    try {
      let finalItemId = null;
      if (selections.item && matches.item) {
        finalItemId = matches.item.itemId || matches.item.id;
      } else if (selectedItemId) {
        finalItemId = selectedItemId;
      } else {
        const itemRes = await createItem({
          itemName: itemName.trim(),
          itemImg: itemImg.trim() || null,
        });
        finalItemId = itemRes.data.itemId || itemRes.data.id;
      }

      let finalStoreId = knownStoreId;
      if (!finalStoreId) {
        if (selections.store && matches.store) {
          finalStoreId = matches.store.storeId || matches.store.id;
        } else if (selectedStoreId) {
          finalStoreId = selectedStoreId;
        } else {
          const storeRes = await createStore({
            storeName: storeName.trim(),
            storeAddressInText: "",
          });
          finalStoreId = storeRes.data.storeId || storeRes.data.id;
        }
      }

      if (!finalItemId || !finalStoreId) {
        showToast.error("Không thể khởi tạo Vật phẩm hoặc Cửa hàng.");
        return;
      }

      for (let i = 0; i < itemInformations.length; i++) {
        const info = itemInformations[i];
        if (!info.price?.toString().trim() || !info.type?.toString().trim())
          continue;

        let finalInfoId = null;
        if (selections.infos?.[i] && matches.infos?.[i]) {
          finalInfoId =
            matches.infos[i].itemInformationId || matches.infos[i].id;
        } else if (info.id) {
          finalInfoId = info.id;
        } else {
          const cleanPrice = parseCurrencyInput(info.price);
          const infoRes = await createItemInformation({
            itemInformationPrice: isNaN(cleanPrice) ? 0 : cleanPrice,
            itemInformationItemType: info.type.trim(),
          });
          finalInfoId = infoRes.data.itemInformationId || infoRes.data.id;
        }

        if (finalInfoId) {
          await createStoresItemsItemInformation({
            storeId: finalStoreId,
            itemId: finalItemId,
            itemInformationId: finalInfoId,
          });
        }
      }

      showToast.success("Lưu thành công!");
      setShowConfirmModal(false);
      if (onSuccess) {
        onSuccess();
      }
      window.dispatchEvent(new CustomEvent("stores-items:refresh"));
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      showToast.error("Đã xảy ra lỗi khi lưu. Vui lòng thử lại.");
    }
  };

  const handleConfirmReuseSave = async () => {
    const isStoreReused = reuseSelections.store && matchesFound.store;
    if (!isStoreReused) {
      setPendingSaveSelections({
        selections: reuseSelections,
        matches: matchesFound,
      });
      setShowConfirmModal(false);
      setShowAddStorePopup(true);
      return;
    }

    await executeSave(
      reuseSelections,
      matchesFound,
      matchesFound.store.storeId || matchesFound.store.id,
    );
  };

  const handleStoreCreated = async (createdStore) => {
    setShowAddStorePopup(false);
    if (createdStore) {
      setStoreName(createdStore.storeName || storeName);
      setSelectedStoreId(createdStore.storeId);

      if (pendingSaveSelections) {
        const { selections, matches } = pendingSaveSelections;
        setPendingSaveSelections(null);
        await executeSave(selections, matches, createdStore.storeId);
      }
    }
  };

  const handleCloseAddStore = () => {
    setShowAddStorePopup(false);
    setPendingSaveSelections(null);
  };

  const handleSave = async () => {
    if (!itemName.trim() || !storeName.trim()) {
      showToast.warning("Vui lòng nhập đầy đủ tên vật phẩm và tên cửa hàng.");
      return;
    }

    setIsCheckingMatches(true);
    try {
      let itemMatch = null;
      try {
        const itemRes = await searchItems(itemName.trim(), 1, 100);
        const items = itemRes.data?.items || itemRes.data || [];
        itemMatch =
          items.find(
            (i) =>
              (i.itemName || i.name || "").trim().toLowerCase() ===
              itemName.trim().toLowerCase(),
          ) || null;
      } catch (err) {
        console.error("Lỗi kiểm tra trùng Item:", err);
      }

      let storeMatch = null;
      try {
        const storeRes = await searchStores(storeName.trim(), 1, 100);
        const stores = storeRes.data?.items || storeRes.data || [];
        storeMatch =
          stores.find(
            (s) =>
              (s.storeName || s.name || "").trim().toLowerCase() ===
              storeName.trim().toLowerCase(),
          ) || null;
      } catch (err) {
        console.error("Lỗi kiểm tra trùng Store:", err);
      }

      const infoMatches = [];
      for (let i = 0; i < itemInformations.length; i++) {
        const info = itemInformations[i];
        if (!info.price?.toString().trim() || !info.type?.toString().trim()) {
          infoMatches.push(null);
          continue;
        }
        const cleanPrice = parseCurrencyInput(info.price);
        const cleanType = info.type.trim().toLowerCase();

        let matched = null;
        try {
          const infoRes = await searchItemInformations(
            info.type.trim(),
            1,
            100,
          );
          const infos = infoRes.data?.items || infoRes.data || [];
          matched =
            infos.find((itemInfo) => {
              const p = Number(itemInfo.itemInformationPrice ?? itemInfo.price);
              const t = (
                itemInfo.itemInformationItemType ||
                itemInfo.type ||
                ""
              )
                .trim()
                .toLowerCase();
              return p === cleanPrice && t === cleanType;
            }) || null;
        } catch (err) {
          console.error("Lỗi kiểm tra trùng ItemInformation:", err);
        }
        infoMatches.push(matched);
      }

      const itemNeedsConfirm = itemMatch && !selectedItemId;
      const storeNeedsConfirm = storeMatch && !selectedStoreId;
      const infoNeedsConfirm = infoMatches.some(
        (m, idx) => m !== null && !itemInformations[idx]?.id,
      );

      if (itemNeedsConfirm || storeNeedsConfirm || infoNeedsConfirm) {
        const currentMatches = {
          item: itemMatch,
          store: storeMatch,
          infos: infoMatches,
        };
        setMatchesFound(currentMatches);

        const initialInfos = {};
        infoMatches.forEach((m, idx) => {
          initialInfos[idx] = Boolean(itemInformations[idx]?.id || m);
        });
        setReuseSelections({
          item: Boolean(selectedItemId || itemMatch),
          store: Boolean(selectedStoreId || storeMatch),
          infos: initialInfos,
        });

        setShowConfirmModal(true);
      } else {
        const finalStoreId =
          selectedStoreId || (storeMatch?.storeId ?? storeMatch?.id);
        if (!finalStoreId) {
          setPendingSaveSelections({
            selections: {
              item: Boolean(selectedItemId),
              store: false,
              infos: {},
            },
            matches: { item: itemMatch, store: null, infos: infoMatches },
          });
          setShowAddStorePopup(true);
        } else {
          await executeSave(
            {
              item: Boolean(selectedItemId || itemMatch),
              store: Boolean(finalStoreId),
              infos: Object.fromEntries(
                itemInformations.map((info, idx) => [
                  idx,
                  Boolean(info.id || infoMatches[idx]),
                ]),
              ),
            },
            {
              item: itemMatch,
              store: storeMatch,
              infos: infoMatches,
            },
            finalStoreId,
          );
        }
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra dữ liệu:", error);
      showToast.error("Đã xảy ra lỗi khi kiểm tra dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsCheckingMatches(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container add-item-popup">
        <div className="popup-header">
          <h2>Thêm vật phẩm Mới</h2>
          <button className="close-btn" onClick={onClose}>
            X
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
                disabled={isUploading}
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
                  onFocus={() => {
                    if (itemSuggestions.length > 0) setIsItemDropdownOpen(true);
                  }}
                  onBlur={() =>
                    setTimeout(() => setIsItemDropdownOpen(false), 200)
                  }
                />

                {isItemDropdownOpen && itemSuggestions.length > 0 && (
                  <ul className="autocomplete-dropdown">
                    {itemSuggestions.map((item) => (
                      <li
                        key={item.itemId || item.id}
                        onMouseDown={() => handleSelectItem(item)}
                      >
                        <div className="store-name">
                          {item.itemName || item.name}
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
                    {storeSuggestions.map((store) => (
                      <li
                        key={store.storeId || store.id}
                        onMouseDown={() => handleSelectStore(store)}
                      >
                        <div className="store-name">
                          {store.storeName || store.name}
                        </div>
                        <div className="store-address">
                          {store.storeAddressInText
                            ? `--${store.storeAddressInText}--`
                            : store.address
                              ? `--${store.address}--`
                              : store.location
                                ? `--${store.location}--`
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
            />
          </div>

          <div className="dynamic-infos">
            <h4>Thông tin Giá & Đơn vị (Có thể thêm nhiều)</h4>
            {itemInformations.map((info, index) => (
              <div className="form-row info-row dropdown-wrapper" key={index}>
                <div className="input-group">
                  <label>Giá</label>
                  <input
                    type="text"
                    placeholder="vd: 10.000"
                    value={info.price}
                    onChange={(e) =>
                      handleInfoChange(index, "price", e.target.value)
                    }
                    onFocus={() => {
                      setActiveInfoRowIndex(index);
                      setActiveInfoField("price");
                    }}
                    onBlur={() =>
                      setTimeout(() => {
                        if (activeInfoRowIndex === index)
                          setActiveInfoRowIndex(null);
                      }, 200)
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Đơn vị</label>
                  <input
                    type="text"
                    placeholder="vd: lon"
                    value={info.type}
                    onChange={(e) =>
                      handleInfoChange(index, "type", e.target.value)
                    }
                    onFocus={() => {
                      setActiveInfoRowIndex(index);
                      setActiveInfoField("type");
                    }}
                    onBlur={() =>
                      setTimeout(() => {
                        if (activeInfoRowIndex === index)
                          setActiveInfoRowIndex(null);
                      }, 200)
                    }
                  />
                </div>

                {activeInfoRowIndex === index && infoSuggestions.length > 0 && (
                  <ul className="autocomplete-dropdown">
                    {infoSuggestions.map((infoResult, idx) => {
                      const p =
                        infoResult.itemInformationPrice ?? infoResult.price;
                      const formattedPrice =
                        p !== undefined && p !== null
                          ? formatCurrency(p)
                          : "";
                      const unit =
                        infoResult.itemInformationItemType ||
                        infoResult.type ||
                        "";
                      return (
                        <li
                          key={
                            infoResult.itemInformationId || infoResult.id || idx
                          }
                          onMouseDown={() =>
                            handleSelectInfo(index, infoResult)
                          }
                        >
                          <div className="store-name">
                            {formattedPrice} {unit}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {itemInformations.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-row"
                    onClick={() => handleRemoveInfoRow(index)}
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-add-row"
              onClick={handleAddInfoRow}
            >
              + Thêm thông tin Giá/Đơn vị
            </button>
          </div>
        </div>

        <div className="popup-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isCheckingMatches}
          >
            Hủy
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={isCheckingMatches}
          >
            {isCheckingMatches ? "Đang kiểm tra..." : "Lưu"}
          </button>
        </div>
      </div>

      {showAddStorePopup && (
        <Popup_AddStore
          initialStoreName={storeName}
          onClose={handleCloseAddStore}
          onSuccess={handleStoreCreated}
        />
      )}

      {showConfirmModal && (
        <div className="popup-overlay confirm-reuse-overlay">
          <div className="popup-container confirm-reuse-modal">
            <div className="popup-header">
              <h3>
                Bạn có muốn dùng lại thông tin đã có để hạn chế các dữ liệu thừa
                không ? hoặc tạo mới
              </h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="confirm-reuse-body">
              <p className="confirm-reuse-intro">
                Hệ thống đã phát hiện thông tin bạn nhập trùng khớp với dữ liệu
                trong hệ thống. Bấm &quot;Dùng lại&quot; để dùng lại những thông
                tin đã có
              </p>

              <div className="reuse-section">
                <h4>1. Tên vật phẩm</h4>
                <div className="reuse-row">
                  <div className="reuse-item-left">
                    <div className="reuse-name">
                      {matchesFound.item?.itemName || itemName}
                    </div>
                  </div>
                  {matchesFound.item ? (
                    <button
                      type="button"
                      className={`btn-reuse-toggle ${reuseSelections.item ? "selected" : ""}`}
                      onClick={() =>
                        setReuseSelections((prev) => ({
                          ...prev,
                          item: !prev.item,
                        }))
                      }
                    >
                      {reuseSelections.item ? "✓ Đã chọn" : "🔄 Dùng lại"}
                    </button>
                  ) : (
                    <span className="reuse-new-badge">Tạo mới</span>
                  )}
                </div>
              </div>

              <div className="reuse-section">
                <h4>2. Cửa hàng</h4>
                <div className="reuse-row">
                  <div className="reuse-item-left">
                    <div className="reuse-name">
                      {matchesFound.store?.storeName || storeName}
                    </div>
                    {matchesFound.store?.storeAddressInText && (
                      <div className="reuse-address">
                        --{matchesFound.store.storeAddressInText}--
                      </div>
                    )}
                  </div>
                  {matchesFound.store ? (
                    <button
                      type="button"
                      className={`btn-reuse-toggle ${reuseSelections.store ? "selected" : ""}`}
                      onClick={() =>
                        setReuseSelections((prev) => ({
                          ...prev,
                          store: !prev.store,
                        }))
                      }
                    >
                      {reuseSelections.store ? "✓ Đã chọn" : "🔄 Dùng lại"}
                    </button>
                  ) : (
                    <span className="reuse-new-badge">Tạo mới</span>
                  )}
                </div>
              </div>

              <div className="reuse-section">
                <h4>3. Thông tin</h4>
                {itemInformations.map((info, idx) => {
                  const m = matchesFound.infos?.[idx];
                  const isSelected = reuseSelections.infos?.[idx];
                  return (
                    <div className="reuse-row" key={idx}>
                      <div className="reuse-item-left">
                        <div className="reuse-name">
                          {formatCurrency(info.price)} {info.type}
                        </div>
                      </div>
                      {m ? (
                        <button
                          type="button"
                          className={`btn-reuse-toggle ${isSelected ? "selected" : ""}`}
                          onClick={() =>
                            setReuseSelections((prev) => ({
                              ...prev,
                              infos: {
                                ...prev.infos,
                                [idx]: !prev.infos?.[idx],
                              },
                            }))
                          }
                        >
                          {isSelected ? "✓ Đã chọn" : "🔄 Dùng lại"}
                        </button>
                      ) : (
                        <span className="reuse-new-badge">Tạo mới</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="popup-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Quay lại
              </button>
              <button
                type="button"
                className="btn-save"
                onClick={handleConfirmReuseSave}
              >
                Xác nhận Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup_AddItem;
