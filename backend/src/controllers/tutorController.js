const TutorModel = require('../models/tutorModel');

async function getAllTutores(req, res, next) {
    try {
        const tutores = await TutorModel.getAll();
        res.json(tutores);
    } catch (err) {
        next(err);
    }
}

async function getTutorById(req, res, next) {
    try {
        const { id } = req.params;
        const tutor = await TutorModel.getById(id);
        if (!tutor) {
            return res.status(404).json({ message: 'Tutor no encontrado' });
        }
        res.json(tutor);
    } catch (err) {
        next(err);
    }
}

async function createTutor(req, res, next) {
    try {
        // Expects user_id to be provided (e.g. from an existing user)
        const newTutor = await TutorModel.create(req.body);
        res.status(201).json(newTutor);
    } catch (err) {
        next(err);
    }
}

async function updateTutor(req, res, next) {
    try {
        const { id } = req.params;
        const updatedTutor = await TutorModel.update(id, req.body);
        if (!updatedTutor) {
            return res.status(404).json({ message: 'Tutor no encontrado para actualizar' });
        }
        res.json(updatedTutor);
    } catch (err) {
        next(err);
    }
}

async function deleteTutor(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await TutorModel.delete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Tutor no encontrado para eliminar' });
        }
        res.json({ message: 'Rol de tutor eliminado para el usuario' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllTutores,
    getTutorById,
    createTutor,
    updateTutor,
    deleteTutor
};
