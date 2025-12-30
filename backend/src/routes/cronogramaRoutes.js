const express = require('express');
const router = express.Router();
const controller = require('../controllers/cronogramaController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', controller.getAllCronogramas);
router.get('/:id', controller.getCronogramaById);
router.post('/', controller.createCronograma);
router.put('/:id', controller.updateCronograma);
router.delete('/:id', controller.deleteCronograma);

module.exports = router;
