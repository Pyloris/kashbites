import { User } from '../database/models/users.model.js';
import { usersStore } from '../data/store.js';
import { ApiError } from '../errors/api-error.js';
import mongoose from 'mongoose';

export class AuthService {
    static async login({ email, password }) {
        if (!email || !password) {
            throw ApiError.badRequest('Please provide email and password');
        }

        const cleanEmail = email.toLowerCase().trim();

        if (mongoose.connection.readyState === 1) {
            const user = await User.findOne({ email: cleanEmail });
            if (user && user.password === password) {
                const userObj = user.toObject();
                delete userObj.password;
                return {
                    token: `jwt_token_${user._id}`,
                    user: userObj,
                };
            }
        }

        const user = usersStore.find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);
        if (user) {
            const { password: _, ...userData } = user;
            return {
                token: `jwt_token_${user._id}`,
                user: userData,
            };
        }

        throw ApiError.unauthorized('Invalid email or password');
    }

    static async register({ name, email, phone, password }) {
        if (!name || !email || !password) {
            throw ApiError.badRequest('Missing required registration fields');
        }

        const cleanEmail = email.toLowerCase().trim();

        if (mongoose.connection.readyState === 1) {
            const existingInDb = await User.findOne({ email: cleanEmail });
            if (existingInDb) {
                throw ApiError.conflict('An account with this email already exists');
            }
        }

        const existingUser = usersStore.find((u) => u.email === cleanEmail);
        if (existingUser) {
            throw ApiError.conflict('An account with this email already exists');
        }

        const newUser = {
            _id: `usr-${Date.now()}`,
            name,
            email: cleanEmail,
            phone: phone || '+91 90000 00000',
            password,
            memberTier: 'Chinar Club Member',
            chinarPoints: 200,
            addresses: [],
            notifications: {
                smsAlerts: true,
                whatsappAlerts: true,
                harvestNewsletter: true,
            },
            createdAt: new Date().toISOString(),
        };

        usersStore.push(newUser);

        if (mongoose.connection.readyState === 1) {
            const created = await User.create(newUser);
            const userObj = created.toObject();
            delete userObj.password;
            return {
                token: `jwt_token_${created._id}`,
                user: userObj,
            };
        }

        const { password: _, ...userData } = newUser;
        return {
            token: `jwt_token_${newUser._id}`,
            user: userData,
        };
    }

    static async getMe({ authHeader }) {
        const userId = authHeader ? authHeader.replace('Bearer ', '').replace('jwt_token_', '') : null;
        if (!userId) {
            throw ApiError.unauthorized('Invalid authorization token');
        }

        // 1. Query MongoDB User model
        if (mongoose.connection.readyState === 1) {
            let user = null;
            if (mongoose.Types.ObjectId.isValid(userId)) {
                user = await User.findById(userId);
            }
            if (!user) {
                user = await User.findOne({ _id: userId });
            }
            if (user) {
                const userObj = user.toObject();
                delete userObj.password;
                return userObj;
            }
        }

        // 2. Query in-memory usersStore
        const user = usersStore.find((u) => String(u._id) === String(userId) || String(u.id) === String(userId));
        if (user) {
            const { password: _, ...userData } = user;
            return userData;
        }

        throw ApiError.notFound('User not found');
    }

    static async updateProfile({ id, email, name, phone, notifications }) {
        if (mongoose.connection.readyState === 1) {
            const query = [];
            if (id && mongoose.Types.ObjectId.isValid(id)) query.push({ _id: id });
            if (email) query.push({ email: email.toLowerCase().trim() });

            if (query.length > 0) {
                const updateFields = {};
                if (name) updateFields.name = name;
                if (phone) updateFields.phone = phone;
                if (notifications) updateFields.notifications = notifications;

                const updated = await User.findOneAndUpdate(
                    { $or: query },
                    { $set: updateFields },
                    { new: true }
                );
                if (updated) {
                    const userObj = updated.toObject();
                    delete userObj.password;
                    return userObj;
                }
            }
        }

        const userIndex = usersStore.findIndex((u) => String(u._id) === String(id) || u.email === email);
        if (userIndex === -1) {
            throw ApiError.notFound('User not found');
        }

        if (name) usersStore[userIndex].name = name;
        if (phone) usersStore[userIndex].phone = phone;
        if (notifications) usersStore[userIndex].notifications = notifications;

        const { password: _, ...userData } = usersStore[userIndex];
        return userData;
    }

    static async addAddress({ userId, address }) {
        const newAddress = {
            id: `addr-${Date.now()}`,
            label: address.label || 'Home',
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: !!address.isDefault,
        };

        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findById(userId);
            if (user) {
                if (!user.addresses || user.addresses.length === 0) {
                    newAddress.isDefault = true;
                }
                if (newAddress.isDefault && user.addresses) {
                    user.addresses.forEach((a) => (a.isDefault = false));
                }
                user.addresses.push(newAddress);
                await user.save();
                const userObj = user.toObject();
                delete userObj.password;
                return userObj;
            }
        }

        const user = usersStore.find((u) => String(u._id) === String(userId) || String(u.id) === String(userId));
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        if (!user.addresses || user.addresses.length === 0) {
            newAddress.isDefault = true;
        }
        if (newAddress.isDefault && user.addresses) {
            user.addresses.forEach((a) => (a.isDefault = false));
        }

        user.addresses = user.addresses || [];
        user.addresses.push(newAddress);
        const { password: _, ...userData } = user;
        return userData;
    }

    static async deleteAddress({ userId, addressId }) {
        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findById(userId);
            if (user) {
                user.addresses = user.addresses.filter((a) => a.id !== addressId);
                await user.save();
                const userObj = user.toObject();
                delete userObj.password;
                return userObj;
            }
        }

        const user = usersStore.find((u) => String(u._id) === String(userId) || String(u.id) === String(userId));
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        user.addresses = user.addresses.filter((a) => a.id !== addressId);
        const { password: _, ...userData } = user;
        return userData;
    }

    static async setDefaultAddress({ userId, addressId }) {
        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findById(userId);
            if (user) {
                user.addresses.forEach((a) => {
                    a.isDefault = a.id === addressId;
                });
                await user.save();
                const userObj = user.toObject();
                delete userObj.password;
                return userObj;
            }
        }

        const user = usersStore.find((u) => String(u._id) === String(userId) || String(u.id) === String(userId));
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        user.addresses.forEach((a) => {
            a.isDefault = a.id === addressId;
        });

        const { password: _, ...userData } = user;
        return userData;
    }
}

export default AuthService;
