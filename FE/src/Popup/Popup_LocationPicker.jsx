import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  getAddressFromCoordinates,
  getCoordinatesFromAddress,
  getCurrentBrowserPosition,
} from "../API/API_Map";
import { showToast } from "../Components/Toast/Toast";
import "./Style/Popup_LocationPicker.css";

const createMarkerIcon = () => {
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="position: relative; transform: translate(-50%, -100%);">
        <svg width="34" height="44" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
          <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 12 32 12 32C12 32 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="#ef4444"/>
          <circle cx="12" cy="12" r="5" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const MapEvents = ({ onMapClick, readOnly }) => {
  useMapEvents({
    click(e) {
      if (!readOnly) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const MapFlyTo = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null && center[1] != null) {
      map.flyTo(center, Math.max(map.getZoom(), 15), { duration: 1 });
    }
  }, [center, map]);
  return null;
};

const DEFAULT_CENTER = [10.762622, 106.660172];

const Popup_LocationPicker = ({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
  initialAddress,
  title,
  readOnly = false,
}) => {
  const getInitialCoords = useCallback(() => {
    const lat = initialLat ? parseFloat(initialLat) : null;
    const lng = initialLng ? parseFloat(initialLng) : null;
    if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }
    return DEFAULT_CENTER;
  }, [initialLat, initialLng]);

  const [selectedPos, setSelectedPos] = useState(getInitialCoords);
  const [mapCenter, setMapCenter] = useState(getInitialCoords);
  const [previewAddress, setPreviewAddress] = useState(initialAddress || "");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locatingDevice, setLocatingDevice] = useState(false);
  const markerRef = useRef(null);

  const markerIcon = useMemo(() => createMarkerIcon(), []);

  const fetchAddress = useCallback(async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const res = await getAddressFromCoordinates(lat, lng);
      setPreviewAddress(res?.displayName || "Không tìm thấy địa chỉ cụ thể");
    } catch (err) {
      console.warn("Lỗi dịch tọa độ sang địa chỉ:", err);
      setPreviewAddress("Không thể tải địa chỉ từ tọa độ này.");
    } finally {
      setLoadingAddress(false);
    }
  }, []);

  const [prevInitial, setPrevInitial] = useState({ initialLat, initialLng });
  if (initialLat !== prevInitial.initialLat || initialLng !== prevInitial.initialLng) {
    setPrevInitial({ initialLat, initialLng });
    const nextCoords = getInitialCoords();
    setSelectedPos(nextCoords);
    setMapCenter(nextCoords);
    if (initialAddress) {
      setPreviewAddress(initialAddress);
    }
  }

  useEffect(() => {
    let ignore = false;
    if (!isOpen) return;
    if (!initialAddress && selectedPos) {
      getAddressFromCoordinates(selectedPos[0], selectedPos[1])
        .then((res) => {
          if (!ignore) {
            setPreviewAddress(res?.displayName || "Không tìm thấy địa chỉ cụ thể");
            setLoadingAddress(false);
          }
        })
        .catch((err) => {
          if (!ignore) {
            console.warn("Lỗi dịch tọa độ sang địa chỉ:", err);
            setPreviewAddress("Không thể tải địa chỉ từ tọa độ này.");
            setLoadingAddress(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, initialAddress, selectedPos]);

  const handleMapClick = (lat, lng) => {
    const formattedLat = parseFloat(lat.toFixed(6));
    const formattedLng = parseFloat(lng.toFixed(6));
    const newPos = [formattedLat, formattedLng];
    setSelectedPos(newPos);
    fetchAddress(formattedLat, formattedLng);
  };

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const latlng = marker.getLatLng();
      const formattedLat = parseFloat(latlng.lat.toFixed(6));
      const formattedLng = parseFloat(latlng.lng.toFixed(6));
      const newPos = [formattedLat, formattedLng];
      setSelectedPos(newPos);
      fetchAddress(formattedLat, formattedLng);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await getCoordinatesFromAddress(searchQuery.trim());
      if (res) {
        const newPos = [res.lat, res.lng];
        setSelectedPos(newPos);
        setMapCenter(newPos);
        setPreviewAddress(res.displayName || searchQuery);
      } else {
        showToast.warning("Không tìm thấy kết quả phù hợp với địa chỉ tìm kiếm.");
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm địa chỉ:", err);
      showToast.error("Đã xảy ra lỗi khi tìm kiếm địa chỉ.");
    } finally {
      setSearching(false);
    }
  };

  const handleGetDeviceLocation = async () => {
    setLocatingDevice(true);
    try {
      const pos = await getCurrentBrowserPosition();
      const newPos = [pos.lat, pos.lng];
      setSelectedPos(newPos);
      setMapCenter(newPos);
      fetchAddress(pos.lat, pos.lng);
    } catch (err) {
      showToast.error(err.message || "Không thể lấy vị trí hiện tại của thiết bị.");
    } finally {
      setLocatingDevice(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedPos) {
      showToast.warning("Vui lòng chọn một vị trí trên bản đồ.");
      return;
    }
    if (onConfirm) {
      onConfirm({
        lat: selectedPos[0],
        lng: selectedPos[1],
        address: previewAddress,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="location-picker-overlay" onClick={onClose}>
      <div
        className="location-picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="location-picker-header">
          <h3 className="location-picker-title">
            <span>🗺️</span> {title || "Chọn vị trí trên bản đồ"}
          </h3>
          <button
            type="button"
            className="location-picker-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSearch} className="location-picker-search-bar">
          <div className="location-search-input-wrap">
            <span className="location-search-icon">🔍</span>
            <input
              type="text"
              className="location-search-input"
              placeholder="Tìm kiếm địa điểm, số nhà, tên đường, tỉnh/thành..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={searching}
            />
          </div>
          <button
            type="submit"
            className="btn-search-loc"
            disabled={searching || !searchQuery.trim()}
          >
            {searching ? "Đang tìm..." : "Tìm"}
          </button>
          <button
            type="button"
            className="btn-current-loc-map"
            onClick={handleGetDeviceLocation}
            disabled={locatingDevice}
            title="Lấy vị trí GPS hiện tại của bạn"
          >
            {locatingDevice ? "⏳ Đang định vị..." : "📍 Vị trí của tôi"}
          </button>
        </form>

        <div className="location-picker-map-container">
          <div className="map-help-hint">
            {readOnly
              ? "📍 Vị trí trên bản đồ"
              : "💡 Click hoặc kéo thả cắm cờ để chọn vị trí"}
          </div>
          <MapContainer
            center={mapCenter}
            zoom={15}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents onMapClick={handleMapClick} readOnly={readOnly} />
            <MapFlyTo center={mapCenter} />
            {selectedPos && (
              <Marker
                position={selectedPos}
                icon={markerIcon}
                draggable={!readOnly}
                ref={markerRef}
                eventHandlers={{
                  dragend: handleMarkerDragEnd,
                }}
              />
            )}
          </MapContainer>
        </div>

        <div className="location-picker-footer-info">
          <div className="coords-badge-row">
            <span className="coords-badge">
              🌐 Vĩ độ: {selectedPos ? selectedPos[0] : "--"}
            </span>
            <span className="coords-badge">
              🌐 Kinh độ: {selectedPos ? selectedPos[1] : "--"}
            </span>
          </div>

          <div
            className={`resolved-address-box ${loadingAddress ? "loading" : ""}`}
          >
            {loadingAddress ? (
              <>
                <div className="mini-spinner"></div>
                <span>Đang tra cứu địa chỉ từ OpenStreetMap...</span>
              </>
            ) : (
              <>
                <span>📍</span>
                <span>
                  <strong>Địa chỉ: </strong>
                  {previewAddress || "Chưa xác định"}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="location-picker-footer-actions">
          {readOnly ? (
            <button
              type="button"
              className="btn-picker-confirm"
              onClick={onClose}
            >
              Đóng
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-picker-cancel"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-picker-confirm"
                onClick={handleConfirm}
                disabled={!selectedPos || loadingAddress}
              >
                ✓ Xác nhận vị trí này
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup_LocationPicker;
