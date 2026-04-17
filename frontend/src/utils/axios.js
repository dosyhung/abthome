import axios from 'axios';

// Khởi tạo một instance riêng biệt cho hệ thống
const axiosInstance = axios.create({
  // Vite Proxy đang điều hướng /api sang backend
  baseURL: '/api'
});

// INTERCEPTOR - TRƯỚC KHI GỬI REQUEST
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ Local Storage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Đính kèm vào Header chuẩn Bearer Auth
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR - SAU KHI NHẬN RESPONSE
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Bẫy lỗi 401: Token sai hoặc hết độ chính xác => văng ra ngoài
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Đá về màn hình Login bằng Object window toàn cục
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
