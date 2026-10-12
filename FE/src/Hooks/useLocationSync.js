import { useState, useEffect, useRef, useCallback } from "react";
import {
  getAddressFromCoordinates,
  getCoordinatesFromAddress,
  getCurrentBrowserPosition,
} from "../API/API_Map";

export const useLocationSync = ({
  initialAddress = "",
  initialLat = "",
  initialLng = "",
  debounceTime = 700,
} = {}) => {
  const [address, setAddress] = useState(initialAddress || "");
  const [latitude, setLatitude] = useState(initialLat ?? "");
  const [longitude, setLongitude] = useState(initialLng ?? "");
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  const sourceRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const setInitialValues = useCallback(({ addr, lat, lng }) => {
    sourceRef.current = null;
    if (addr !== undefined) setAddress(addr || "");
    if (lat !== undefined) setLatitude(lat ?? "");
    if (lng !== undefined) setLongitude(lng ?? "");
  }, []);

  const handleAddressChange = (newAddr) => {
    sourceRef.current = "user-address";
    setAddress(newAddr);
  };

  useEffect(() => {
    if (sourceRef.current !== "user-address") return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = address.trim();
    if (!trimmed || trimmed.length < 3) {
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsGeocoding(true);
      setSyncStatus("Đang tra cứu tọa độ GPS từ địa chỉ...");
      try {
        const result = await getCoordinatesFromAddress(trimmed);
        if (result && sourceRef.current === "user-address") {
          setLatitude(result.lat);
          setLongitude(result.lng);
          setSyncStatus("Đã tự động cập nhật tọa độ GPS.");
          setTimeout(() => setSyncStatus(""), 3500);
        }
      } catch (err) {
        console.warn("Lỗi geocoding từ địa chỉ:", err);
      } finally {
        setIsGeocoding(false);
        sourceRef.current = null;
      }
    }, debounceTime);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [address, debounceTime]);

  const handleGetCurrentLocation = async () => {
    setIsLocating(true);
    setSyncStatus("Đang định vị GPS từ thiết bị...");
    try {
      const pos = await getCurrentBrowserPosition();
      sourceRef.current = "gps";
      setLatitude(pos.lat);
      setLongitude(pos.lng);

      setIsReverseGeocoding(true);
      setSyncStatus("Đang dịch tọa độ GPS sang địa chỉ chi tiết...");
      try {
        const addrRes = await getAddressFromCoordinates(pos.lat, pos.lng);
        if (addrRes?.displayName) {
          setAddress(addrRes.displayName);
          setSyncStatus("Đã đồng bộ địa chỉ chi tiết từ GPS thành công!");
          setTimeout(() => setSyncStatus(""), 3500);
        }
      } catch (err) {
        console.warn("Lỗi dịch tọa độ sang địa chỉ:", err);
      } finally {
        setIsReverseGeocoding(false);
        sourceRef.current = null;
      }
    } catch (err) {
      alert(err.message || "Không thể lấy vị trí hiện tại.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleMapConfirm = async ({ lat, lng, address: mapAddr }) => {
    sourceRef.current = "map";
    setLatitude(lat);
    setLongitude(lng);

    if (mapAddr && mapAddr.trim()) {
      setAddress(mapAddr);
      sourceRef.current = null;
      setSyncStatus("Đã chọn vị trí và đồng bộ địa chỉ từ bản đồ!");
      setTimeout(() => setSyncStatus(""), 3500);
    } else {
      setIsReverseGeocoding(true);
      setSyncStatus("Đang dịch tọa độ đã chọn sang địa chỉ...");
      try {
        const addrRes = await getAddressFromCoordinates(lat, lng);
        if (addrRes?.displayName) {
          setAddress(addrRes.displayName);
          setSyncStatus("Đã chọn vị trí và đồng bộ địa chỉ từ bản đồ!");
          setTimeout(() => setSyncStatus(""), 3500);
        }
      } catch (err) {
        console.warn("Lỗi dịch tọa độ sang địa chỉ:", err);
      } finally {
        setIsReverseGeocoding(false);
        sourceRef.current = null;
      }
    }
  };

  const handleLatitudeChange = (newLat) => {
    sourceRef.current = "gps-manual";
    setLatitude(newLat);
  };

  const handleLongitudeChange = (newLng) => {
    sourceRef.current = "gps-manual";
    setLongitude(newLng);
  };

  const syncAddressFromCoords = async (latVal, lngVal) => {
    const lat = parseFloat(latVal);
    const lng = parseFloat(lngVal);
    if (!isNaN(lat) && !isNaN(lng)) {
      setIsReverseGeocoding(true);
      setSyncStatus("Đang tìm địa chỉ từ tọa độ...");
      try {
        const res = await getAddressFromCoordinates(lat, lng);
        if (res?.displayName) {
          sourceRef.current = "gps";
          setAddress(res.displayName);
          setSyncStatus("Đã cập nhật địa chỉ từ tọa độ!");
          setTimeout(() => {
            sourceRef.current = null;
            setSyncStatus("");
          }, 3000);
        }
      } catch (err) {
        console.warn("Lỗi reverse geocode:", err);
      } finally {
        setIsReverseGeocoding(false);
      }
    }
  };

  return {
    address,
    setAddress,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    isLocating,
    isGeocoding,
    isReverseGeocoding,
    isMapOpen,
    setIsMapOpen,
    syncStatus,
    setSyncStatus,
    handleAddressChange,
    handleLatitudeChange,
    handleLongitudeChange,
    handleGetCurrentLocation,
    handleMapConfirm,
    setInitialValues,
    syncAddressFromCoords,
  };
};
