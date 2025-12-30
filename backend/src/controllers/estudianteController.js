const EstudianteModel = require('../models/estudianteModel');

async function getAllEstudiantes(req, res, next) {
    try {
        const estudiantes = await EstudianteModel.getAll();
        res.json(estudiantes);
    } catch (err) {
        next(err);
    }
}

async function getEstudianteById(req, res, next) {
    try {
        const { id } = req.params;
        const estudiante = await EstudianteModel.getById(id);
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        res.json(estudiante);
    } catch (err) {
        next(err);
    }
}

async function createEstudiante(req, res, next) {
    try {
        const newEstudiante = await EstudianteModel.create(req.body);
        res.status(201).json(newEstudiante);
    } catch (err) {
        next(err);
    }
}

async function updateEstudiante(req, res, next) {
    try {
        const { id } = req.params;
        const updatedEstudiante = await EstudianteModel.update(id, req.body);
        if (!updatedEstudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado para actualizar' });
        }
        res.json(updatedEstudiante);
    } catch (err) {
        next(err);
    }
}

async function deleteEstudiante(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await EstudianteModel.delete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Estudiante no encontrado para eliminar' });
        }
        res.json({ message: 'Estudiante eliminado' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllEstudiantes,
    getEstudianteById,
    createEstudiante,
    updateEstudiante,
    deleteEstudiante
};
