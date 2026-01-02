const pool = require('../db/pool');

/**
 * Listar todas las tutorías (cronogramas) de un tutor.
 * Une con la tabla 'tutorias' para saber si ya fue realizada y traer detalles.
 */
const getTutoriasByTutor = async (req, res) => {
    const { tutorId } = req.params; // ID del usuario (tutor)

    try {
        const query = `
            SELECT 
                c.id as cronograma_id, 
                c.fecha, 
                c.hora, 
                c.ambiente as aula, 
                c.estado as estado_cronograma,
                e.codigo_estudiante, 
                e.nombre_estudiante, 
                e.apellido_estudiante,
                t.id as tutoria_id, 
                t.obs_academico, 
                t.obs_personal, 
                t.obs_profesional, 
                t.requiere_derivacion,
                d.especialidad as derivacion_especialidad,
                d.motivo as derivacion_motivo
            FROM cronogramas c
            JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
            LEFT JOIN tutorias t ON c.id = t.cronograma_id
            LEFT JOIN derivaciones d ON t.id = d.tutoria_id
            WHERE c.tutor_user_id = $1
            ORDER BY c.fecha DESC, c.hora DESC
        `;

        const result = await pool.query(query, [tutorId]);
        res.json(result.rows);

    } catch (error) {
        console.error('Error en getTutoriasByTutor:', error);
        res.status(500).json({ message: 'Error al obtener las tutorías.' });
    }
};

/**
 * Registrar una nueva tutoría.
 * Se asume que existe un cronograma previo.
 * Realiza una transacción para:
 * 1. Insertar en 'tutorias'
 * 2. Actualizar 'cronogramas' a 'realizada'
 * 3. Insertar 'derivaciones' si corresponde
 */
const registrarTutoria = async (req, res) => {
    const {
        cronograma_id,
        obs_academico,
        obs_personal,
        obs_profesional,
        requiere_derivacion,
        derivacion // Objeto { especialidad, motivo }
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Insertar Tutoria
        const insertTutoriaQuery = `
            INSERT INTO tutorias (cronograma_id, obs_academico, obs_personal, obs_profesional, requiere_derivacion)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const tutoriaResult = await client.query(insertTutoriaQuery, [
            cronograma_id,
            obs_academico || '',
            obs_personal || '',
            obs_profesional || '',
            requiere_derivacion || false
        ]);
        const newTutoriaId = tutoriaResult.rows[0].id;

        // 2. Actualizar Cronograma
        await client.query(`UPDATE cronogramas SET estado = 'realizada' WHERE id = $1`, [cronograma_id]);

        // 3. Insertar Derivación (si aplica)
        if (requiere_derivacion && derivacion && derivacion.especialidad) {
            const insertDerivacion = `
                INSERT INTO derivaciones (tutoria_id, especialidad, motivo)
                VALUES ($1, $2, $3)
            `;
            await client.query(insertDerivacion, [newTutoriaId, derivacion.especialidad, derivacion.motivo]);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Tutoría registrada con éxito', id: newTutoriaId });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en registrarTutoria:', error);
        res.status(500).json({ message: 'Error al registrar la tutoría.' });
    } finally {
        client.release();
    }
};

/**
 * Actualizar una tutoría existente.
 */
const actualizarTutoria = async (req, res) => {
    const { id } = req.params; // ID de la tutoría
    const {
        obs_academico,
        obs_personal,
        obs_profesional,
        requiere_derivacion,
        derivacion
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Actualizar datos básicos de tutoría
        const updateQuery = `
            UPDATE tutorias 
            SET obs_academico = $1, obs_personal = $2, obs_profesional = $3, requiere_derivacion = $4, fecha_actualizacion = NOW()
            WHERE id = $5
        `;
        await client.query(updateQuery, [obs_academico, obs_personal, obs_profesional, requiere_derivacion, id]);

        // Manejo de derivación
        if (requiere_derivacion) {
            // Upsert derivación (si ya existe actualiza, si no inserta)
            // Postgres 9.5+ soporta ON CONFLICT pero necesitamos constraint. 
            // Haremos delete e insert para simplificar, dado que es 1:1 o 0:1
            await client.query(`DELETE FROM derivaciones WHERE tutoria_id = $1`, [id]);

            if (derivacion && derivacion.especialidad) {
                await client.query(`
                    INSERT INTO derivaciones (tutoria_id, especialidad, motivo) VALUES ($1, $2, $3)
                `, [id, derivacion.especialidad, derivacion.motivo]);
            }
        } else {
            // Si ya no requiere, eliminamos cualquier derivación existente
            await client.query(`DELETE FROM derivaciones WHERE tutoria_id = $1`, [id]);
        }

        await client.query('COMMIT');
        res.json({ message: 'Tutoría actualizada correctamente' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en actualizarTutoria:', error);
        res.status(500).json({ message: 'Error al actualizar la tutoría.' });
    } finally {
        client.release();
    }
};

/**
 * Historial de un estudiante específico.
 */
const getHistorialEstudiante = async (req, res) => {
    const { codigoEstudiante } = req.params;

    try {
        const query = `
            SELECT 
                c.fecha, 
                c.semestre,
                t.obs_academico,
                t.obs_personal,
                t.obs_profesional,
                t.requiere_derivacion
            FROM tutorias t
            JOIN cronogramas c ON t.cronograma_id = c.id
            WHERE c.codigo_estudiante = $1
            ORDER BY c.fecha DESC
        `;
        const result = await pool.query(query, [codigoEstudiante]);
        res.json(result.rows);

    } catch (error) {
        console.error('Error en getHistorialEstudiante:', error);
        res.status(500).json({ message: 'Error al obtener historial.' });
    }
};

module.exports = {
    getTutoriasByTutor,
    registrarTutoria,
    actualizarTutoria,
    getHistorialEstudiante
};
