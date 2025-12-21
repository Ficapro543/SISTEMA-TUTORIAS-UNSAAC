const express = require('express');
const router = express.Router();
const { login, activateAccount } = require('../controllers/authController');
const {
    sendResetCode,
    verifyResetCode,
    resendResetCode,
    resetPassword
} = require('../controllers/passwordController');

router.post('/login', login);
router.get('/activarCuenta/:token', activateAccount);

router.post('/forgot-password',sendResetCode);
router.post('/verify-code',verifyResetCode);
router.post('/resend-code',resendResetCode);
router.post('/reset-password',resetPassword);

module.exports = router;
