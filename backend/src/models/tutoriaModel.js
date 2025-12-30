const pool = require('../db/pool');

const TutoriaModel = {
    async getAll() {
        const query = `
      SELECT t.*, c.semestre, c.fecha, c.hora,
             e.nombre_estudiante, e.apellido_estudiante
      FROM tutorias t
      JOIN cronogramas c ON t.cronograma_id = c.id
      JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
      ORDER BY t.fecha_registro DESC
    `;
        const result = await pool.query(query);
        return result.rows;
    },

    async getById(id) {
        const query = `
      SELECT t.*, c.semestre, c.fecha, c.hora, c.ambiente,
             e.nombre_estudiante, e.apellido_estudiante, e.codigo_estudiante,
             u.first_name as tutor_nombre, u.last_name as tutor_apellido
      FROM tutorias t
      JOIN cronogramas c ON t.cronograma_id = c.id
      JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
      JOIN tutores tr ON c.tutor_user_id = tr.user_id
      JOIN users u ON tr.user_id = u.id
      WHERE t.id = $1
    `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    async getByCronogramaId(cronograma_id) {
        const result = await pool.query('SELECT * FROM tutorias WHERE cronograma_id = $1', [cronograma_id]);
        return result.rows[0];
    },

    async create(data) {
        const {
            cronograma_id, obs_academico, obs_personal, obs_profesional,
            resumen_general, requiere_derivacion, modalidad
        } = data;

        const result = await pool.query(
            `INSERT INTO tutorias (
        cronograma_id, obs_academico, obs_personal, obs_profesional, 
        resumen_general, requiere_derivacion, modalidad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                cronograma_id, obs_academico, obs_personal, obs_profesional,
                resumen_general, requiere_derivacion || false, modalidad || 'Asignada'
            ]
        );
        return result.rows[0];
    },

    async update(id, data) {
        const {
            obs_academico, obs_personal, obs_profesional,
            resumen_general, requiere_derivacion, modalidad
        } = data;

        // trigger 'trg_update_fecha_tutoria' will update fecha_actualizacion automatically
        const result = await pool.query(
            `UPDATE tutorias 
       SET obs_academico = COALESCE($1, obs_academico), 
           obs_personal = COALESCE($2, obs_personal), 
           obs_profesional = COALESCE($3, obs_profesional), 
           resumen_general = COALESCE($4, resumen_general), 
           requiere_derivacion = COALESCE($5, requiere_derivacion), 
           modalidad = COALESCE($6, modalidad)
       WHERE id = $7 RETURNING *`,
            [obs_academico, obs_personal, obs_profesional, resumen_general, requiere_derivacion, modalidad, id]
        );
        return result.rows[0];
    },

    async delete(id) {
        const result = await pool.query('DELETE FROM tutorias WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = TutoriaModel;
