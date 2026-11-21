import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { PrelaunchLead } from '../src/database/models/prelaunch-leads.model.js';
import { PrelaunchController } from '../src/controllers/prelaunch.controller.js';
import { AdminService } from '../src/services/admin.service.js';

describe('Prelaunch VIP Leads Management Suite', () => {
    let testLeadId = null;
    const testPhone = '+919999888877';

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect('mongodb://localhost:27017/kashbites');
        }
        await PrelaunchLead.deleteMany({ phone: testPhone });
    });

    after(async () => {
        if (testLeadId) {
            await PrelaunchLead.findByIdAndDelete(testLeadId).catch(() => {});
        }
        await PrelaunchLead.deleteMany({ phone: testPhone });
        await mongoose.disconnect().catch(() => {});
    });

    it('1. PrelaunchController.submitLead creates a new prelaunch lead', async () => {
        const req = {
            body: {
                phone: '9999888877',
                countryCode: '+91',
                name: 'Kashmiri VIP Gourmet',
            },
            ip: '127.0.0.1',
            headers: {
                'user-agent': 'NodeTestAgent/1.0',
            },
        };

        let responseData = null;
        const res = {
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(data) {
                responseData = data;
                return this;
            },
        };

        await PrelaunchController.submitLead(req, res);

        assert.ok(responseData, 'Response should not be null');
        assert.strictEqual(responseData.status, 1);
        assert.strictEqual(responseData.data.phone, testPhone);
        assert.strictEqual(responseData.data.couponCode, 'KASHLAUNCH20');

        testLeadId = responseData.data.leadId;
        const savedInDb = await PrelaunchLead.findById(testLeadId);
        assert.ok(savedInDb);
        assert.strictEqual(savedInDb.name, 'Kashmiri VIP Gourmet');
    });

    it('2. PrelaunchController.getLeads returns leads list and calculated statistics', async () => {
        const req = { query: { limit: 10, page: 1 } };
        let responseData = null;
        const res = {
            status() { return this; },
            json(data) {
                responseData = data;
                return this;
            },
        };

        await PrelaunchController.getLeads(req, res);

        assert.ok(responseData);
        assert.strictEqual(responseData.status, 1);
        assert.ok(Array.isArray(responseData.data.leads));
        assert.ok(responseData.data.total >= 1);
        assert.ok(responseData.data.stats);
        assert.ok(typeof responseData.data.stats.totalLeads === 'number');
        assert.ok(typeof responseData.data.stats.withName === 'number');
    });

    it('3. PrelaunchController.getLeads filters by search query on name and phone', async () => {
        const req = { query: { search: 'VIP Gourmet' } };
        let responseData = null;
        const res = {
            status() { return this; },
            json(data) {
                responseData = data;
                return this;
            },
        };

        await PrelaunchController.getLeads(req, res);

        assert.ok(responseData);
        assert.strictEqual(responseData.status, 1);
        assert.ok(responseData.data.leads.length >= 1);
        const match = responseData.data.leads.find((l) => l.phone === testPhone);
        assert.ok(match, 'Should find the test lead by name query');
    });

    it('4. PrelaunchController.updateLeadStatus updates lead status to notified', async () => {
        const req = {
            params: { id: testLeadId },
            body: { status: 'notified' },
        };
        let responseData = null;
        const res = {
            status() { return this; },
            json(data) {
                responseData = data;
                return this;
            },
        };

        await PrelaunchController.updateLeadStatus(req, res);

        assert.ok(responseData);
        assert.strictEqual(responseData.status, 1);
        assert.strictEqual(responseData.data.status, 'notified');

        const updatedInDb = await PrelaunchLead.findById(testLeadId);
        assert.strictEqual(updatedInDb.status, 'notified');
    });

    it('5. AdminService.getDashboardStats includes totalPrelaunchLeads', async () => {
        const stats = await AdminService.getDashboardStats();
        assert.ok(stats);
        assert.ok(typeof stats.totalPrelaunchLeads === 'number');
        assert.ok(stats.totalPrelaunchLeads >= 1);
    });

    it('6. PrelaunchController.deleteLead successfully removes the lead', async () => {
        const req = { params: { id: testLeadId } };
        let responseData = null;
        const res = {
            status() { return this; },
            json(data) {
                responseData = data;
                return this;
            },
        };

        await PrelaunchController.deleteLead(req, res);

        assert.ok(responseData);
        assert.strictEqual(responseData.status, 1);

        const checkedInDb = await PrelaunchLead.findById(testLeadId);
        assert.strictEqual(checkedInDb, null, 'Lead should no longer exist in database');
        testLeadId = null;
    });
});
