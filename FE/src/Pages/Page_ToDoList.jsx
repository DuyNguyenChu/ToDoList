import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import {
  getAllToDoLists,
  searchToDoLists,
  deleteToDoList,
  updateToDoList,
} from "../API/API_ToDoList";
import { useSignalREvent } from "../Hooks/useSignalR";
import { useUserLocation } from "../Hooks/useUserLocation";
import { formatCurrency } from "../utils/formatCurrency";
import Popup_LocationPicker from "../Popup/Popup_LocationPicker";
import "./Style/Page_ToDoList.css";

const Page_ToDoList = () => {
  const [toDoLists, setToDoLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [viewingStoreOnMap, setViewingStoreOnMap] = useState(null);

  const location = useLocation();
  const Outletcontext = useOutletContext();
  const user = Outletcontext?.user;
  const { userCoords, getDistanceFromUser } = useUserLocation();

  useSignalREvent("ReceiveToDoCreated", (newToDo) => {
    if (!newToDo) return;
    setToDoLists((prev) => {
      if (prev.some((item) => item.toDoListId === newToDo.toDoListId)) {
        return prev;
      }
      return [newToDo, ...prev];
    });
  });

  useSignalREvent("ReceiveToDoUpdated", (updatedToDo) => {
    if (!updatedToDo) return;
    setToDoLists((prev) =>
      prev.map((item) =>
        item.toDoListId === updatedToDo.toDoListId
          ? { ...item, ...updatedToDo }
          : item,
      ),
    );
  });

  useSignalREvent("ReceiveToDoDeleted", (deletedId) => {
    if (!deletedId) return;
    setToDoLists((prev) =>
      prev.filter((item) => item.toDoListId !== deletedId),
    );
  });

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const keyword = searchParams.get("search");

        let response;
        if (keyword) {
          response = await searchToDoLists(keyword, 1, 100, userCoords);
          if (!ignore) {
            setToDoLists(response.data.items || response.data.Items || []);
          }
        } else {
          response = await getAllToDoLists(userCoords);
          if (!ignore) {
            setToDoLists(response.data || []);
          }
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu ToDoList:", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [location.search, userCoords?.lat, userCoords?.lng]);

  const formatGps = (item) => {
    const lat =
      item.storeAddressInGpsLatitude ??
      item.storeAddressInGpslatitude ??
      item.StoreAddressInGpsLatitude;
    const lng =
      item.storeAddressInGpsLongitude ??
      item.storeAddressInGpslongitude ??
      item.StoreAddressInGpsLongitude;
    if (lat != null && lng != null) {
      return `${lat}, ${lng}`;
    }
    const gps = item.storeAddressInGps || item.StoreAddressInGps;
    if (!gps) return "Không có";
    if (typeof gps === "object") {
      if (Array.isArray(gps.coordinates)) {
        return `${gps.coordinates[1]}, ${gps.coordinates[0]}`;
      }
      return JSON.stringify(gps);
    }
    return String(gps);
  };

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

  const sortedToDoLists = useMemo(() => {
    if (!toDoLists || toDoLists.length === 0) return [];
    return [...toDoLists].sort((a, b) => {
      const coordsA = getItemStoreCoords(a);
      const coordsB = getItemStoreCoords(b);
      const distA = getDistanceFromUser(coordsA?.lat, coordsA?.lng).distanceKm;
      const distB = getDistanceFromUser(coordsB?.lat, coordsB?.lng).distanceKm;

      if (distA != null && distB != null) {
        if (Math.abs(distA - distB) > 0.0001) {
          return distA - distB;
        }
        return getItemPrice(a) - getItemPrice(b);
      }
      if (distA != null && distB == null) return -1;
      if (distA == null && distB != null) return 1;
      return getItemPrice(a) - getItemPrice(b);
    });
  }, [toDoLists, getDistanceFromUser]);

  const handleToggleDone = async (item) => {
    const nextStatus = !item.isDone;
    setToDoLists((prev) =>
      prev.map((t) =>
        t.toDoListId === item.toDoListId ? { ...t, isDone: nextStatus } : t,
      ),
    );

    try {
      await updateToDoList(item.toDoListId, {
        toDoListId: item.toDoListId,
        storesItemsItemInformationId: item.storesItemsItemInformationId,
        toDoListDecription: item.toDoListDecription || "",
        isDone: nextStatus,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái ToDoList:", error);
      setToDoLists((prev) =>
        prev.map((t) =>
          t.toDoListId === item.toDoListId ? { ...t, isDone: item.isDone } : t,
        ),
      );
      if (error?.response?.status !== 401) {
        alert("Không thể cập nhật trạng thái. Vui lòng thử lại!");
      }
    }
  };

  const handleSaveNote = async (item) => {
    setEditingNoteId(null);
    const newDescription = noteText.trim();
    if (newDescription === (item.toDoListDecription || "").trim()) {
      return;
    }

    setToDoLists((prev) =>
      prev.map((t) =>
        t.toDoListId === item.toDoListId
          ? { ...t, toDoListDecription: newDescription }
          : t,
      ),
    );

    try {
      await updateToDoList(item.toDoListId, {
        toDoListId: item.toDoListId,
        storesItemsItemInformationId: item.storesItemsItemInformationId,
        toDoListDecription: newDescription,
        isDone: item.isDone,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật ghi chú:", error);
      setToDoLists((prev) =>
        prev.map((t) =>
          t.toDoListId === item.toDoListId
            ? { ...t, toDoListDecription: item.toDoListDecription }
            : t,
        ),
      );
      if (error?.response?.status !== 401) {
        alert("Không thể cập nhật ghi chú. Vui lòng thử lại!");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteToDoList(id);
      setToDoLists((prev) => prev.filter((item) => item.toDoListId !== id));
    } catch (error) {
      console.error("Lỗi khi xóa khỏi ToDoList:", error);
      if (error?.response?.status !== 401) {
        alert("Không thể xóa vật phẩm. Vui lòng thử lại!");
      }
    }
  };

  if (loading) return <h2>Đang tải danh sách cần mua...</h2>;

  if (!toDoLists || toDoLists.length === 0)
    return <h2>Không có vật phẩm nào trong danh sách cần mua.</h2>;

  return (
    <div className="table-responsive-container">
      {toDoLists.length > 0 && (
        <div className="todolist-summary-bar">
          <div className="summary-item">
            <span className="summary-label">Tổng món:</span>
            <span className="summary-value">{toDoLists.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Đã mua:</span>
            <span className="summary-value done-count">
              {toDoLists.filter((t) => t.isDone).length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Chưa mua:</span>
            <span className="summary-value pending-count">
              {toDoLists.filter((t) => !t.isDone).length}
            </span>
          </div>
          <div className="summary-item total-price-item">
            <span className="summary-label">Ước tính:</span>
            <span className="summary-value total-price-value">
              {formatCurrency(
                toDoLists[0]?.totalPrice ?? toDoLists[0]?.TotalPrice ?? 0
              )}{" "}
              VNĐ
            </span>
          </div>
        </div>
      )}

      <table className="stores-table">
        <thead>
          <tr>
            <th className="col-stt">STT</th>
            <th>Tên Món Hàng</th>
            <th>Cửa hàng</th>
            <th>Địa chỉ</th>
            <th>Vị trí</th>
            <th>Khoảng cách</th>
            <th>Loại</th>
            <th>Giá Tiền</th>
            <th>Trạng thái</th>
            {user && <th className="col-action-delete"></th>}
          </tr>
        </thead>
        <tbody>
          {sortedToDoLists.map((item, index) => {
            const isAlt = index % 2 === 1;
            const rowClass = `${item.isDone ? "item-done" : ""} ${isAlt ? "row-alt" : ""}`;

            return (
              <React.Fragment key={item.toDoListId}>
                <tr className={`item-main-row ${rowClass}`}>
                  <td data-label="STT" className="stt-cell">{index + 1}</td>
                  <td data-label="Tên Món Hàng" className="cell-name">{item.itemName}</td>
                  <td data-label="Cửa hàng" className="cell-store">{item.storeName}</td>
                  <td data-label="Địa chỉ" className="cell-address">
                    {item.storeAddressInText ||
                      item.StoreAddressInText ||
                      "Chưa có"}
                  </td>
                  <td data-label="Vị trí" className="cell-coords">
                    {(() => {
                      const coords = getItemStoreCoords(item);
                      if (coords) {
                        return (
                          <button
                            type="button"
                            className="btn-view-map-coords"
                            onClick={() =>
                              setViewingStoreOnMap({
                                name:
                                  item.storeName ||
                                  item.StoreName ||
                                  "Cửa hàng",
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
                      return <span>{formatGps(item)}</span>;
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
                  <td data-label="Loại" className="cell-type">{item.itemInformationItemType}</td>
                  <td data-label="Giá Tiền" className="cell-price">{formatCurrency(item.itemInformationPrice)} VNĐ</td>
                  <td data-label="Trạng thái" className="status-cell">
                    <label className="checkbox-status-wrapper">
                      <span
                        className={`status-text ${item.isDone ? "done" : "pending"}`}
                      >
                        {item.isDone ? "Đã mua" : "Chưa mua"}
                      </span>
                      <input
                        type="checkbox"
                        className="status-checkbox"
                        checked={item.isDone}
                        onChange={() => handleToggleDone(item)}
                        disabled={!user}
                      />
                    </label>
                  </td>
                  {user && (
                    <td data-label="Xóa" className="action-delete-cell">
                      <button
                        type="button"
                        className="btn-delete-todo"
                        title="Xóa vật phẩm khỏi danh sách cần mua"
                        onClick={() => handleDelete(item.toDoListId)}
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>

                <tr className={`item-note-row ${rowClass}`}>
                  <td colSpan={user ? 10 : 9} className="note-cell">
                    <div className="note-wrapper">
                      <span className="note-label">Ghi chú:</span>
                      {editingNoteId === item.toDoListId ? (
                        <input
                          type="text"
                          className="note-input"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          onBlur={() => handleSaveNote(item)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveNote(item);
                            if (e.key === "Escape") setEditingNoteId(null);
                          }}
                          autoFocus
                          placeholder="Nhập ghi chú..."
                        />
                      ) : (
                        <span
                          className="note-text"
                          onClick={() => {
                            if (user) {
                              setEditingNoteId(item.toDoListId);
                              setNoteText(item.toDoListDecription || "");
                            }
                          }}
                          title={user ? "Bấm để chỉnh sửa ghi chú" : ""}
                        >
                          {item.toDoListDecription
                            ? item.toDoListDecription
                            : "Không có"}
                          {user && <span className="note-edit-hint"> ✎</span>}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

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

export default Page_ToDoList;
