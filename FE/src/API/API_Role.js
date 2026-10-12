import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/Role";

export const getAllRoles = () =>
  axiosInstance.get(BASE_URL);

export const searchRoles = (keyword, pageNumber = 1, pageSize = 10) =>
  axiosInstance.get(`${BASE_URL}/search`, { params: { keyword, pageNumber, pageSize } });

export const getRoleById = (id) =>
  axiosInstance.get(`${BASE_URL}/${id}`);

export const createRole = (data) =>
  axiosInstance.post(BASE_URL, data);

export const updateRole = (id, data) =>
  axiosInstance.put(`${BASE_URL}/${id}`, data);

export const deleteRole = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);
