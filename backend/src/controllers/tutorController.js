const pool = require('../db/pool');

const getCronogramasByTutor = async (req, res, next) => {
    const { id } = req.params; // tutor_user_id

    try {
        const query = `
      SELECT 
        c.id AS cronograma_id,
        c.fecha,
        c.hora,
        c.ambiente,
        c.estado,
        e.nombre_estudiante,
        e.apellido_estudiante,
        e.codigo_estudiante,
        t.id AS tutoria_id
      FROM cronogramas c
      JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
      LEFT JOIN tutorias t ON c.id = t.cronograma_id
      WHERE c.tutor_user_id = $1
      ORDER BY c.fecha, c.hora
    `;

        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

const registerTutoria = async (req, res, next) => {
    const {
        cronograma_id,
        obs_academico,
        obs_personal,
        obs_profesional,
        requiere_derivacion,
        especialidad,
        motivo
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Insertar Tutoria
        const insertTutoriaQuery = `
      INSERT INTO tutorias (
        cronograma_id, 
        obs_academico, 
        obs_personal, 
        obs_profesional, 
        requiere_derivacion
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

        const tutoriaResult = await client.query(insertTutoriaQuery, [
            cronograma_id,
            obs_academico,
            obs_personal,
            obs_profesional,
            requiere_derivacion
        ]);

        const tutoriaId = tutoriaResult.rows[0].id;

        // 2. Si requiere derivación, insertar en derivaciones
        if (requiere_derivacion && especialidad && motivo) {
            const insertDerivacionQuery = `
        INSERT INTO derivaciones (tutoria_id, especialidad, motivo)
        VALUES ($1, $2, $3)
      `;
            await client.query(insertDerivacionQuery, [tutoriaId, especialidad, motivo]);
        }

        // 3. Actualizar estado del cronograma a 'realizada'
        const updateCronogramaQuery = `
      UPDATE cronogramas
      SET estado = 'realizada'
      WHERE id = $1
    `;
        await client.query(updateCronogramaQuery, [cronograma_id]);

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Tutoría registrada exitosamente',
            tutoriaId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

const getAssignedStudents = async (req, res, next) => {
    const { id } = req.params; // tutor_user_id passed as param

    try {
        const query = `
            SELECT 
                ta.id AS asignacion_id,
                ta.codigo_estudiante,
                e.nombre_estudiante,
                e.apellido_estudiante,
                ta.semestre,
                ta.estado
            FROM tutor_asignacion ta
            JOIN estudiante e ON ta.codigo_estudiante = e.codigo_estudiante
            WHERE ta.tutor_user_id = $1 AND ta.estado = 'activo'
        `;

        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCronogramasByTutor,
    registerTutoria,
    getAssignedStudents
};

