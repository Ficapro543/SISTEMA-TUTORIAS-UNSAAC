const express = require('express');
const router = express.Router();
const { createPendingUser, 
    approvePendingUser, 
    getAllPendingUser, 
    getOnePendingUser,
    rejectOnePendingUser,
    decideRol } = require('../controllers/adminController');

router.post('/solicitud', createPendingUser);
router.post('/aprobar', approvePendingUser);
router.get('/solicitudes',getAllPendingUser);
router.get('/solicitud/:id',getOnePendingUser);
router.put('/solicitud/:pendingUserId/rol/:rol', decideRol);
router.post('/rechazar/',rejectOnePendingUser);


module.exports = router;
