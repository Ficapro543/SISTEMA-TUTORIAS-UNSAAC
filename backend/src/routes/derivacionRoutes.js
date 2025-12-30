const express = require('express');
const router = express.Router();
const controller = require('../controllers/derivacionController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', controller.getAllDerivaciones);
router.get('/:id', controller.getDerivacionById);
router.post('/', controller.createDerivacion);
router.put('/:id', controller.updateDerivacion);
router.delete('/:id', controller.deleteDerivacion);

module.exports = router;
