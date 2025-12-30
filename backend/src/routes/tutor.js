const express = require('express');
const router = express.Router();
const {
    getMisTutorados,
    getActividades,
    registrarSesion
} = require('../controllers/tutorController');
const requireTutor = require('../middleware/requireTutor');

router.get('/tutorados', requireTutor, getMisTutorados);
router.get('/actividades', requireTutor, getActividades);
router.post('/registrar-sesion', requireTutor, registrarSesion);

module.exports = router;
