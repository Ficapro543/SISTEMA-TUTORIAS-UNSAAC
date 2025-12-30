const express = require('express');
const router = express.Router();
const controller = require('../controllers/asignacionController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', controller.getAllAsignaciones);
router.get('/:id', controller.getAsignacionById);
router.post('/', controller.createAsignacion);
router.put('/:id', controller.updateAsignacion);
router.delete('/:id', controller.deleteAsignacion);

module.exports = router;
