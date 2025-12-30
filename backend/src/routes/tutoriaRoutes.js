const express = require('express');
const router = express.Router();
const controller = require('../controllers/tutoriaController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', controller.getAllTutorias);
router.get('/:id', controller.getTutoriaById);
router.post('/', controller.createTutoria);
router.put('/:id', controller.updateTutoria);
router.delete('/:id', controller.deleteTutoria);

module.exports = router;
