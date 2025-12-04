const express = require('express');
const router = express.Router();
const { createPendingUser, approvePendingUser } = require('../controllers/adminController');

router.post('/solicitud', createPendingUser);
router.post('/aprobar', approvePendingUser);

module.exports = router;
