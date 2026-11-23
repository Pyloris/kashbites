import { Router } from 'express';
import { PrelaunchController } from '../../controllers/prelaunch.controller.js';
import { auth } from '../../middleware/auth/index.js';

const router = Router();
const adminAuth = auth({ role: ['superadmin'] });

// Public prelaunch lead collection endpoint
router.post('/lead', PrelaunchController.submitLead);

// Prelaunch leads management endpoints (admin only)
router.get('/leads', adminAuth, PrelaunchController.getLeads);
router.patch('/leads/:id/status', adminAuth, PrelaunchController.updateLeadStatus);
router.delete('/leads/:id', adminAuth, PrelaunchController.deleteLead);

export default router;
