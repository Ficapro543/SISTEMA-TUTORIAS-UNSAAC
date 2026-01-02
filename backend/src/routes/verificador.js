const express = require('express');
const router = express.Router();
const requireVerifier = require('../middleware/requireVerifier');

const { getEstudiantesPorSemestreEstado } = require('../controllers/verificadorController');

router.get('/estudiantes', requireVerifier, getEstudiantesPorSemestreEstado);

module.exports = router;
