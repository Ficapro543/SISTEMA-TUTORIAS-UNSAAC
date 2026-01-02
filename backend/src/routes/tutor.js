const express = require('express');
const router = express.Router();
const {
    getMisTutorados,
    getActividades,
    registrarSesion,
    getCronogramas,
    getTutoriaDetails,
    crearTutoria,
    actualizarTutoria
} = require('../controllers/tutorController');
const requireTutor = require('../middleware/requireTutor');

router.get('/tutorados', requireTutor, getMisTutorados);
router.get('/actividades', requireTutor, getActividades);
router.post('/registrar-sesion', requireTutor, registrarSesion);

// New routes for TutorPanel
router.get('/cronogramas', requireTutor, getCronogramas);
router.get('/tutoria/:cronogramaId', requireTutor, getTutoriaDetails);
router.post('/tutoria', requireTutor, crearTutoria);
router.put('/tutoria/:tutoriaId', requireTutor, actualizarTutoria);

module.exports = router;
