import axios from "axios";
import { message } from "antd";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Hàm đăng nhập lại
const reLogin = async () => {
  try {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    if (!username || !password) {
      throw new Error("Không tìm thấy thông tin đăng nhập");
    }

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/Auth/login`, {
      username,
      password
    });

    if (!response.data.token) {
      throw new Error("Không nhận được token mới");
    }

    const { token } = response.data;
    localStorage.setItem("token", token);
    return token;
  } catch (error) {
    // Xóa thông tin đăng nhập cũ
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    
    // Chuyển về trang đăng nhập
    window.location.href = "/login";
    
    throw error;
  }
};

// Interceptor request
api.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Interceptor response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu là lỗi token hết hạn và chưa thử refresh
    if (
      error.response?.status === 401 && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Thử đăng nhập lại để lấy token mới
        const newToken = await reLogin();
        
        // Cập nhật token mới vào header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Thử lại request ban đầu
        return api(originalRequest);
      } catch (refreshError) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        // Chuyển về trang đăng nhập
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
