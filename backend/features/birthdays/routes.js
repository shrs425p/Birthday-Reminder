const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    addBirthday,
    getBirthdays,
    getTodaysBirthdays,
    getUpcomingBirthdays,     // ✅ Included
    getStats,
    updateBirthday,
    deleteBirthday,
    uploadExcelBirthdays,
    sendBirthdayWishes,
    sendTodayBirthdayWishes,
    sendIndividualWish
} = require('./controller');

const { requireAuth, requireAdmin } = require('../../middleware/authMiddleware');

const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../../uploads/') });

// Public routes (used by homepage)
router.get('/today', getTodaysBirthdays);
router.get('/upcoming', getUpcomingBirthdays);
router.get('/', getBirthdays);

// Protected routes
router.use(requireAuth); // Everything below requires a valid (student or admin) token
router.get('/stats', requireAdmin, getStats); // Admin only gets stats
router.post('/', requireAdmin, addBirthday);
router.put('/:id', requireAdmin, updateBirthday);
router.delete('/:id', requireAdmin, deleteBirthday);

router.post('/upload', requireAdmin, upload.single('file'), uploadExcelBirthdays);
router.post('/wish', requireAdmin, sendBirthdayWishes);

// Individual-send via admin SMTP removed; home opens mailto links now

module.exports = router;
