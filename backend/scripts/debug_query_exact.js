require('dotenv').config();
const pool = require('../src/db/pool');

async function debugQuery() {
    try {
        console.log("Ejecutando consulta de tutores...");
        let query = `
          SELECT id, first_name, last_name, code, email, 
          (SELECT COUNT(*) FROM assignments a 
           JOIN semesters s ON a.semester_id = s.id 
           WHERE a.tutor_id = users.id AND s.is_active = TRUE) as student_count
          FROM users 
          WHERE ('tutor' = ANY(roles) OR 'Tutor' = ANY(roles))
        `;

        const result = await pool.query(query);
        console.log("Resultados encontrados:", result.rows.length);
        if (result.rows.length > 0) {
            console.log("Primer resultado:", result.rows[0]);
        }

        // Check if there is an active semester
        const sem = await pool.query("SELECT * FROM semesters WHERE is_active = TRUE");
        console.log("\nSemestre activo:", sem.rows.length > 0 ? sem.rows[0].name : "NINGUNO");

    } catch (err) {
        console.error("ERROR EN QUERY:", err.message);
    } finally {
        process.exit();
    }
}

debugQuery();
