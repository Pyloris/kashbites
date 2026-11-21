import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    useLoginMutation,
    useRegisterMutation,
    useGetMeQuery,
    useUpdateProfileMutation,
    useAddAddressMutation,
    useDeleteAddressMutation,
    useSetDefaultAddressMutation,
} from '../services/auth.api.js';
import { getStoreToken, setStoreToken, clearStoreToken } from '../helpers/helpers.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => getStoreToken());
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const {
        data: profileUser,
        isLoading: isGetMeLoading,
        isError: isGetMeError,
    } = useGetMeQuery(undefined, { skip: !token });

    const [user, setUser] = useState(null);

    useEffect(() => {
        if (profileUser) {
            setUser(profileUser);
        } else if (isGetMeError) {
            setUser(null);
            setToken(null);
            clearStoreToken();
        } else if (!token) {
            setUser(null);
        }
    }, [profileUser, isGetMeError, token]);

    const isLoading = Boolean(token) && isGetMeLoading && !user;

    const [loginMutation] = useLoginMutation();
    const [registerMutation] = useRegisterMutation();
    const [updateProfileMutation] = useUpdateProfileMutation();
    const [addAddressMutation] = useAddAddressMutation();
    const [deleteAddressMutation] = useDeleteAddressMutation();
    const [setDefaultAddressMutation] = useSetDefaultAddressMutation();

    const login = async (email, password) => {
        try {
            const res = await loginMutation({ email, password }).unwrap();
            if (res.success && res.data) {
                setUser(res.data);
                setToken(res.token);
                setStoreToken(res.token);
                setIsAuthModalOpen(false);
                return { success: true };
            }
            return { success: false, message: res.message || 'Login failed' };
        } catch (err) {
            return { success: false, message: err?.data?.message || err?.message || 'Login failed' };
        }
    };

    const register = async (name, email, phone, password) => {
        try {
            const res = await registerMutation({ name, email, phone, password }).unwrap();
            if (res.success && res.data) {
                setUser(res.data);
                setToken(res.token);
                setStoreToken(res.token);
                setIsAuthModalOpen(false);
                return { success: true };
            }
            return { success: false, message: res.message || 'Registration failed' };
        } catch (err) {
            return { success: false, message: err?.data?.message || err?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        clearStoreToken();
    };

    const updateProfile = async (userData) => {
        if (!user)
            return false;
        try {
            const res = await updateProfileMutation({ id: user._id, email: user.email, ...userData }).unwrap();
            if (res.success && res.data) {
                setUser(res.data);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const addAddress = async (address) => {
        if (!user)
            return false;
        try {
            const res = await addAddressMutation({ userId: user._id, address }).unwrap();
            if (res.success && res.data) {
                setUser(res.data);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const deleteAddress = async (addressId) => {
        if (!user)
            return false;
        try {
            const res = await deleteAddressMutation({ userId: user._id, addressId }).unwrap();
            if (res.success && res.data) {
                setUser(res.data);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const setDefaultAddress = async (addressId) => {
        if (!user)
            return false;
        try {
            const res = await setDefaultAddressMutation({ userId: user._id, addressId }).unwrap();
            if (res.success && res.data) {
                setUser(res.data);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const quickLoginAsOwais = async () => {
        await login('mohammadowais616@gmail.com', 'password123');
    };

    return (
        <AuthContext.Provider
            value={{
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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
