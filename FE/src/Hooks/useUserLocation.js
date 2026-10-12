import { useState, useEffect, useCallback } from "react";
import { calculateDistanceKm, formatDistance } from "../API/API_Map";

let cachedCoords = (() => {
  try {
    const session = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("user_coords") : null;
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed?.lat != null && parsed?.lng != null) return parsed;
    }
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
    if (stored) {
      const u = JSON.parse(stored);
      const lat = u.userAddressInGpsLatitude ?? u.userAddressInGpslatitude;
      const lng = u.userAddressInGpsLongitude ?? u.userAddressInGpslongitude;
      if (
        lat != null &&
        lng != null &&
        !isNaN(Number(lat)) &&
        !isNaN(Number(lng)) &&
        Number(lat) !== 0 &&
        Number(lng) !== 0
      ) {
        return { lat: Number(lat), lng: Number(lng) };
      }
    }
  } catch {}
  return null;
})();

export const useUserLocation = () => {
  const hasGeo = typeof navigator !== "undefined" && Boolean(navigator.geolocation);
  const [userCoords, setUserCoords] = useState(cachedCoords);
  const [loading, setLoading] = useState(!cachedCoords && hasGeo);

  useEffect(() => {
    let ignore = false;

    if (!hasGeo) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!ignore) {
          const coords = {
            lat: parseFloat(pos.coords.latitude.toFixed(6)),
            lng: parseFloat(pos.coords.longitude.toFixed(6)),
          };
          cachedCoords = coords;
          try {
            sessionStorage.setItem("user_coords", JSON.stringify(coords));
          } catch {}
          setUserCoords(coords);
          setLoading(false);
        }
      },
      (err) => {
        console.warn("Không thể lấy GPS từ thiết bị/trình duyệt:", err);
        if (!ignore) {
          if (!cachedCoords) {
            setUserCoords(null);
          }
          setLoading(false);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );

    return () => {
      ignore = true;
    };
  }, [hasGeo]);

  const getDistanceFromUser = useCallback(
    (targetLat, targetLng) => {
      if (userCoords == null) {
        return {
          distanceKm: null,
          text: "Chưa bật vị trí",
          hasUserLocation: false,
        };
      }

      if (
        targetLat == null ||
        targetLng == null ||
        isNaN(Number(targetLat)) ||
        isNaN(Number(targetLng))
      ) {
        return {
          distanceKm: null,
          text: "Chưa có",
          hasUserLocation: true,
        };
      }

      const d = calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        targetLat,
        targetLng,
      );

      return {
        distanceKm: d,
        text: formatDistance(d),
        hasUserLocation: true,
      };
    },
    [userCoords],
  );

  return {
    userCoords,
    loadingUserLocation: loading,
    getDistanceFromUser,
  };
};
