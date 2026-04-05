const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.put('/password', authController.changePassword);

module.exports = router;
