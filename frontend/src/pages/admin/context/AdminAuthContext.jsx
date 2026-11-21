import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../../../services/admin.api.js';
import {
  getAdminToken,
  getAdminSession,
  setAdminAuth,
  clearAdminAuth,
} from '../../../helpers/helpers.js';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => getAdminSession());
  const [token, setToken] = useState(() => getAdminToken());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const existingSession = getAdminSession();
    const existingToken = getAdminToken();
    if (existingSession && existingToken) {
      setAdminUser(existingSession);
      setToken(existingToken);
    }
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const res = await adminApi.login(username.trim(), password);
      if (res.success && res.data && res.token) {
        setAdminAuth(res.token, res.data);
        setAdminUser(res.data);
        setToken(res.token);
        return { success: true, admin: res.data };
      }
      return { success: false, message: res.message || 'Invalid admin credentials' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAdminAuth();
    setAdminUser(null);
    setToken('');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthenticated: Boolean(adminUser && token),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
