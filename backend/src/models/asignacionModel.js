const pool = require('../db/pool');

const AsignacionModel = {
    async getAll() {
        const query = `
      SELECT ta.*, 
             u.first_name as tutor_nombre, u.last_name as tutor_apellido,
             e.nombre_estudiante, e.apellido_estudiante
      FROM tutor_asignacion ta
      JOIN tutores t ON ta.tutor_user_id = t.user_id
      JOIN users u ON t.user_id = u.id
      JOIN estudiante e ON ta.codigo_estudiante = e.codigo_estudiante
      ORDER BY ta.fecha_asignacion DESC
    `;
        const result = await pool.query(query);
        return result.rows;
    },

    async getById(id) {
        const query = `
      SELECT ta.*, 
             u.first_name as tutor_nombre, u.last_name as tutor_apellido,
             e.nombre_estudiante, e.apellido_estudiante
      FROM tutor_asignacion ta
      JOIN tutores t ON ta.tutor_user_id = t.user_id
      JOIN users u ON t.user_id = u.id
      JOIN estudiante e ON ta.codigo_estudiante = e.codigo_estudiante
      WHERE ta.id = $1
    `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    async create(data) {
        const { tutor_user_id, codigo_estudiante, semestre, estado } = data;
        const result = await pool.query(
            `INSERT INTO tutor_asignacion (tutor_user_id, codigo_estudiante, semestre, estado) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [tutor_user_id, codigo_estudiante, semestre, estado || 'activo']
        );
        return result.rows[0];
    },

    async update(id, data) {
        const { estado, fecha_fin } = data;
        // Semestre typically shouldn't change for an existing assignment ID, but could be supported if needed.
        // For now, allow updating status and end date.
        const result = await pool.query(
            `UPDATE tutor_asignacion 
       SET estado = COALESCE($1, estado), 
           fecha_fin = COALESCE($2, fecha_fin)
       WHERE id = $3 RETURNING *`,
            [estado, fecha_fin, id]
        );
        return result.rows[0];
    },

    // Custom method to soft delete/finalize instead of hard delete usually, but implementing delete as requested
    async delete(id) {
        const result = await pool.query('DELETE FROM tutor_asignacion WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    },

    async checkActiveAsignacion(codigo_estudiante, semestre) {
        const result = await pool.query(
            `SELECT * FROM tutor_asignacion WHERE codigo_estudiante = $1 AND semestre = $2 AND estado = 'activo'`,
            [codigo_estudiante, semestre]
        );
        return result.rows[0];
    }
};

module.exports = AsignacionModel;
