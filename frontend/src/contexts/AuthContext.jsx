import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useIdleTimeout from '../hooks/useIdleTimeout';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy lại session cũ từ máy sau khi f5
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUserSession = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleAutoLogout = useCallback(() => {
    if (token) {
        // Có thể hiển thị thông báo nếu muốn
        console.log("Auto-logout do người dùng không hoạt động trong 5 phút.");
        logout();
    }
  }, [token]);

  // Cấu hình thời gian idle là 5 phút (300,000 milliseconds)
  useIdleTimeout(handleAutoLogout, 5 * 60 * 1000);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUserSession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
