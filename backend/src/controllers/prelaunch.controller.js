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
        const { search = '', status = '', limit = 200, page = 1 } = req.query;
        const query = {};

        if (status && status !== 'all' && status !== 'All') {
            query.status = status.toLowerCase();
        }

        if (search && search.trim()) {
            const term = search.trim();
            query.$or = [
                { phone: { $regex: term, $options: 'i' } },
                { name: { $regex: term, $options: 'i' } },
                { couponCode: { $regex: term, $options: 'i' } },
            ];
        }

        const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 200, 1), 1000);
        const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
        const skip = (parsedPage - 1) * parsedLimit;

        const [leads, total, allLeads] = await Promise.all([
            PrelaunchLead.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit).lean(),
            PrelaunchLead.countDocuments(query),
            PrelaunchLead.find({}, 'name status').lean(),
        ]);

        const stats = {
            totalLeads: allLeads.length,
            withName: allLeads.filter((l) => l.name && l.name.trim().length > 0).length,
            withoutName: allLeads.filter((l) => !l.name || l.name.trim().length === 0).length,
            pending: allLeads.filter((l) => !l.status || l.status === 'pending').length,
            notified: allLeads.filter((l) => l.status === 'notified').length,
            converted: allLeads.filter((l) => l.status === 'converted').length,
        };

        return ApiResponse.success(res, {
            leads,
            total,
            page: parsedPage,
            limit: parsedLimit,
            stats,
        });
    }),

    updateLeadStatus: catchError(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'notified', 'converted'].includes(status.toLowerCase())) {
            throw ApiError.badRequest('Invalid status. Allowed values: pending, notified, converted');
        }

        const lead = await PrelaunchLead.findByIdAndUpdate(
            id,
            { status: status.toLowerCase() },
            { new: true }
        );

        if (!lead) {
            throw ApiError.notFound('Lead not found');
        }

        return ApiResponse.success(res, lead, `Lead status updated to ${status}`);
    }),

    deleteLead: catchError(async (req, res) => {
        const { id } = req.params;
        const lead = await PrelaunchLead.findByIdAndDelete(id);

        if (!lead) {
            throw ApiError.notFound('Lead not found');
        }

        return ApiResponse.success(res, { id }, 'Lead deleted successfully');
    }),
};

export default PrelaunchController;
