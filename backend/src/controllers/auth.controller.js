import { catchError } from '../errors/catch-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
    static login = catchError(async (req, res) => {
        const { email, password } = req.body;
        const result = await AuthService.login({ email, password });
        return res.json({
            status: 1,
            success: true,
            token: result.token,
            data: result.user,
        });
    });

    static register = catchError(async (req, res) => {
        const { name, email, phone, password } = req.body;
        const result = await AuthService.register({ name, email, phone, password });
        return res.status(201).json({
            status: 1,
            success: true,
            token: result.token,
            data: result.user,
        });
    });

    static getMe = catchError(async (req, res) => {
        const authHeader = req.headers.authorization;
        const userId = req.user?.id;
        const user = await AuthService.getMe({ authHeader, userId });
        return ApiResponse.success(res, user, 'Profile retrieved successfully');
    });

    static updateProfile = catchError(async (req, res) => {
        const id = req.body.id || req.user?.id;
        const { email, name, phone, notifications } = req.body;
        const user = await AuthService.updateProfile({ id, email, name, phone, notifications });
        return ApiResponse.success(res, user, 'Profile updated successfully');
    });

    static addAddress = catchError(async (req, res) => {
        const userId = req.body.userId || req.user?.id;
        const { address } = req.body;
        const user = await AuthService.addAddress({ userId, address });
        return ApiResponse.success(res, user, 'Address saved successfully');
    });

    static deleteAddress = catchError(async (req, res) => {
        const userId = req.params.userId || req.user?.id;
        const { addressId } = req.params;
        const user = await AuthService.deleteAddress({ userId, addressId });
        return ApiResponse.success(res, user, 'Address removed successfully');
    });

    static setDefaultAddress = catchError(async (req, res) => {
        const userId = req.params.userId || req.user?.id;
        const { addressId } = req.params;
        const user = await AuthService.setDefaultAddress({ userId, addressId });
        return ApiResponse.success(res, user, 'Default address updated successfully');
    });
}

// Named exports for backward compatibility
export const login = AuthController.login;
export const register = AuthController.register;
export const getMe = AuthController.getMe;
export const updateProfile = AuthController.updateProfile;
export const addAddress = AuthController.addAddress;
export const deleteAddress = AuthController.deleteAddress;
export const setDefaultAddress = AuthController.setDefaultAddress;

export default AuthController;
