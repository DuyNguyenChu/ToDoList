import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/Item";

export const getAllItems = () =>
  axiosInstance.get(BASE_URL);

export const searchItems = (keyword, pageNumber = 1, pageSize = 10) =>
  axiosInstance.get(`${BASE_URL}/search`, { params: { keyword, pageNumber, pageSize } });

export const getItemById = (id) =>
  axiosInstance.get(`${BASE_URL}/${id}`);

export const createItem = (data) =>
  axiosInstance.post(BASE_URL, data);

export const updateItem = (id, data) =>
  axiosInstance.put(`${BASE_URL}/${id}`, data);

export const deleteItem = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);
