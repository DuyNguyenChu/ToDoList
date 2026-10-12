
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

export const getAddressFromCoordinates = async (lat, lng) => {
  if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) {
    throw new Error("Tọa độ không hợp lệ");
  }

  const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lng)}&accept-language=vi&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      "Accept-Language": "vi",
    },
  });

  if (!response.ok) {
    throw new Error(`Lỗi reverse geocoding: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return {
    displayName: data.display_name || "",
    address: data.address || {},
    raw: data,
  };
};

export const getCoordinatesFromAddress = async (address) => {
  if (!address || !address.trim()) {
    return null;
  }

  const trimmed = address.trim();
  const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(
    trimmed
  )}&accept-language=vi&limit=1&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      "Accept-Language": "vi",
    },
  });

  if (!response.ok) {
    throw new Error(`Lỗi geocoding: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const item = data[0];
  return {
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    displayName: item.display_name || "",
    raw: item,
  };
};

export const getCurrentBrowserPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Trình duyệt của bạn không hỗ trợ định vị GPS."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
        });
      },
      (error) => {
        let msg = "Không thể lấy vị trí hiện tại.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Bạn đã từ chối cấp quyền truy cập vị trí GPS.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Thông tin vị trí hiện không khả dụng.";
            break;
          case error.TIMEOUT:
            msg = "Yêu cầu lấy vị trí đã hết thời gian chờ.";
            break;
          default:
            msg = error.message || msg;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    isNaN(Number(lat1)) ||
    isNaN(Number(lon1)) ||
    isNaN(Number(lat2)) ||
    isNaN(Number(lon2))
  ) {
    return null;
  }

  const R = 6371;
  const p1 = (Number(lat1) * Math.PI) / 180;
  const p2 = (Number(lat2) * Math.PI) / 180;
  const deltaP = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const deltaL = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;

  const a =
    Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(deltaL / 2) * Math.sin(deltaL / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const formatDistance = (distanceKm) => {
  if (distanceKm == null || isNaN(distanceKm)) {
    return "Không có tọa độ";
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(2)} km`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

