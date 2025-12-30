const express = require('express');
const router = express.Router();
const controller = require('../controllers/tutorController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', controller.getAllTutores);
router.get('/:id', controller.getTutorById);
router.post('/', controller.createTutor);
router.put('/:id', controller.updateTutor);
router.delete('/:id', controller.deleteTutor);

module.exports = router;
