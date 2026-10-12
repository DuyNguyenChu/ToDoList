import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/ItemInformation";

export const getAllItemInformations = () =>
  axiosInstance.get(BASE_URL);

export const searchItemInformations = (keyword, pageNumber = 1, pageSize = 10) =>
  axiosInstance.get(`${BASE_URL}/search`, { params: { keyword, pageNumber, pageSize } });

export const getItemInformationById = (id) =>
  axiosInstance.get(`${BASE_URL}/${id}`);

export const createItemInformation = (data) =>
  axiosInstance.post(BASE_URL, data);

export const updateItemInformation = (id, data) =>
  axiosInstance.put(`${BASE_URL}/${id}`, data);

export const deleteItemInformation = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);
