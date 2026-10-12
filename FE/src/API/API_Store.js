import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/Store";

export const getAllStores = (userCoords = null) => {
  const params = {};
  if (userCoords?.lat != null && userCoords?.lng != null) {
    params.userLat = userCoords.lat;
    params.userLng = userCoords.lng;
  }
  return axiosInstance.get(BASE_URL, { params });
};

export const searchStores = (keyword, pageNumber = 1, pageSize = 10, userCoords = null) => {
  const params = { keyword, pageNumber, pageSize };
  if (userCoords?.lat != null && userCoords?.lng != null) {
    params.userLat = userCoords.lat;
    params.userLng = userCoords.lng;
  }
  return axiosInstance.get(`${BASE_URL}/search`, { params });
};

export const getStoreById = (id) =>
  axiosInstance.get(`${BASE_URL}/${id}`);

export const createStore = (data) =>
  axiosInstance.post(BASE_URL, data);

export const updateStore = (id, data) =>
  axiosInstance.put(`${BASE_URL}/${id}`, data);

export const deleteStore = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);
