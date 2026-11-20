import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi, updateProfileApi, addAddressApi, deleteAddressApi, setDefaultAddressApi, } from '../services/api.js';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        try {
            return localStorage.getItem('kashbites_auth_token');
        }
        catch {
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const profile = await getMeApi(token);
                    if (profile) {
                        setUser(profile);
                    }
                    else {
                        localStorage.removeItem('kashbites_auth_token');
                        setToken(null);
                    }
                }
                catch {
                    localStorage.removeItem('kashbites_auth_token');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, [token]);
    const login = async (email, password) => {
        const res = await loginApi(email, password);
        if (res.success && res.data) {
            setUser(res.data);
            setToken(res.token);
            localStorage.setItem('kashbites_auth_token', res.token);
            setIsAuthModalOpen(false);
            return { success: true };
        }
        return { success: false, message: res.message || 'Login failed' };
    };
    const register = async (name, email, phone, password) => {
        const res = await registerApi(name, email, phone, password);
        if (res.success && res.data) {
            setUser(res.data);
            setToken(res.token);
            localStorage.setItem('kashbites_auth_token', res.token);
            setIsAuthModalOpen(false);
            return { success: true };
        }
        return { success: false, message: res.message || 'Registration failed' };
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('kashbites_auth_token');
    };
    const updateProfile = async (userData) => {
        if (!user)
            return false;
        const res = await updateProfileApi({ id: user._id, email: user.email, ...userData });
        if (res.success && res.data) {
            setUser(res.data);
            return true;
        }
        return false;
    };
    const addAddress = async (address) => {
        if (!user)
            return false;
        const res = await addAddressApi(user._id, address);
        if (res.success && res.data) {
            setUser(res.data);
            return true;
        }
        return false;
    };
    const deleteAddress = async (addressId) => {
        if (!user)
            return false;
        const res = await deleteAddressApi(user._id, addressId);
        if (res.success && res.data) {
            setUser(res.data);
            return true;
        }
        return false;
    };
    const setDefaultAddress = async (addressId) => {
        if (!user)
            return false;
        const res = await setDefaultAddressApi(user._id, addressId);
        if (res.success && res.data) {
            setUser(res.data);
            return true;
        }
        return false;
    };
    const quickLoginAsOwais = async () => {
        await login('mohammadowais616@gmail.com', 'password123');
    };
    return (<AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!user,
            isLoading,
            isAuthModalOpen,
            setIsAuthModalOpen,
            login,
            register,
            logout,
            updateProfile,
            addAddress,
            deleteAddress,
            setDefaultAddress,
            quickLoginAsOwais,
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
