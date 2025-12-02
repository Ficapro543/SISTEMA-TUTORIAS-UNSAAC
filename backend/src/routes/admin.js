const express = require('express');
const router = express.Router();
const { createPendingUser, approvePendingUser } = require('../controllers/adminController');

router.post('/solicitud', createPendingUser); // nuevo registro
router.post('/aprobar', approvePendingUser);  // admin aprueba

module.exports = router;
