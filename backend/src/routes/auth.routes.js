const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateUser } = require('../middleware/auth');
const { loginLimiter, registerLimiter, guestLimiter, forgotPasswordLimiter } = require('../middleware/rateLimit');

router.post('/register',registerLimiter, authController.register);
router.post('/guest', guestLimiter, authController.guest);
router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/logout', authenticateUser, authController.logout);
router.get('/me', authenticateUser, authController.me);

module.exports = router;