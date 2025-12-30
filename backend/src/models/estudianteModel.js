const pool = require('../db/pool');

const EstudianteModel = {
    async getAll() {
        const result = await pool.query('SELECT * FROM estudiante ORDER BY apellido_estudiante, nombre_estudiante');
        return result.rows;
    },

    async getById(codigo_estudiante) {
        const result = await pool.query('SELECT * FROM estudiante WHERE codigo_estudiante = $1', [codigo_estudiante]);
        return result.rows[0];
    },

    async create(data) {
        const { codigo_estudiante, nombre_estudiante, apellido_estudiante } = data;
        const result = await pool.query(
            `INSERT INTO estudiante (codigo_estudiante, nombre_estudiante, apellido_estudiante) 
       VALUES ($1, $2, $3) RETURNING *`,
            [codigo_estudiante, nombre_estudiante, apellido_estudiante]
        );
        return result.rows[0];
    },

    async update(codigo_estudiante, data) {
        const { nombre_estudiante, apellido_estudiante } = data;
        const result = await pool.query(
            `UPDATE estudiante 
       SET nombre_estudiante = $1, apellido_estudiante = $2
       WHERE codigo_estudiante = $3 RETURNING *`,
            [nombre_estudiante, apellido_estudiante, codigo_estudiante]
        );
        return result.rows[0];
    },

    async delete(codigo_estudiante) {
        const result = await pool.query('DELETE FROM estudiante WHERE codigo_estudiante = $1 RETURNING *', [codigo_estudiante]);
        return result.rows[0];
    }
};

module.exports = EstudianteModel;
