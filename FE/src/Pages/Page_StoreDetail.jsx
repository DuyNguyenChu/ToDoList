import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { getStoreById } from "../API/API_Store";
import { getStoresItemsByStoreId } from "../API/API_StoresItemsItemInformation";
import {
  getAllToDoLists,
  createToDoList,
  deleteToDoList,
} from "../API/API_ToDoList";
import { useSignalREvent } from "../Hooks/useSignalR";
import Popup_UpdateStore from "../Popup/Popup_UpdateStore";
import Popup_UpdateItem from "../Popup/Popup_UpdateItem";
import { showToast } from "../Components/Toast/Toast";
import { formatCurrency } from "../utils/formatCurrency";
import "./Style/Page_StoresItemsItemInformation.css";
import "./Style/Page_StoreDetail.css";

const Page_StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const Outletcontext = useOutletContext();
  const user = Outletcontext?.user;

  const searchParams = new URLSearchParams(location.search);
  const keyword = (searchParams.get("search") || "").trim();

  const [store, setStore] = useState(null);
  const [items, setItems] = useState([]);
  const [addedItemsInToDoList, setAddedItemsInToDoList] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useSignalREvent("ReceiveStoreUpdated", (updatedStore) => {
    if (!updatedStore || updatedStore.storeId !== id) return;
    setStore((prev) => (prev ? { ...prev, ...updatedStore } : updatedStore));
  });

  useEffect(() => {
    const handleRefresh = async () => {
      try {
        const itemRes = await getStoresItemsByStoreId(id);
        setItems(itemRes.data || []);
      } catch (err) {
        console.error("Lỗi làm mới vật phẩm cửa hàng:", err);
      }
    };
    window.addEventListener("stores-items:refresh", handleRefresh);
    return () => {
      window.removeEventListener("stores-items:refresh", handleRefresh);
    };
  }, [id]);

  useSignalREvent("ReceiveStoresItemsItemInformationCreated", (newItem) => {
    const itemStoreId = newItem?.storeId || newItem?.StoreId;
    if (!newItem || String(itemStoreId).toLowerCase() !== String(id).toLowerCase()) return;
    const newId =
      newItem.storesItemsItemInformationId ||
      newItem.StoresItemsItemInformationId;
    setItems((prev) => {
      if (
        prev.some(
          (i) =>
            (i.storesItemsItemInformationId ||
              i.StoresItemsItemInformationId) === newId,
        )
      ) {
        return prev;
      }
      return [newItem, ...prev];
    });
  });

  useSignalREvent("ReceiveStoresItemsItemInformationUpdated", (updatedItem) => {
    if (!updatedItem) return;
    const updatedId =
      updatedItem.storesItemsItemInformationId ||
      updatedItem.StoresItemsItemInformationId;
    setItems((prev) =>
      prev.map((i) =>
        (i.storesItemsItemInformationId ||
          i.StoresItemsItemInformationId) === updatedId
          ? { ...i, ...updatedItem }
          : i,
      ),
    );
  });

  useSignalREvent("ReceiveStoresItemsItemInformationDeleted", (deletedId) => {
    if (!deletedId) return;
    setItems((prev) =>
      prev.filter(
        (i) =>
          (i.storesItemsItemInformationId ||
            i.StoresItemsItemInformationId) !== deletedId,
      ),
    );
  });

  useSignalREvent("ReceiveToDoCreated", (todo) => {
    if (!todo?.storesItemsItemInformationId) return;
    setAddedItemsInToDoList((prev) => {
      const next = new Map(prev);
      next.set(todo.storesItemsItemInformationId, todo.toDoListId);
      return next;
    });
  });

  useSignalREvent("ReceiveToDoDeleted", (deletedTodoId) => {
    if (!deletedTodoId) return;
    setAddedItemsInToDoList((prev) => {
      const next = new Map();
      for (const [sId, tId] of prev.entries()) {
        if (tId !== deletedTodoId) {
          next.set(sId, tId);
        }
      }
      return next;
    });
  });

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [storeRes, itemsRes] = await Promise.all([
          getStoreById(id),
          getStoresItemsByStoreId(id, keyword),
        ]);

        if (!ignore) {
          setStore(storeRes.data);
          setItems(itemsRes.data || []);
        }

        if (user && !ignore) {
          const todoResponse = await getAllToDoLists();
          const todos = todoResponse.data || [];
          const addedMap = new Map(
            todos.map((t) => [t.storesItemsItemInformationId, t.toDoListId]),
          );
          setAddedItemsInToDoList(addedMap);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Lỗi khi tải chi tiết cửa hàng:", error);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchData();
    }

    return () => {
      ignore = true;
    };
  }, [id, user, keyword]);

  const handleAdd = async (storeInfoId) => {
    try {
      const response = await createToDoList({
        storesItemsItemInformationId: storeInfoId,
        toDoListDecription: "",
      });
      const newToDoId = response.data?.toDoListId || response.data?.id;
      setAddedItemsInToDoList((prev) =>
        new Map(prev).set(storeInfoId, newToDoId),
      );
    } catch (error) {
      console.error("Lỗi khi thêm vào ToDoList:", error);
      if (error?.response?.status !== 401) {
        showToast.error(
          "Không thể thêm vào danh sách cần mua. Vui lòng thử lại!",
        );
      }
    }
  };

  const handleRemove = async (storeInfoId) => {
    try {
      const todoId = addedItemsInToDoList.get(storeInfoId);
      if (todoId) {
        await deleteToDoList(todoId);
        setAddedItemsInToDoList((prev) => {
          const newMap = new Map(prev);
          newMap.delete(storeInfoId);
          return newMap;
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa khỏi ToDoList:", error);
      if (error?.response?.status !== 401) {
        alert("Không thể xóa khỏi danh sách cần mua. Vui lòng thử lại!");
      }
    }
  };

  const removeVietnameseTones = (str) => {
    if (!str) return "";
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  const matchesKeyword = (text, kw) => {
    if (!kw) return true;
    if (!text) return false;
    const s = String(text).toLowerCase();
    const k = String(kw).toLowerCase();
    if (s.includes(k)) return true;
    return removeVietnameseTones(s).includes(removeVietnameseTones(k));
  };

  const getItemPrice = (item) => {
    const price = item.itemInformationPrice ?? item.ItemInformationPrice;
    if (price == null || price === "") return Infinity;
    const num = typeof price === "number" ? price : Number(String(price).replace(/[^\d.-]/g, ""));
    return isNaN(num) ? Infinity : num;
  };

  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    if (!keyword) return items;
    return items.filter((item) => {
      return (
        matchesKeyword(item.itemName, keyword) ||
        matchesKeyword(item.itemInformationItemType, keyword) ||
        matchesKeyword(item.itemInformationPrice, keyword)
      );
    });
  }, [items, keyword]);

  const sortedItems = useMemo(() => {
    if (!filteredItems || filteredItems.length === 0) return [];
    return [...filteredItems].sort((a, b) => getItemPrice(a) - getItemPrice(b));
  }, [filteredItems]);

  const formatGps = (gps, lat, lng) => {
    if (lat != null && lng != null) return `${lat}, ${lng}`;
    if (!gps) return "Không có";
    if (typeof gps === "object") {
      if (Array.isArray(gps.coordinates)) {
        return `${gps.coordinates[1]}, ${gps.coordinates[0]}`;
      }
      return JSON.stringify(gps);
    }
    return String(gps);
  };

  if (loading) return <h2>Đang tải thông tin cửa hàng...</h2>;

  if (!store) return <h2>Không tìm thấy thông tin cửa hàng.</h2>;

  return (
    <div className="store-detail-container">
      {selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="close-btn" onClick={() => setSelectedImage(null)}>
              &times;
            </span>
            <img src={selectedImage} alt="Phóng to" className="zoomed-image" />
          </div>
        </div>
      )}

      <div className="store-detail-top-nav">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/cua-hang")}
        >
          ← Quay lại danh sách
        </button>
        <button
          type="button"
          className="btn-edit-store"
          onClick={() => setShowUpdatePopup(true)}
        >
          Chỉnh sửa
        </button>
      </div>

      <div className="store-detail-card">
        <div className="store-banner-wrapper">
          {store.storeImg ? (
            <img
              src={store.storeImg}
              alt={store.storeName}
              className="store-banner-img"
              onClick={() => setSelectedImage(store.storeImg)}
            />
          ) : (
            <div className="store-banner-placeholder">
              <span>Không có ảnh cửa hàng</span>
            </div>
          )}
        </div>

        <div className="store-info-grid">
          <div className="store-info-col left-col">
            <div className="store-name-title">{store.storeName}</div>
            <div>
              <span
                className={`store-status-badge ${
                  store.isActive ? "active" : "inactive"
                }`}
              >
                {store.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
              </span>
            </div>
          </div>
          <div className="store-info-col right-col">
            <div className="store-meta-row">
              <span className="meta-label">Địa chỉ:</span>
              <span className="meta-value">
                {store.storeAddressInText || "Chưa có địa chỉ"}
              </span>
            </div>
            <div className="store-meta-row">
              <span className="meta-label">GPS:</span>
              <span className="meta-value">
                {formatGps(
                  store.storeAddressInGps,
                  store.storeAddressInGpsLatitude ??
                    store.storeAddressInGpslatitude,
                  store.storeAddressInGpsLongitude ??
                    store.storeAddressInGpslongitude,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="store-products-section">
        <div className="store-products-header">
          <div className="store-products-title-row">
            <h3>Sản phẩm</h3>
            {keyword && (
              <div className="search-status-box">
                <span>
                  Kết quả cho: <strong>"{keyword}"</strong> ({sortedItems.length} sản phẩm)
                </span>
                <button
                  type="button"
                  className="btn-clear-store-search"
                  onClick={() => navigate(location.pathname)}
                  title="Xóa tìm kiếm"
                >
                  ✕ Xóa lọc
                </button>
              </div>
            )}
          </div>
        </div>

        {!items || items.length === 0 ? (
          <p className="empty-products-notice">
            Cửa hàng hiện chưa có sản phẩm nào.
          </p>
        ) : sortedItems.length === 0 ? (
          <p className="empty-products-notice">
            Không tìm thấy sản phẩm nào phù hợp với từ khóa "{keyword}".
          </p>
        ) : (
          <div className="table-responsive-container">
            <table className="stores-items-table">
              <thead>
                <tr>
                  <th>Hình Ảnh</th>
                  <th>Tên Món Hàng</th>
                  <th>Loại</th>
                  <th>Giá Tiền</th>
                  <th>Cửa hàng</th>
                  <th>Địa chỉ</th>
                  <th>Vị trí</th>
                  {user && <th>Hành động</th>}
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => (
                  <tr key={item.storesItemsItemInformationId}>
                    <td data-label="Hình Ảnh" className="cell-img">
                      {item.itemImg ? (
                        <img
                          src={item.itemImg}
                          alt={item.itemName}
                          className="item-thumbnail"
                          onClick={() => setSelectedImage(item.itemImg)}
                        />
                      ) : (
                        <span>Không có ảnh</span>
                      )}
                    </td>
                    <td data-label="Tên Món Hàng" className="cell-name">{item.itemName}</td>
                    <td data-label="Loại" className="cell-type">{item.itemInformationItemType}</td>
                    <td data-label="Giá Tiền" className="cell-price">{formatCurrency(item.itemInformationPrice)} VNĐ</td>
                    <td data-label="Cửa hàng" className="cell-store">{item.storeName}</td>
                    <td data-label="Địa chỉ" className="cell-address">
                      {item.storeAddressInText ||
                        item.StoreAddressInText ||
                        "Chưa có"}
                    </td>
                    <td data-label="Vị trí" className="cell-coords">
                      {formatGps(
                        item.storeAddressInGps || item.StoreAddressInGps,
                        item.storeAddressInGpsLatitude ??
                          item.storeAddressInGpslatitude,
                        item.storeAddressInGpsLongitude ??
                          item.storeAddressInGpslongitude,
                      )}
                    </td>
                    {user && (
                      <td data-label="Hành động" className="action-cell">
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="btn-action btn-edit"
                            onClick={() => setEditingItem(item)}
                          >
                            chỉnh sửa
                          </button>
                          {addedItemsInToDoList.has(
                            item.storesItemsItemInformationId,
                          ) ? (
                            <button
                              type="button"
                              className="btn-action btn-added"
                              onClick={() =>
                                handleRemove(item.storesItemsItemInformationId)
                              }
                            >
                              Đã thêm
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-action btn-add"
                              onClick={() =>
                                handleAdd(item.storesItemsItemInformationId)
                              }
                            >
                              Thêm
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUpdatePopup && (
        <Popup_UpdateStore
          store={store}
          onClose={() => setShowUpdatePopup(false)}
          onSuccess={async (updatedData) => {
            setShowUpdatePopup(false);
            if (updatedData?.type === "delete") {
              navigate("/cua-hang");
              return;
            }
            try {
              const storeRes = await getStoreById(id);
              setStore(storeRes.data);
            } catch (error) {
              console.error("Lỗi khi cập nhật lại thông tin cửa hàng:", error);
            }
          }}
        />
      )}

      {editingItem && (
        <Popup_UpdateItem
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={async () => {
            setEditingItem(null);
            try {
              const itemsRes = await getStoresItemsByStoreId(id);
              setItems(itemsRes.data || []);
            } catch (err) {
              console.error("Lỗi làm mới danh sách sản phẩm:", err);
            }
          }}
        />
      )}
    </div>
  );
};

export default Page_StoreDetail;
