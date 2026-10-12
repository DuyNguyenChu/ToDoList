import { useState, useEffect, useMemo } from "react";
import { useLocation, useOutletContext, Link } from "react-router-dom";
import {
  getAllStoresItemsItemInformation,
  searchStoresItemsItemInformation,
} from "../API/API_StoresItemsItemInformation";
import {
  getAllToDoLists,
  createToDoList,
  deleteToDoList,
} from "../API/API_ToDoList";
import { useSignalREvent } from "../Hooks/useSignalR";
import { useUserLocation } from "../Hooks/useUserLocation";
import { formatCurrency } from "../utils/formatCurrency";
import Popup_UpdateItem from "../Popup/Popup_UpdateItem";
import Popup_LocationPicker from "../Popup/Popup_LocationPicker";
import "./Style/Page_StoresItemsItemInformation.css";

const getItemStoreCoords = (item) => {
  if (!item) return null;
  const lat =
    item.storeAddressInGpsLatitude ??
    item.storeAddressInGpslatitude ??
    item.StoreAddressInGpsLatitude ??
    item.StoreAddressInGpslatitude;
  const lng =
    item.storeAddressInGpsLongitude ??
    item.storeAddressInGpslongitude ??
    item.StoreAddressInGpsLongitude ??
    item.StoreAddressInGpslongitude;

  if (
    lat != null &&
    lng != null &&
    String(lat).trim() !== "" &&
    String(lng).trim() !== "" &&
    !isNaN(Number(lat)) &&
    !isNaN(Number(lng))
  ) {
    return { lat: Number(lat), lng: Number(lng) };
  }

  const gps = item.storeAddressInGps || item.StoreAddressInGps;
  if (gps && typeof gps === "string") {
    const parts = gps.split(",");
    if (parts.length === 2) {
      const pLat = parseFloat(parts[0].trim());
      const pLng = parseFloat(parts[1].trim());
      if (!isNaN(pLat) && !isNaN(pLng)) {
        return { lat: pLat, lng: pLng };
      }
    }
  }
  if (gps && typeof gps === "object" && Array.isArray(gps.coordinates)) {
    const pLng = Number(gps.coordinates[0]);
    const pLat = Number(gps.coordinates[1]);
    if (!isNaN(pLat) && !isNaN(pLng)) {
      return { lat: pLat, lng: pLng };
    }
  }
  return null;
};

const getItemPrice = (item) => {
  const price = item.itemInformationPrice ?? item.ItemInformationPrice;
  if (price == null || price === "") return Infinity;
  const num = typeof price === "number" ? price : Number(String(price).replace(/[^\d.-]/g, ""));
  return isNaN(num) ? Infinity : num;
};

const Page_StoresItemsItemInformation = () => {
  const [storesItemsItemInformation, setStoresItemsItemInformation] = useState(
    [],
  );
  const [addedItemsInToDoList, setAddedItemsInToDoList] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingStoreOnMap, setViewingStoreOnMap] = useState(null);

  const location = useLocation();
  const Outletcontext = useOutletContext();
  const user = Outletcontext?.user;
  const { userCoords, getDistanceFromUser } = useUserLocation();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener("stores-items:refresh", handleRefresh);
    return () => {
      window.removeEventListener("stores-items:refresh", handleRefresh);
    };
  }, []);

  useSignalREvent("ReceiveStoresItemsItemInformationCreated", (newItem) => {
    if (!newItem) return;
    const newId =
      newItem.storesItemsItemInformationId ||
      newItem.StoresItemsItemInformationId;
    setStoresItemsItemInformation((prev) => {
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
    setStoresItemsItemInformation((prev) =>
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
    setStoresItemsItemInformation((prev) =>
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

    async function loadData() {
      try {
        const searchParams = new URLSearchParams(location.search);
        const keyword = searchParams.get("search");

        let response;
        if (keyword) {
          response = await searchStoresItemsItemInformation(keyword, 1, 100, userCoords);
          if (!ignore) {
            setStoresItemsItemInformation(
              response.data.items || response.data.Items || [],
            );
          }
        } else {
          response = await getAllStoresItemsItemInformation(userCoords);
          if (!ignore) {
            setStoresItemsItemInformation(response.data || []);
          }
        }

        if (user) {
          const todoResponse = await getAllToDoLists(userCoords);
          const todos = todoResponse.data || [];
          const addedMap = new Map(
            todos.map((t) => [t.storesItemsItemInformationId, t.toDoListId]),
          );
          if (!ignore) {
            setAddedItemsInToDoList(addedMap);
          }
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [location.search, user, refreshTrigger, userCoords?.lat, userCoords?.lng]);

  const handleAdd = async (id) => {
    try {
      const response = await createToDoList({
        storesItemsItemInformationId: id,
        toDoListDecription: "",
      });
      const newToDoId = response.data?.toDoListId || response.data?.id;
      setAddedItemsInToDoList((prev) => new Map(prev).set(id, newToDoId));
    } catch (error) {
      console.error("Lỗi khi thêm vào ToDoList:", error);
      if (error?.response?.status !== 401) {
        alert("Không thể thêm vào danh sách cần mua. Vui lòng thử lại!");
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

  const [selectedImage, setSelectedImage] = useState(null);

  const sortedItems = useMemo(() => {
    if (!storesItemsItemInformation || storesItemsItemInformation.length === 0)
      return [];
    return [...storesItemsItemInformation].sort((a, b) => {
      const coordsA = getItemStoreCoords(a);
      const coordsB = getItemStoreCoords(b);
      const distA = getDistanceFromUser(coordsA?.lat, coordsA?.lng).distanceKm;
      const distB = getDistanceFromUser(coordsB?.lat, coordsB?.lng).distanceKm;
      const priceA = getItemPrice(a);
      const priceB = getItemPrice(b);

      if (distA != null && distB != null) {
        if (Math.abs(distA - distB) > 0.0001) {
          return distA - distB;
        }
        return priceA - priceB;
      }
      if (distA != null && distB == null) return -1;
      if (distA == null && distB != null) return 1;
      return priceA - priceB;
    });
  }, [storesItemsItemInformation, getDistanceFromUser]);

  if (loading) return <h2>Đang tải danh sách hàng hóa...</h2>;

  if (!storesItemsItemInformation || storesItemsItemInformation.length === 0)
    return <h2>Không có hàng hóa nào được tìm thấy.</h2>;
  return (
    <div className="table-responsive-container">
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
            <th>Khoảng cách</th>
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
              <td data-label="Cửa hàng" className="cell-store">
                {item.storeId || item.StoreId ? (
                  <Link
                    to={`/cua-hang/${item.storeId || item.StoreId}`}
                    className="store-link-cell"
                    title={`Xem chi tiết cửa hàng ${item.storeName || ""}`}
                  >
                    {item.storeName}
                  </Link>
                ) : (
                  item.storeName
                )}
              </td>
              <td data-label="Địa chỉ" className="cell-address">
                {item.storeAddressInText ||
                  item.StoreAddressInText ||
                  "Chưa có"}
              </td>
              <td data-label="Vị trí" className="cell-coords">
                {(() => {
                  const coords = getItemStoreCoords(item);
                  if (coords && coords.lat != null && coords.lng != null) {
                    return (
                      <button
                        type="button"
                        className="btn-view-map-coords"
                        onClick={() =>
                          setViewingStoreOnMap({
                            storeName: item.storeName || "Cửa hàng",
                            lat: coords.lat,
                            lng: coords.lng,
                            address:
                              item.storeAddressInText ||
                              item.StoreAddressInText,
                          })
                        }
                        title="Bấm để xem vị trí này trên bản đồ"
                      >
                        📍 {coords.lat}, {coords.lng}
                      </button>
                    );
                  }
                  return <span>Không có</span>;
                })()}
              </td>
              <td data-label="Khoảng cách" className="cell-distance">
                {(() => {
                  const coords = getItemStoreCoords(item);
                  const distInfo = getDistanceFromUser(
                    coords?.lat,
                    coords?.lng,
                  );
                  if (distInfo.distanceKm != null) {
                    return (
                      <span className="distance-badge has-distance">
                        🧭 {distInfo.text}
                      </span>
                    );
                  }
                  return (
                    <span className="distance-badge no-distance">
                      {distInfo.text}
                    </span>
                  );
                })()}
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

      {editingItem && (
        <Popup_UpdateItem
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}

      {viewingStoreOnMap && (
        <Popup_LocationPicker
          isOpen={Boolean(viewingStoreOnMap)}
          onClose={() => setViewingStoreOnMap(null)}
          initialLat={viewingStoreOnMap.lat}
          initialLng={viewingStoreOnMap.lng}
          initialAddress={viewingStoreOnMap.address}
          title={`Vị trí cửa hàng: ${viewingStoreOnMap.name}`}
          readOnly={true}
        />
      )}
    </div>
  );
};

export default Page_StoresItemsItemInformation;
