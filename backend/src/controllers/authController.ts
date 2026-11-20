import { Request, Response } from 'express';
import { User, IUserAddress } from '../models/User.js';
import { usersStore } from '../data/store.js';
import mongoose from 'mongoose';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });
      if (user && user.password === password) {
        const userObj = user.toObject();
        delete userObj.password;
        return res.json({
          success: true,
          token: `jwt_token_${user._id}`,
          data: userObj,
        });
      }
    }

    const user = usersStore.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (user) {
      const { password: _, ...userData } = user;
      return res.json({
        success: true,
        token: `jwt_token_${user._id}`,
        data: userData,
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required registration fields' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = usersStore.find((u) => u.email === cleanEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
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
      return res.status(201).json({ success: true, token: `jwt_token_${created._id}`, data: userObj });
    }

    const { password: _, ...userData } = newUser;
    return res.status(201).json({ success: true, token: `jwt_token_${newUser._id}`, data: userData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').replace('jwt_token_', '') : null;

    const user = usersStore.find((u) => u._id === userId) || usersStore[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password: _, ...userData } = user;
    res.json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id, name, phone, notifications } = req.body;

    const userIndex = usersStore.findIndex((u) => u._id === id || u.email === req.body.email);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) usersStore[userIndex].name = name;
    if (phone) usersStore[userIndex].phone = phone;
    if (notifications) usersStore[userIndex].notifications = notifications;

    const { password: _, ...userData } = usersStore[userIndex];
    res.json({ success: true, data: userData, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const { userId, address } = req.body;

    const user = usersStore.find((u) => u._id === userId) || usersStore[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newAddress: IUserAddress = {
      id: `addr-${Date.now()}`,
      label: address.label || 'Home',
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: user.addresses.length === 0 ? true : !!address.isDefault,
    };

    if (newAddress.isDefault) {
      user.addresses.forEach((a: IUserAddress) => (a.isDefault = false));
    }

    user.addresses.push(newAddress);
    const { password: _, ...userData } = user;
    res.json({ success: true, data: userData, message: 'Address saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add address' });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const { userId, addressId } = req.params;

    const user = usersStore.find((u) => u._id === userId) || usersStore[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.addresses = user.addresses.filter((a: IUserAddress) => a.id !== addressId);
    const { password: _, ...userData } = user;
    res.json({ success: true, data: userData, message: 'Address removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const { userId, addressId } = req.params;

    const user = usersStore.find((u) => u._id === userId) || usersStore[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.addresses.forEach((a: IUserAddress) => {
      a.isDefault = a.id === addressId;
    });

    const { password: _, ...userData } = user;
    res.json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to set default address' });
  }
};
