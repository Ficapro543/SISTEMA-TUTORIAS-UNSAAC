const pool = require('../db/pool');

const CronogramaModel = {
    async getAll() {
        const query = `
      SELECT c.*, 
             u.first_name as tutor_nombre, u.last_name as tutor_apellido,
             e.nombre_estudiante, e.apellido_estudiante
      FROM cronogramas c
      JOIN tutores t ON c.tutor_user_id = t.user_id
      JOIN users u ON t.user_id = u.id
      JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
      ORDER BY c.fecha DESC, c.hora ASC
    `;
        const result = await pool.query(query);
        return result.rows;
    },

    async getById(id) {
        const query = `SELECT * FROM cronogramas WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    async getByTutor(tutor_user_id) {
        const query = `
      SELECT c.*, e.nombre_estudiante, e.apellido_estudiante
      FROM cronogramas c
      JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
      WHERE c.tutor_user_id = $1
      ORDER BY c.fecha DESC, c.hora ASC`;
        const result = await pool.query(query, [tutor_user_id]);
        return result.rows;
    },

    async create(data) {
        const { tutor_user_id, codigo_estudiante, asignacion_id, fecha, hora, ambiente, semestre, estado } = data;
        const result = await pool.query(
            `INSERT INTO cronogramas (tutor_user_id, codigo_estudiante, asignacion_id, fecha, hora, ambiente, semestre, estado) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [tutor_user_id, codigo_estudiante, asignacion_id, fecha, hora, ambiente, semestre, estado || 'programada']
        );
        return result.rows[0];
    },

    async update(id, data) {
        const { fecha, hora, ambiente, estado } = data;
        const result = await pool.query(
            `UPDATE cronogramas 
       SET fecha = COALESCE($1, fecha), 
           hora = COALESCE($2, hora), 
           ambiente = COALESCE($3, ambiente), 
           estado = COALESCE($4, estado)
       WHERE id = $5 RETURNING *`,
            [fecha, hora, ambiente, estado, id]
        );
        return result.rows[0];
    },

    async delete(id) {
        // Trigger will block deletion if state is 'realizada'
        const result = await pool.query('DELETE FROM cronogramas WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = CronogramaModel;
