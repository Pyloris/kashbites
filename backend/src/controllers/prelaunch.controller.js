import { PrelaunchLead } from '../database/models/prelaunch-leads.model.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../errors/api-error.js';
import { catchError } from '../errors/catch-error.js';

export const PrelaunchController = {
    submitLead: catchError(async (req, res) => {
        const { phone, countryCode = '+91', name = '' } = req.body;

        if (!phone || typeof phone !== 'string') {
            throw ApiError.badRequest('WhatsApp phone number is required');
        }

        const cleanedPhone = phone.replace(/[^0-9+]/g, '');
        if (cleanedPhone.length < 8) {
            throw ApiError.badRequest('Please enter a valid phone number');
        }

        const fullPhone = cleanedPhone.startsWith('+') 
            ? cleanedPhone 
            : `${countryCode}${cleanedPhone.replace(/^0+/, '')}`;

        // Find existing or update
        let lead = await PrelaunchLead.findOne({ phone: fullPhone });
        if (!lead) {
            lead = await PrelaunchLead.create({
                phone: fullPhone,
                countryCode,
                name: name ? name.trim() : '',
                source: 'launching_screen',
                couponCode: 'KASHLAUNCH20',
                ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
                userAgent: req.headers['user-agent'] || '',
            });
        } else if (name && !lead.name) {
            lead.name = name.trim();
            await lead.save();
        }

        return ApiResponse.success(
            res,
            {
                leadId: lead._id,
                phone: lead.phone,
                couponCode: lead.couponCode || 'KASHLAUNCH20',
                discountPercent: 20,
                status: 'registered',
            },
            'You are registered for VIP launch access and coupon delivery!'
        );
    }),

    getLeads: catchError(async (req, res) => {
        const leads = await PrelaunchLead.find().sort({ createdAt: -1 }).limit(200);
        const count = await PrelaunchLead.countDocuments();
        return ApiResponse.success(res, { leads, total: count });
    }),
};

export default PrelaunchController;
