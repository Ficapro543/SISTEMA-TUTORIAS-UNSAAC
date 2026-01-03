const express = require('express');
const router = express.Router();
const { 
    createPendingUser,
    approvePendingUser,
    getOnePendingUser,
    getPendingUsers,
    rejectPendingUser,
    decideRol,
    getSemestresCerrados,
    getTutoriasPorSemestre,
    getTutoriasPorEstudiante,
    getTutoriaDetalle
} = require('../controllers/adminController');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/semestres', requireAdmin, getSemestresCerrados);
router.get('/tutorias', requireAdmin, getTutoriasPorSemestre);
router.get('/tutorias/estudiante',requireAdmin, getTutoriasPorEstudiante);
router.get('/tutorias/:id', requireAdmin, getTutoriaDetalle);
//Auth
router.post('/solicitud', createPendingUser);
router.get('/solicitudes', getPendingUsers);
router.get('/solicitud/:id', getOnePendingUser);
router.put('/solicitud/:pendingUserId/rol/:rol', decideRol);

router.post('/aprobar', approvePendingUser);
router.post('/rechazar', rejectPendingUser);

module.exports = router;
