const express = require('express');
const router = express.Router();
const { login, activateAccount } = require('../controllers/authController');

router.post('/login', login);
router.get('/activarCuenta/:userId', activateAccount);

module.exports = router;
