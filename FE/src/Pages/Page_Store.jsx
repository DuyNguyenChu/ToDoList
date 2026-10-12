import { useState, useEffect, useMemo } from "react";
import { useLocation, useOutletContext, useNavigate } from "react-router-dom";
import { getAllStores, searchStores } from "../API/API_Store";
import { useSignalREvent } from "../Hooks/useSignalR";
import { useUserLocation } from "../Hooks/useUserLocation";
import { matchesKeyword } from "../utils/vietnameseHelper";
import Popup_UpdateStore from "../Popup/Popup_UpdateStore";
import Popup_LocationPicker from "../Popup/Popup_LocationPicker";
import "./Style/Page_Store.css";

const getStoreCoords = (storeObj) => {
  if (!storeObj) return null;
  const lat =
    storeObj.storeAddressInGpsLatitude ??
    storeObj.storeAddressInGpslatitude ??
    storeObj.StoreAddressInGpsLatitude ??
    storeObj.StoreAddressInGpslatitude;
  const lng =
    storeObj.storeAddressInGpsLongitude ??
    storeObj.storeAddressInGpslongitude ??
    storeObj.StoreAddressInGpsLongitude ??
    storeObj.StoreAddressInGpslongitude;

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

  const gps = storeObj.storeAddressInGps || storeObj.StoreAddressInGps;
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

const Page_Store = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStore, setEditingStore] = useState(null);
  const [viewingStoreOnMap, setViewingStoreOnMap] = useState(null);

  const location = useLocation();
  const Outletcontext = useOutletContext();
  const user = Outletcontext?.user;
  const { userCoords, getDistanceFromUser } = useUserLocation();

  const searchParams = new URLSearchParams(location.search);
  const keyword = (searchParams.get("search") || "").trim();

  useSignalREvent("ReceiveStoreCreated", (newStore) => {
    if (!newStore) return;
    setStores((prev) => {
      if (prev.some((s) => s.storeId === newStore.storeId)) return prev;
      return [newStore, ...prev];
    });
  });

  useSignalREvent("ReceiveStoreUpdated", (updatedStore) => {
    if (!updatedStore) return;
    setStores((prev) =>
      prev.map((s) =>
        s.storeId === updatedStore.storeId ? { ...s, ...updatedStore } : s
      )
    );
  });

  useSignalREvent("ReceiveStoreDeleted", (deletedId) => {
    if (!deletedId) return;
    setStores((prev) => prev.filter((s) => s.storeId !== deletedId));
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
          try {
            response = await searchStores(keyword, 1, 100, userCoords);
            if (!ignore && response?.data) {
              setStores(response.data.items || response.data.Items || response.data || []);
              return;
            }
          } catch (searchErr) {
            console.warn("Tìm kiếm máy chủ không thành công, dùng dữ liệu đầy đủ:", searchErr);
          }
        }

        response = await getAllStores(userCoords);
        if (!ignore) {
          setStores(response.data || []);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu cửa hàng:", error);
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

  const [selectedImage, setSelectedImage] = useState(null);

  const formatGps = (storeObj) => {
    const lat =
      storeObj.storeAddressInGpsLatitude ??
      storeObj.storeAddressInGpslatitude ??
      storeObj.StoreAddressInGpsLatitude;
    const lng =
      storeObj.storeAddressInGpsLongitude ??
      storeObj.storeAddressInGpslongitude ??
      storeObj.StoreAddressInGpsLongitude;
    if (lat != null && lng != null) {
      return `${lat}, ${lng}`;
    }
    const gps = storeObj.storeAddressInGps || storeObj.StoreAddressInGps;
    if (!gps) return "Không có";
    if (typeof gps === "object") {
      if (Array.isArray(gps.coordinates)) {
        return `${gps.coordinates[1]}, ${gps.coordinates[0]}`;
      }
      return JSON.stringify(gps);
    }
    return String(gps);
  };

  const filteredStores = useMemo(() => {
    if (!stores || stores.length === 0) return [];
    if (!keyword) return stores;
    return stores.filter((s) => {
      return (
        matchesKeyword(s.storeName, keyword) ||
        matchesKeyword(s.storeAddressInText, keyword)
      );
    });
  }, [stores, keyword]);

  const sortedStores = useMemo(() => {
    if (!filteredStores || filteredStores.length === 0) return [];
    return [...filteredStores].sort((a, b) => {
      const coordsA = getStoreCoords(a);
      const coordsB = getStoreCoords(b);
      const distA = getDistanceFromUser(coordsA?.lat, coordsA?.lng).distanceKm;
      const distB = getDistanceFromUser(coordsB?.lat, coordsB?.lng).distanceKm;

      if (distA != null && distB != null) {
        if (Math.abs(distA - distB) > 0.0001) {
          return distA - distB;
        }
        return (a.storeName || "").localeCompare(b.storeName || "");
      }
      if (distA != null && distB == null) return -1;
      if (distA == null && distB != null) return 1;
      return (a.storeName || "").localeCompare(b.storeName || "");
    });
  }, [filteredStores, getDistanceFromUser]);

  if (loading) return <h2>Đang tải danh sách cửa hàng...</h2>;

  if (!filteredStores || filteredStores.length === 0)
    return <h2>Không có cửa hàng nào được tìm thấy.</h2>;

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

      <table className="stores-table">
        <thead>
          <tr>
            <th>Hình Ảnh</th>
            <th>Tên Cửa hàng</th>
            <th>Địa chỉ</th>
            <th>Vị trí</th>
            <th>Khoảng cách</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {sortedStores.map((store) => (
            <tr key={store.storeId}>
              <td data-label="Hình Ảnh" className="cell-img">
                {store.storeImg ? (
                  <img
                    src={store.storeImg}
                    alt={store.storeName}
                    className="item-thumbnail"
                    onClick={() => setSelectedImage(store.storeImg)}
                  />
                ) : (
                  <span>Không có ảnh</span>
                )}
              </td>
              <td data-label="Tên Cửa hàng" className="cell-name">{store.storeName}</td>
              <td data-label="Địa chỉ" className="cell-address">{store.storeAddressInText || "Chưa có"}</td>
              <td data-label="Vị trí" className="cell-coords">
                {(() => {
                  const coords = getStoreCoords(store);
                  const gpsText = formatGps(store);
                  if (coords && gpsText !== "Không có") {
                    return (
                      <button
                        type="button"
                        className="btn-view-map-coords"
                        onClick={() =>
                          setViewingStoreOnMap({
                            storeName: store.storeName,
                            lat: coords.lat,
                            lng: coords.lng,
                            address: store.storeAddressInText,
                          })
                        }
                        title="Bấm để xem vị trí này trên bản đồ"
                      >
                        📍 {gpsText}
                      </button>
                    );
                  }
                  return <span>{gpsText}</span>;
                })()}
              </td>
              <td data-label="Khoảng cách" className="cell-distance">
                {(() => {
                  const coords = getStoreCoords(store);
                  const distInfo = getDistanceFromUser(coords?.lat, coords?.lng);
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
              <td data-label="Trạng thái" className="cell-status">
                <span
                  className={`store-status-badge ${
                    store.isActive ? "active" : "inactive"
                  }`}
                >
                  {store.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                </span>
              </td>
              <td data-label="Hành động" className="action-cell">
                <div className="store-action-buttons">
                  <button
                    type="button"
                    className="btn-store-view"
                    onClick={() => navigate(`/cua-hang/${store.storeId}`)}
                  >
                    Xem
                  </button>
                  {user && (
                    <button
                      type="button"
                      className="btn-store-edit"
                      onClick={() => setEditingStore(store)}
                    >
                      Sửa
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingStore && (
        <Popup_UpdateStore
          store={editingStore}
          onClose={() => setEditingStore(null)}
          onSuccess={(updatedData) => {
            if (updatedData?.type === "delete") {
              setStores((prevStores) =>
                prevStores.filter((s) => s.storeId !== editingStore.storeId),
              );
            } else {
              setStores((prevStores) =>
                prevStores.map((s) =>
                  s.storeId === editingStore.storeId
                    ? { ...s, ...updatedData }
                    : s,
                ),
              );
            }
            setEditingStore(null);
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
          title={`Vị trí cửa hàng: ${viewingStoreOnMap.storeName}`}
          readOnly={true}
        />
      )}
    </div>
  );
};

export default Page_Store;
