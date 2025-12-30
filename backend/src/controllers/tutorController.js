const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

async function getMisTutorados(req, res, next) {
    try {
        const tutorId = req.user.id;
        const { semestre } = req.query;

        if (!semestre) {
            return res.status(400).json({ message: 'Semestre es requerido' });
        }

        const query = `
      SELECT e.codigo_estudiante as id, e.codigo_estudiante as code, e.nombre_estudiante as first_name, e.apellido_estudiante as last_name
      FROM tutor_asignacion ta
      INNER JOIN estudiante e ON ta.codigo_estudiante = e.codigo_estudiante
      WHERE ta.tutor_user_id = $1 AND ta.semestre = $2 AND ta.estado = 'activo'
      ORDER BY e.apellido_estudiante ASC
    `;

        const result = await pool.query(query, [tutorId, semestre]);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

async function getActividades(req, res, next) {
    try {
        const tutorId = req.user.id;
        const { semestre } = req.query;

        const query = `
      SELECT c.*, e.nombre_estudiante, e.apellido_estudiante
      FROM cronogramas c
      INNER JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
      WHERE c.tutor_user_id = $1 ${semestre ? 'AND c.semestre = $2' : ''}
      ORDER BY c.fecha DESC, c.hora DESC
    `;

        const params = [tutorId];
        if (semestre) params.push(semestre);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

async function registrarSesion(req, res, next) {
    const client = await pool.connect();
    try {
        const tutorId = req.user.id;
        const {
            codigo_estudiante,
            semestre,
            fecha,
            hora,
            ambiente,
            obs_academico,
            obs_personal,
            obs_profesional,
            resumen_general,
            requiere_derivacion,
            modalidad,
            cronograma_id // opcional, si viene de una programada
        } = req.body;

        await client.query('BEGIN');

        let finalCronogramaId = cronograma_id;

        if (!finalCronogramaId) {
            // Crear un cronograma al vuelo si no existe
            const cronoId = uuidv4();
            await client.query(
                `INSERT INTO cronogramas (id, tutor_user_id, codigo_estudiante, fecha, hora, ambiente, semestre, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'realizada')`,
                [cronoId, tutorId, codigo_estudiante, fecha || new Date(), hora || '00:00', ambiente || 'Virtual', semestre, 'realizada']
            );
            finalCronogramaId = cronoId;
        } else {
            // Actualizar estado del cronograma existente
            await client.query(
                `UPDATE cronogramas SET estado = 'realizada' WHERE id = $1`,
                [finalCronogramaId]
            );
        }

        const tutoriaId = uuidv4();
        await client.query(
            `INSERT INTO tutorias (id, cronograma_id, obs_academico, obs_personal, obs_profesional, resumen_general, requiere_derivacion, modalidad)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [tutoriaId, finalCronogramaId, obs_academico, obs_personal, obs_profesional, resumen_general, requiere_derivacion || false, modalidad || 'Individual']
        );

        await client.query('COMMIT');
        res.json({ message: 'Sesión registrada con éxito', tutoriaId });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
}

module.exports = {
    getMisTutorados,
    getActividades,
    registrarSesion
};
