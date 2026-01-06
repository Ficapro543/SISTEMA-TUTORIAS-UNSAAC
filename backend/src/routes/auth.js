const express = require('express');
const router = express.Router();
const {
    login,
    activateAccount,
    refreshToken,
    logout,
    getProfile,
    googleLogin,
    updateProfile,
    changePassword,
    deleteAccount
} = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const {
    sendResetCode,
    verifyResetCode,
    resendResetCode,
    resetPassword,

} = require('../controllers/passwordController');


//Rutas publicas
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/activarCuenta/:token', activateAccount);

router.post('/forgot-password', sendResetCode);
router.post('/verify-code', verifyResetCode);
router.post('/resend-code', resendResetCode);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshToken);
router.post('/logout', logout);


router.get('/profile', authenticateToken, getProfile);
router.put('/update-profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.delete('/delete-account', authenticateToken, deleteAccount);

module.exports = router;
