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

// Get cronogramas with tutoria status for TutorPanel
async function getCronogramas(req, res, next) {
    try {
        const tutorId = req.user.id;
        const { semestre } = req.query;

        if (!semestre) {
            return res.status(400).json({ message: 'Semestre es requerido' });
        }

        const query = `
            SELECT 
                c.id as cronograma_id,
                c.fecha,
                c.hora,
                c.ambiente,
                c.estado,
                e.nombre_estudiante as estudiante_nombre,
                e.apellido_estudiante as estudiante_apellido,
                e.codigo_estudiante,
                t.id as tutoria_id,
                CASE WHEN t.id IS NOT NULL THEN true ELSE false END as tutoria_registrada
            FROM cronogramas c
            INNER JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
            LEFT JOIN tutorias t ON c.id = t.cronograma_id
            WHERE c.tutor_user_id = $1 AND c.semestre = $2
            ORDER BY c.fecha ASC, c.hora ASC
        `;

        const result = await pool.query(query, [tutorId, semestre]);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

// Get tutoria details for editing
async function getTutoriaDetails(req, res, next) {
    try {
        const tutorId = req.user.id;
        const { cronogramaId } = req.params;

        // Verify ownership
        const ownershipQuery = `
            SELECT c.id FROM cronogramas c
            WHERE c.id = $1 AND c.tutor_user_id = $2
        `;
        const ownershipResult = await pool.query(ownershipQuery, [cronogramaId, tutorId]);

        if (ownershipResult.rows.length === 0) {
            return res.status(403).json({ message: 'No autorizado para ver esta tutoría' });
        }

        const query = `
            SELECT t.*
            FROM tutorias t
            WHERE t.cronograma_id = $1
        `;

        const result = await pool.query(query, [cronogramaId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tutoría no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
}

// Create tutoria
async function crearTutoria(req, res, next) {
    const client = await pool.connect();
    try {
        const tutorId = req.user.id;
        const {
            cronograma_id,
            obs_academico,
            obs_personal,
            obs_profesional,
            resumen_general,
            requiere_derivacion,
            modalidad
        } = req.body;

        if (!cronograma_id) {
            return res.status(400).json({ message: 'cronograma_id es requerido' });
        }

        await client.query('BEGIN');

        // Verify ownership
        const ownershipQuery = `
            SELECT id FROM cronogramas
            WHERE id = $1 AND tutor_user_id = $2
        `;
        const ownershipResult = await client.query(ownershipQuery, [cronograma_id, tutorId]);

        if (ownershipResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'No autorizado para registrar esta tutoría' });
        }

        // Check if tutoria already exists
        const existingQuery = `SELECT id FROM tutorias WHERE cronograma_id = $1`;
        const existingResult = await client.query(existingQuery, [cronograma_id]);

        if (existingResult.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Ya existe una tutoría para este cronograma' });
        }

        // Create tutoria
        const tutoriaId = uuidv4();
        await client.query(
            `INSERT INTO tutorias (id, cronograma_id, obs_academico, obs_personal, obs_profesional, resumen_general, requiere_derivacion, modalidad)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [tutoriaId, cronograma_id, obs_academico, obs_personal, obs_profesional, resumen_general, requiere_derivacion || false, modalidad || 'Individual']
        );

        // Update cronograma status
        await client.query(
            `UPDATE cronogramas SET estado = 'realizada' WHERE id = $1`,
            [cronograma_id]
        );

        await client.query('COMMIT');
        res.json({ message: 'Tutoría creada con éxito', tutoriaId });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
}

// Update tutoria
async function actualizarTutoria(req, res, next) {
    const client = await pool.connect();
    try {
        const tutorId = req.user.id;
        const { tutoriaId } = req.params;
        const {
            obs_academico,
            obs_personal,
            obs_profesional,
            resumen_general,
            requiere_derivacion
        } = req.body;

        await client.query('BEGIN');

        // Verify ownership through cronograma
        const ownershipQuery = `
            SELECT t.id FROM tutorias t
            INNER JOIN cronogramas c ON t.cronograma_id = c.id
            WHERE t.id = $1 AND c.tutor_user_id = $2
        `;
        const ownershipResult = await client.query(ownershipQuery, [tutoriaId, tutorId]);

        if (ownershipResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'No autorizado para actualizar esta tutoría' });
        }

        // Update tutoria
        await client.query(
            `UPDATE tutorias 
             SET obs_academico = $1, obs_personal = $2, obs_profesional = $3, 
                 resumen_general = $4, requiere_derivacion = $5
             WHERE id = $6`,
            [obs_academico, obs_personal, obs_profesional, resumen_general, requiere_derivacion, tutoriaId]
        );

        await client.query('COMMIT');
        res.json({ message: 'Tutoría actualizada con éxito' });
    } catch (err) {
        await client.query('ROLLBACK');
        // Check if error is from database trigger
        if (err.message && err.message.includes('No se puede modificar')) {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    } finally {
        client.release();
    }
}

module.exports = {
    getMisTutorados,
    getActividades,
    registrarSesion,
    getCronogramas,
    getTutoriaDetails,
    crearTutoria,
    actualizarTutoria
};
