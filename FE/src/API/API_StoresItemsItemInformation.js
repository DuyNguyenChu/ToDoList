import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/StoresItemsItemInformation";

export const getAllStoresItemsItemInformation = (userCoords = null) => {
  const params = {};
  if (userCoords?.lat != null && userCoords?.lng != null) {
    params.userLat = userCoords.lat;
    params.userLng = userCoords.lng;
  }
  return axiosInstance.get(BASE_URL, { params });
};

export const searchStoresItemsItemInformation = (keyword, pageNumber = 1, pageSize = 10, userCoords = null) => {
  const params = { keyword, pageNumber, pageSize };
  if (userCoords?.lat != null && userCoords?.lng != null) {
    params.userLat = userCoords.lat;
    params.userLng = userCoords.lng;
  }
  return axiosInstance.get(`${BASE_URL}/search`, { params });
};

export const getStoresItemsItemInformationById = (id) =>
  axiosInstance.get(`${BASE_URL}/${id}`);

export const getStoresItemsByStoreId = (storeId, keyword = null) => {
  const params = {};
  if (keyword) {
    params.keyword = keyword;
  }
  return axiosInstance.get(`${BASE_URL}/store/${storeId}`, { params });
};

export const createStoresItemsItemInformation = (data) =>
  axiosInstance.post(BASE_URL, data);

export const updateStoresItemsItemInformation = (id, data) =>
  axiosInstance.put(`${BASE_URL}/${id}`, data);

export const deleteStoresItemsItemInformation = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);
