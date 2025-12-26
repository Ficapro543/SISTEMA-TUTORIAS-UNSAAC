const express = require('express');
const router = express.Router();
const { createPendingUser, 
    approvePendingUser, 
    getAllPendingUser, 
    getOnePendingUser,
    rejectOnePendingUser,
    decideRol,
    getSemestresCerrados, 
    getTutoriasPorSemestre, 
    getTutoriaDetalle 
} = require('../controllers/adminController');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/semestres',requireAdmin, getSemestresCerrados);
router.get('/tutorias',requireAdmin, getTutoriasPorSemestre);
router.get('/tutorias/:id',requireAdmin, getTutoriaDetalle);
//Auth
router.post('/solicitud', createPendingUser);
router.post('/aprobar', approvePendingUser);
router.get('/solicitudes',getAllPendingUser);
router.get('/solicitud/:id',getOnePendingUser);
router.put('/solicitud/:pendingUserId/rol/:rol', decideRol);
router.post('/rechazar/',rejectOnePendingUser);


module.exports = router;
