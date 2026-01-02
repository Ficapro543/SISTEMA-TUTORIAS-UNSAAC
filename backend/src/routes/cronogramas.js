const express = require('express');
const router = express.Router();
const {
    getCronogramas,
    createCronograma,
    getCronogramaById,
    updateCronograma,
    deleteCronograma
} = require('../controllers/cronogramaController');

// Rutas de cronogramas
router.get('/', getCronogramas);
router.post('/', createCronograma);
router.get('/:id', getCronogramaById);
router.put('/:id', updateCronograma);
router.delete('/:id', deleteCronograma);

module.exports = router;
