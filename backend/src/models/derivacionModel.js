const pool = require('../db/pool');

const DerivacionModel = {
    async getAll() {
        const result = await pool.query('SELECT * FROM derivaciones ORDER BY fecha_derivacion DESC');
        return result.rows;
    },

    async getById(id) {
        const result = await pool.query('SELECT * FROM derivaciones WHERE id = $1', [id]);
        return result.rows[0];
    },

    async getByTutoriaId(tutoria_id) {
        const result = await pool.query('SELECT * FROM derivaciones WHERE tutoria_id = $1', [tutoria_id]);
        return result.rows;
    },

    async create(data) {
        const { tutoria_id, especialidad, motivo } = data;
        const result = await pool.query(
            `INSERT INTO derivaciones (tutoria_id, especialidad, motivo) 
       VALUES ($1, $2, $3) RETURNING *`,
            [tutoria_id, especialidad, motivo]
        );
        return result.rows[0];
    },

    async update(id, data) {
        const { especialidad, motivo } = data;
        const result = await pool.query(
            `UPDATE derivaciones 
       SET especialidad = COALESCE($1, especialidad), 
           motivo = COALESCE($2, motivo)
       WHERE id = $3 RETURNING *`,
            [especialidad, motivo, id]
        );
        return result.rows[0];
    },

    async delete(id) {
        const result = await pool.query('DELETE FROM derivaciones WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = DerivacionModel;
