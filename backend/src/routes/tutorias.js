const express = require('express');
const router = express.Router();
const tutoriasController = require('../controllers/tutoriasController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../utils/multerMemory'); // Updated to Memory Storage

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar tutorías de un tutor (dashboard principal)
router.get('/tutor/:tutorId', tutoriasController.getTutoriasByTutor);

// Registrar una nueva tutoría (acción del botón "+ Registrar")
router.post('/registrar', upload.single('archivo'), tutoriasController.registrarTutoria);

// Actualizar una tutoría existente (acción del botón "Editar")
router.put('/actualizar/:id', upload.single('archivo'), tutoriasController.actualizarTutoria);

// Historial del estudiante (casos especiales)
router.get('/historial/:codigoEstudiante', tutoriasController.getHistorialEstudiante);

// Ruta para descargar/ver archivo adjunto
router.get('/archivo/:tutoriaId', tutoriasController.descargarArchivo);

module.exports = router;
