const express = require('express');
const router = express.Router();
const tutoriasController = require('../controllers/tutoriasController');
const authenticateToken = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar tutorías de un tutor (dashboard principal)
router.get('/tutor/:tutorId', tutoriasController.getTutoriasByTutor);

// Registrar una nueva tutoría (acción del botón "+ Registrar")
router.post('/registrar', tutoriasController.registrarTutoria);

// Actualizar una tutoría existente (acción del botón "Editar")
router.put('/actualizar/:id', tutoriasController.actualizarTutoria);

// Historial del estudiante (casos especiales)
router.get('/historial/:codigoEstudiante', tutoriasController.getHistorialEstudiante);

module.exports = router;
