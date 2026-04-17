
import axios from 'axios';

// Cấu hình mặc định cho tất cả các request API
const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Đổi port này khớp với backend NodeJS của bạn sau này
});

// Interceptors: Xử lý dữ liệu trước khi gửi đi (Attach Token)
axiosClient.interceptors.request.use(
    (config) => {
        // Giả sử token được lưu trong localStorage với tên 'token'
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptors: Xử lý dữ liệu trước khi nhận về
axiosClient.interceptors.response.use(
    (response) => {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        // Xử lý lỗi chung (ví dụ: văng ra trang login nếu token hết hạn)
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default axiosClient;