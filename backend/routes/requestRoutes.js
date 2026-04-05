const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');


const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Public route: anyone (student or anonymous) can submit a correction ticket
router.post('/', requestController.createRequest);

// Protected admin routes: viewing and updating requests require authentication + admin role
router.get('/', requireAuth, requireAdmin, requestController.getRequests);
router.put('/:id/status', requireAuth, requireAdmin, requestController.updateRequestStatus);

module.exports = router;
