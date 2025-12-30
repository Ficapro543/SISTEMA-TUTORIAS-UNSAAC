const CronogramaModel = require('../models/cronogramaModel');

async function getAllCronogramas(req, res, next) {
    try {
        const cronogramas = await CronogramaModel.getAll();
        res.json(cronogramas);
    } catch (err) {
        next(err);
    }
}

async function getCronogramaById(req, res, next) {
    try {
        const { id } = req.params;
        const cronograma = await CronogramaModel.getById(id);
        if (!cronograma) {
            return res.status(404).json({ message: 'Cronograma no encontrado' });
        }
        res.json(cronograma);
    } catch (err) {
        next(err);
    }
}

async function createCronograma(req, res, next) {
    try {
        const newCronograma = await CronogramaModel.create(req.body);
        res.status(201).json(newCronograma);
    } catch (err) {
        // Handle trigger errors
        if (err.message.includes('No se puede modificar cronogramas de fechas pasadas')) {
            return res.status(400).json({ message: err.message });
        }
        if (err.message.includes('La asignación no es válida')) {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
}

async function updateCronograma(req, res, next) {
    try {
        const { id } = req.params;
        const updatedCronograma = await CronogramaModel.update(id, req.body);
        if (!updatedCronograma) {
            return res.status(404).json({ message: 'Cronograma no encontrado' });
        }
        res.json(updatedCronograma);
    } catch (err) {
        if (err.message.includes('No se puede modificar cronogramas de fechas pasadas')) {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
}

async function deleteCronograma(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await CronogramaModel.delete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Cronograma no encontrado' });
        }
        res.json({ message: 'Cronograma eliminado' });
    } catch (err) {
        if (err.message.includes('No se puede eliminar un cronograma ya realizado')) {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
}

module.exports = {
    getAllCronogramas,
    getCronogramaById,
    createCronograma,
    updateCronograma,
    deleteCronograma
};
