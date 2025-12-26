const express = require('express');
const router = express.Router();
const {
    getActiveSemester,
    getAllSemesters,
    getTutors,
    getUnassignedStudents,
    assignStudents,
    getDashboardStats,
    getStudentsByTutor,
    transferStudents
} = require('../controllers/assignmentController');

const {
    debugSeed,
    debugPromote,
    debugCreateAdmin
} = require('../controllers/developmentController');

// Core Routes
router.get('/semester/active', getActiveSemester);
router.get('/semesters', getAllSemesters);
router.get('/stats', getDashboardStats);
router.get('/tutors', getTutors);
router.get('/students/unassigned', getUnassignedStudents);
router.get('/tutor/:tutorId/students', getStudentsByTutor);
router.post('/', assignStudents);
router.put('/transfer', transferStudents);

// Development/Debug Routes
router.get('/debug/seed', debugSeed);
router.get('/debug/promote', debugPromote);
router.get('/debug/create_admin', debugCreateAdmin);

module.exports = router;
