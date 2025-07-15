import axios from "axios";
import { message } from "antd";

const api = axios.create({
  baseURL: "https://localhost:7178/api",
});

// Hàm đăng nhập lại
const reLogin = async () => {
  try {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    if (!username || !password) {
      throw new Error("Không tìm thấy thông tin đăng nhập");
    }

    const response = await axios.post("https://localhost:7178/api/Account/login", {
      username,
      password
    });

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
      error.response?.data?.error === "invalid_token" && 
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
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
