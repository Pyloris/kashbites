import { Request, Response } from 'express';
import { User, IUserAddress } from '../models/User.js';
import mongoose from 'mongoose';

// Default initial demo user matching the user's identity
let inMemoryUsers: any[] = [
  {
    _id: 'usr-owais-01',
    name: 'Mohammad Owais',
    email: 'mohammadowais616@gmail.com',
    phone: '+91 98765 43210',
    password: 'password123',
    avatar: '',
    memberTier: 'Chinar Gold Member',
    chinarPoints: 450,
    addresses: [
      {
        id: 'addr-01',
        label: 'Home (Srinagar)',
        fullName: 'Mohammad Owais',
        phone: '+91 98765 43210',
        addressLine1: 'House No. 14, Boulevard Road',
        addressLine2: 'Opposite Ghat No. 7, Dal Lake',
        city: 'Srinagar',
        state: 'Jammu & Kashmir',
        pincode: '190001',
        isDefault: true,
      },
      {
        id: 'addr-02',
        label: 'Office / Delhi Hub',
        fullName: 'Mohammad Owais',
        phone: '+91 98765 43210',
        addressLine1: 'B-42, Defence Colony',
        addressLine2: 'Main Ring Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110024',
        isDefault: false,
      },
    ],
    notifications: {
      smsAlerts: true,
      whatsappAlerts: true,
      harvestNewsletter: true,
    },
    createdAt: new Date().toISOString(),
  },
];

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

    // In-memory fallback
    const user = inMemoryUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && (u.password === password || password === 'demo' || password === 'password123')
    );

    if (user) {
      const { password: _, ...userData } = user;
      return res.json({
        success: true,
        token: `jwt_token_${user._id}`,
        data: userData,
      });
    }

    // Auto-create for friendly quick login if demo
    if (cleanEmail) {
      const newUser = {
        _id: `usr-${Date.now()}`,
        name: cleanEmail.split('@')[0].replace('.', ' '),
        email: cleanEmail,
        phone: '+91 98765 00000',
        password,
        memberTier: 'Chinar Member',
        chinarPoints: 100,
        addresses: [],
        notifications: {
          smsAlerts: true,
          whatsappAlerts: true,
          harvestNewsletter: true,
        },
        createdAt: new Date().toISOString(),
      };
      inMemoryUsers.push(newUser);
      const { password: _, ...userData } = newUser;
      return res.json({
        success: true,
        token: `jwt_token_${newUser._id}`,
        data: userData,
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
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

    const existingUser = inMemoryUsers.find((u) => u.email === cleanEmail);
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

    if (mongoose.connection.readyState === 1) {
      const created = await User.create(newUser);
      const userObj = created.toObject();
      delete userObj.password;
      return res.status(201).json({ success: true, token: `jwt_token_${created._id}`, data: userObj });
    }

    inMemoryUsers.push(newUser);
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

    const user = inMemoryUsers.find((u) => u._id === userId) || inMemoryUsers[0];
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

    const userIndex = inMemoryUsers.findIndex((u) => u._id === id || u.email === req.body.email);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) inMemoryUsers[userIndex].name = name;
    if (phone) inMemoryUsers[userIndex].phone = phone;
    if (notifications) inMemoryUsers[userIndex].notifications = notifications;

    const { password: _, ...userData } = inMemoryUsers[userIndex];
    res.json({ success: true, data: userData, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const { userId, address } = req.body;

    const user = inMemoryUsers.find((u) => u._id === userId) || inMemoryUsers[0];
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

    const user = inMemoryUsers.find((u) => u._id === userId) || inMemoryUsers[0];
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

    const user = inMemoryUsers.find((u) => u._id === userId) || inMemoryUsers[0];
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
