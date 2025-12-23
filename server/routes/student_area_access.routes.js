import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import { requestAccess, myRequests, myPermissions, listRequests, approve, deny } from '../controllers/student_area_access.controller.js';

const router = Router();

// Student endpoints
router.post('/student/area-requests', authREquired, requestAccess);
router.get('/student/area-requests', authREquired, myRequests);
router.get('/student/area-permissions', authREquired, myPermissions);

// Advisor/Admin endpoints
router.get('/advisor/area-requests', authREquired, listRequests);
router.post('/advisor/area-requests/:id/approve', authREquired, approve);
router.post('/advisor/area-requests/:id/deny', authREquired, deny);

export default router;
