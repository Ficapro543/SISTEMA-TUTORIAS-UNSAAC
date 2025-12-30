const AsignacionModel = require('../models/asignacionModel');

async function getAllAsignaciones(req, res, next) {
    try {
        const asignaciones = await AsignacionModel.getAll();
        res.json(asignaciones);
    } catch (err) {
        next(err);
    }
}

async function getAsignacionById(req, res, next) {
    try {
        const { id } = req.params;
        const asignacion = await AsignacionModel.getById(id);
        if (!asignacion) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
        }
        res.json(asignacion);
    } catch (err) {
        next(err);
    }
}

async function createAsignacion(req, res, next) {
    try {
        // Validate unique constraint logic if needed before calling model, 
        // but Unique Index `uq_asignacion_activa` will throw error if duplicate.
        const newAsignacion = await AsignacionModel.create(req.body);
        res.status(201).json(newAsignacion);
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ message: 'El estudiante ya tiene una asignación activa en este semestre.' });
        }
        next(err);
    }
}

async function updateAsignacion(req, res, next) {
    try {
        const { id } = req.params;
        const updatedAsignacion = await AsignacionModel.update(id, req.body);
        if (!updatedAsignacion) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
        }
        res.json(updatedAsignacion);
    } catch (err) {
        next(err);
    }
}

async function deleteAsignacion(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await AsignacionModel.delete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
        }
        res.json({ message: 'Asignación eliminada' });
    } catch (err) {
        next(err); // Foreign key constraint might trigger here
    }
}

module.exports = {
    getAllAsignaciones,
    getAsignacionById,
    createAsignacion,
    updateAsignacion,
    deleteAsignacion
};
