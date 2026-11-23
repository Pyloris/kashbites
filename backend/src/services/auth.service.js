import { User } from '../database/models/users.model.js';
import { Admin } from '../database/models/admins.model.js';
import { usersStore, adminsStore } from '../data/store.js';
import { ApiError } from '../errors/api-error.js';
import { signToken, verifyToken } from '../middleware/auth/index.js';
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
                const token = signToken({
                    id: String(user._id),
                    userId: String(user._id),
                    email: user.email,
                    name: user.name,
                    role: user.role || 'member',
                });
                return {
                    token,
                    user: userObj,
                };
            }
        }

        const user = usersStore.find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);
        if (user) {
            const { password: _, ...userData } = user;
            const token = signToken({
                id: String(user._id || user.id),
                userId: String(user._id || user.id),
                email: user.email,
                name: user.name,
                role: user.role || 'member',
            });
            return {
                token,
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
            const token = signToken({
                id: String(created._id),
                userId: String(created._id),
                email: created.email,
                name: created.name,
                role: created.role || 'member',
            });
            return {
                token,
                user: userObj,
            };
        }

        const { password: _, ...userData } = newUser;
        const token = signToken({
            id: String(newUser._id),
            userId: String(newUser._id),
            email: newUser.email,
            name: newUser.name,
            role: newUser.role || 'member',
        });
        return {
            token,
            user: userData,
        };
    }

    static async getMe({ authHeader, userId: explicitUserId } = {}) {
        let userId = explicitUserId;
        if (!userId && authHeader) {
            const raw = String(authHeader).replace(/^Bearer\s+/i, '').trim();
            if (raw.startsWith('jwt_token_')) {
                userId = raw.replace('jwt_token_', '');
            } else if (raw.startsWith('admin_jwt_')) {
                userId = raw.replace('admin_jwt_', '');
            } else {
                try {
                    const decoded = verifyToken(raw);
                    userId = decoded.id || decoded.userId || decoded._id || decoded.sub;
                } catch {
                    userId = raw;
                }
            }
        }

        if (!userId) {
            throw ApiError.unauthorized('Invalid authorization token');
        }

        // 1. Query MongoDB User model
        if (mongoose.connection.readyState === 1) {
            let user = null;
            if (mongoose.Types.ObjectId.isValid(userId)) {
                user = await User.findById(userId);
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

        // 3. Query Admin / adminsStore if an admin/superadmin is calling getMe
        if (mongoose.connection.readyState === 1) {
            let admin = null;
            if (mongoose.Types.ObjectId.isValid(userId)) {
                admin = await Admin.findById(userId);
            }
            if (!admin) {
                admin = await Admin.findOne({ username: userId });
            }
            if (admin) {
                const adminObj = admin.toObject();
                delete adminObj.password;
                return adminObj;
            }
        }

        const adminUser = adminsStore.find((a) => String(a._id) === String(userId) || a.username === userId);
        if (adminUser) {
            const { password: _, ...adminData } = adminUser;
            return adminData;
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
