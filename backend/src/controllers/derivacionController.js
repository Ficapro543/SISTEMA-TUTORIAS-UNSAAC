const DerivacionModel = require('../models/derivacionModel');

async function getAllDerivaciones(req, res, next) {
    try {
        const derivaciones = await DerivacionModel.getAll();
        res.json(derivaciones);
    } catch (err) {
        next(err);
    }
}

async function getDerivacionById(req, res, next) {
    try {
        const { id } = req.params;
        const derivacion = await DerivacionModel.getById(id);
        if (!derivacion) {
            return res.status(404).json({ message: 'Derivación no encontrada' });
        }
        res.json(derivacion);
    } catch (err) {
        next(err);
    }
}

async function createDerivacion(req, res, next) {
    try {
        const newDerivacion = await DerivacionModel.create(req.body);
        res.status(201).json(newDerivacion);
    } catch (err) {
        next(err);
    }
}

async function updateDerivacion(req, res, next) {
    try {
        const { id } = req.params;
        const updatedDerivacion = await DerivacionModel.update(id, req.body);
        if (!updatedDerivacion) {
            return res.status(404).json({ message: 'Derivación no encontrada' });
        }
        res.json(updatedDerivacion);
    } catch (err) {
        next(err);
    }
}

async function deleteDerivacion(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await DerivacionModel.delete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Derivación no encontrada' });
        }
        res.json({ message: 'Derivación eliminada' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllDerivaciones,
    getDerivacionById,
    createDerivacion,
    updateDerivacion,
    deleteDerivacion
};
