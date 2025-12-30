const TutoriaModel = require('../models/tutoriaModel');

async function getAllTutorias(req, res, next) {
    try {
        const tutorias = await TutoriaModel.getAll();
        res.json(tutorias);
    } catch (err) {
        next(err);
    }
}

async function getTutoriaById(req, res, next) {
    try {
        const { id } = req.params;
        const tutoria = await TutoriaModel.getById(id);
        if (!tutoria) {
            return res.status(404).json({ message: 'Tutoría no encontrada' });
        }
        res.json(tutoria);
    } catch (err) {
        next(err);
    }
}

async function createTutoria(req, res, next) {
    try {
        const newTutoria = await TutoriaModel.create(req.body);
        res.status(201).json(newTutoria);
    } catch (err) {
        next(err);
    }
}

async function updateTutoria(req, res, next) {
    try {
        const { id } = req.params;
        const updatedTutoria = await TutoriaModel.update(id, req.body);
        if (!updatedTutoria) {
            return res.status(404).json({ message: 'Tutoría no encontrada' });
        }
        res.json(updatedTutoria);
    } catch (err) {
        if (err.message.includes('No se puede modificar tutorías de fechas pasadas')) {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
}

async function deleteTutoria(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await TutoriaModel.delete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Tutoría no encontrada' });
        }
        res.json({ message: 'Tutoría eliminada' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllTutorias,
    getTutoriaById,
    createTutoria,
    updateTutoria,
    deleteTutoria
};
