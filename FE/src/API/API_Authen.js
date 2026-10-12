import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/Authen";

export const login = (data) => 
  axiosInstance.post(`${BASE_URL}/login`, data);

export const register = (data) =>  
  axiosInstance.post(`${BASE_URL}/register`, data);

export const logout = () => 
  axiosInstance.post(`${BASE_URL}/logout`);
