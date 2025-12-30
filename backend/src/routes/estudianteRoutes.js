const express = require('express');
const router = express.Router();
const controller = require('../controllers/estudianteController');
const authenticateToken = require('../middleware/authMiddleware');
// Assuming requireAdmin is available if needed, or stick to basic auth, 
// but using authenticateToken for all strictly as base security.

router.use(authenticateToken); // Protect all routes

router.get('/', controller.getAllEstudiantes);
router.get('/:id', controller.getEstudianteById);
router.post('/', controller.createEstudiante);
router.put('/:id', controller.updateEstudiante);
router.delete('/:id', controller.deleteEstudiante);

module.exports = router;
