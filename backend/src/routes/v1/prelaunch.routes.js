import { Router } from 'express';
import { PrelaunchController } from '../../controllers/prelaunch.controller.js';

const router = Router();

router.post('/lead', PrelaunchController.submitLead);
router.get('/leads', PrelaunchController.getLeads);

export default router;
