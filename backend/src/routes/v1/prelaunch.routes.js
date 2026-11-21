import { Router } from 'express';
import { PrelaunchController } from '../../controllers/prelaunch.controller.js';

const router = Router();

// Public prelaunch lead collection endpoint
router.post('/lead', PrelaunchController.submitLead);

// Prelaunch leads management endpoints
router.get('/leads', PrelaunchController.getLeads);
router.patch('/leads/:id/status', PrelaunchController.updateLeadStatus);
router.delete('/leads/:id', PrelaunchController.deleteLead);

export default router;
