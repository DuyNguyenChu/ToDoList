import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/ToDoList";

export const getAllToDoLists = (userCoords = null) => {
  const params = {};
  if (userCoords?.lat != null && userCoords?.lng != null) {
    params.userLat = userCoords.lat;
    params.userLng = userCoords.lng;
  }
  return axiosInstance.get(BASE_URL, { params });
};

export const getToDoListSummary = (userCoords = null) => {
  const params = {};
  if (userCoords?.lat != null && userCoords?.lng != null) {
    params.userLat = userCoords.lat;
    params.userLng = userCoords.lng;
  }
  return axiosInstance.get(`${BASE_URL}/summary`, { params });
};

export const searchToDoLists = (keyword, pageNumber = 1, pageSize = 10, userCoords = null) => {
  const params = { keyword, pageNumber, pageSize };
  if (userCoords?.lat != null && userCoords?.lng != null) {
    params.userLat = userCoords.lat;
    params.userLng = userCoords.lng;
  }
  return axiosInstance.get(`${BASE_URL}/search`, { params });
};

export const getToDoListById = (id) =>
  axiosInstance.get(`${BASE_URL}/${id}`);

export const createToDoList = (data) =>
  axiosInstance.post(BASE_URL, data);

export const updateToDoList = (id, data) =>
  axiosInstance.put(`${BASE_URL}/${id}`, data);

export const deleteToDoList = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);
