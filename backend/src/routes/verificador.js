const express = require('express');
const router = express.Router();
const requireVerifier = require('../middleware/requireVerifier');

const {
    getEstudiantesPorSemestreEstado,
    getTutoriasPorSemestre,
    buscarEstudiante,
    getHistorialEstudiante,
    getTutores,
    getSeguimientoTutor
} = require('../controllers/verificadorController');

// HU-VER-01
router.get('/estudiantes', requireVerifier, getEstudiantesPorSemestreEstado);

// HU-VER-02
router.get('/tutorias', requireVerifier, getTutoriasPorSemestre);

// HU-VER-03
router.get('/estudiantes/buscar', requireVerifier, buscarEstudiante);
router.get('/estudiantes/:codigo/historial', requireVerifier, getHistorialEstudiante);

// HU-VER-04
router.get('/tutores', requireVerifier, getTutores);
router.get('/tutores/:id/seguimiento', requireVerifier, getSeguimientoTutor);

module.exports = router;
