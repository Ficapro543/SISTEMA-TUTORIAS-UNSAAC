const pool = require('../db/pool');

const TutorModel = {
    async getAll() {
        // Joins with users table to get name and email
        const query = `
      SELECT t.user_id, t.cubiculo, u.first_name, u.last_name, u.email, u.is_active
      FROM tutores t
      JOIN users u ON t.user_id = u.id
      ORDER BY u.last_name, u.first_name
    `;
        const result = await pool.query(query);
        return result.rows;
    },

    async getById(user_id) {
        const query = `
      SELECT t.user_id, t.cubiculo, u.first_name, u.last_name, u.email, u.is_active
      FROM tutores t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = $1
    `;
        const result = await pool.query(query, [user_id]);
        return result.rows[0];
    },

    async create(data) {
        // We assume the user already exists in 'users' table or is created separately.
        // This model only manages the 'tutores' extension table.
        const { user_id, cubiculo } = data;
        const result = await pool.query(
            `INSERT INTO tutores (user_id, cubiculo) VALUES ($1, $2) RETURNING *`,
            [user_id, cubiculo]
        );
        return result.rows[0];
    },

    async update(user_id, data) {
        const { cubiculo } = data;
        const result = await pool.query(
            `UPDATE tutores SET cubiculo = $1 WHERE user_id = $2 RETURNING *`,
            [cubiculo, user_id]
        );
        return result.rows[0];
    },

    async delete(user_id) {
        // Deleting from tutores table only. User remains in users table (unless cascade logic usually applies elsewhere, but strictly here we delete the tutor role data)
        const result = await pool.query('DELETE FROM tutores WHERE user_id = $1 RETURNING *', [user_id]);
        return result.rows[0];
    }
};

module.exports = TutorModel;
