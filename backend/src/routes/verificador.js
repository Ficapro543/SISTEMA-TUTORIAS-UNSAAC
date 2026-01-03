const express = require('express');
const router = express.Router();
const requireVerifier = require('../middleware/requireVerifier');

const {
    getEstudiantes,
    getTutorias,
    getFiltrosEstudiantes,
    getFiltrosTutorias,
    getTutoriaDetalle,
    buscarEstudiante,
    getHistorialEstudiante,
    getTutores,
    getSeguimientoTutor
} = require('../controllers/verificadorController');

// Filtros Dinámicos
router.get('/filtros/estudiantes-atendidos', requireVerifier, getFiltrosEstudiantes);
router.get('/filtros/consulta-tutorias', requireVerifier, getFiltrosTutorias);

// HU-VER-01: Estudiantes Atendidos (Fecha + Estado)
router.get('/estudiantes', requireVerifier, getEstudiantes);

// HU-VER-02: Consulta Tutorias
router.get('/tutorias', requireVerifier, getTutorias);
// FIX: Ruta explicita antes de rutas con parametros variables si hubiera conflicto
router.get('/tutorias/detalle', requireVerifier, getTutoriaDetalle); // usa ?cronogramaId=

router.get('/estudiantes/buscar', requireVerifier, buscarEstudiante);
router.get('/estudiantes/:codigo/historial', requireVerifier, getHistorialEstudiante);

router.get('/tutores', requireVerifier, getTutores);
router.get('/tutores/:id/seguimiento', requireVerifier, getSeguimientoTutor);

module.exports = router;
