const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/cronogramas/tutor/:id', authenticateToken, tutorController.getCronogramasByTutor);
router.post('/tutorias', authenticateToken, tutorController.registerTutoria);
// Assuming frontend sends the tutor ID as param for now, matching the controller logic
router.get('/estudiantes/asignados/:id', authenticateToken, tutorController.getAssignedStudents);

module.exports = router;
