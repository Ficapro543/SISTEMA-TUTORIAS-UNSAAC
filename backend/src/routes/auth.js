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
<<<<<<< HEAD
=======

router.post('/forgot-password',sendResetCode);
router.post('/verify-code',verifyResetCode);
router.post('/resend-code',resendResetCode);
router.post('/reset-password',resetPassword);
>>>>>>> 31c11758dedee6a1020539582df055909da6196a

module.exports = router;
