import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://todolist-nq3a.onrender.com",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch {
      void 0;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isProfile =
        typeof window !== "undefined" &&
        window.location.pathname.includes("/thong-tin-ca-nhan");

      if (!isProfile) {
        localStorage.removeItem("user");
        window.dispatchEvent(
          new CustomEvent("auth:unauthorized", {
            detail: {
              message:
                error.response.data?.message ||
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
            },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
