const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.use(requireAuth);
router.use(requireAdmin); // Only admins can access settings

router.get('/', settingsController.getSettings);
router.put('/:key', settingsController.updateSetting);

module.exports = router;
