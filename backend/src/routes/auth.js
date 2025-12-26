const express = require('express');
const router = express.Router();
const { 
    login, 
    activateAccount,
    refreshToken,
    logout,
    getProfile 
} = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const {
    sendResetCode,
    verifyResetCode,
    resendResetCode,
    resetPassword
} = require('../controllers/passwordController');


//Rutas publicas
router.post('/login', login);
router.get('/activarCuenta/:token', activateAccount);

router.post('/forgot-password',sendResetCode);
router.post('/verify-code',verifyResetCode);
router.post('/resend-code',resendResetCode);
router.post('/reset-password',resetPassword);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

router.get('/profile',authenticateToken, getProfile);

module.exports = router;
