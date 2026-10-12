import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/User";

export const getAllUsers = () =>
  axiosInstance.get(BASE_URL);

export const searchUsers = (keyword, pageNumber = 1, pageSize = 10) =>
  axiosInstance.get(`${BASE_URL}/search`, { params: { keyword, pageNumber, pageSize } });

export const getUserById = (id) =>
  axiosInstance.get(`${BASE_URL}/${id}`);

export const createUser = (data) =>
  axiosInstance.post(BASE_URL, data);

export const updateUser = (id, data) =>
  axiosInstance.put(`${BASE_URL}/${id}`, data);

export const deleteUser = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);

export const getCurrentUser = (userId) =>
  axiosInstance.get(`${BASE_URL}/me`, {
    params: userId ? { userId } : {},
  });

export const updateCurrentUser = (data, userId) =>
  axiosInstance.put(`${BASE_URL}/me`, data, {
    params: userId ? { userId } : {},
  });

export const changePassword = (data, userId) =>
  axiosInstance.post(`${BASE_URL}/change-password`, data, {
    params: userId ? { userId } : {},
  });

export const changePasswordById = (id, data) =>
  axiosInstance.post(`${BASE_URL}/${id}/change-password`, data);

export const updateContact = (data, userId) =>
  axiosInstance.put(`${BASE_URL}/contact`, data, {
    params: userId ? { userId } : {},
  });

export const updateContactById = (id, data) =>
  axiosInstance.put(`${BASE_URL}/${id}/contact`, data);

export const updateUserRole = (id, data) =>
  axiosInstance.put(`${BASE_URL}/${id}/role`, data);

