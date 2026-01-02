require('dotenv').config();
const { Client } = require('pg');

async function fixSeed() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });

    try {
        await client.connect();
        console.log("🔌 Connected to database for seeding fix...");

        // 1. Insert Cronogramas (Fixed to include asignacion_id)
        console.log("📅 Seeding Cronogramas...");

        // Cronograma 1
        await client.query(`
      INSERT INTO cronogramas (tutor_user_id, codigo_estudiante, asignacion_id, fecha, hora, ambiente, semestre)
      SELECT t.user_id, '200101', ta.id, CURRENT_DATE + INTERVAL '1 day', '09:00', 'Sala Tutoría 1', '2025-I'
      FROM tutores t 
      JOIN users u ON u.id = t.user_id
      JOIN tutor_asignacion ta ON ta.tutor_user_id = t.user_id AND ta.codigo_estudiante = '200101' AND ta.semestre = '2025-I'
      WHERE u.email = 'tutor1@unsaac.edu.pe'
      AND NOT EXISTS (SELECT 1 FROM cronogramas WHERE codigo_estudiante = '200101' AND fecha = CURRENT_DATE + INTERVAL '1 day');
    `);

        // Cronograma 2
        await client.query(`
        INSERT INTO cronogramas (tutor_user_id, codigo_estudiante, asignacion_id, fecha, hora, ambiente, semestre)
        SELECT t.user_id, '200102', ta.id, CURRENT_DATE + INTERVAL '2 days', '10:30', 'Sala Tutoría 1', '2025-I'
        FROM tutores t 
        JOIN users u ON u.id = t.user_id
        JOIN tutor_asignacion ta ON ta.tutor_user_id = t.user_id AND ta.codigo_estudiante = '200102' AND ta.semestre = '2025-I'
        WHERE u.email = 'tutor1@unsaac.edu.pe'
        AND NOT EXISTS (SELECT 1 FROM cronogramas WHERE codigo_estudiante = '200102' AND fecha = CURRENT_DATE + INTERVAL '2 days');
    `);

        // Cronograma 3
        await client.query(`
        INSERT INTO cronogramas (tutor_user_id, codigo_estudiante, asignacion_id, fecha, hora, ambiente, semestre)
        SELECT t.user_id, '200103', ta.id, CURRENT_DATE + INTERVAL '3 days', '11:00', 'Sala Tutoría 2', '2025-I'
        FROM tutores t 
        JOIN users u ON u.id = t.user_id
        JOIN tutor_asignacion ta ON ta.tutor_user_id = t.user_id AND ta.codigo_estudiante = '200103' AND ta.semestre = '2025-I'
        WHERE u.email = 'tutor2@unsaac.edu.pe'
        AND NOT EXISTS (SELECT 1 FROM cronogramas WHERE codigo_estudiante = '200103' AND fecha = CURRENT_DATE + INTERVAL '3 days');
    `);

        // 2. Insert Tutorias
        console.log("📝 Seeding Tutorias...");
        // Tutoria 1
        await client.query(`
      INSERT INTO tutorias (cronograma_id, obs_academico, obs_personal, obs_profesional, resumen_general, modalidad)
      SELECT c.id, 'Bajo rendimiento en cursos básicos', 'Buena disposición al diálogo', 'Interés en prácticas tempranas', 'Se definió plan de refuerzo académico', 'Asignada'
      FROM cronogramas c
      WHERE c.codigo_estudiante = '200101'
      AND NOT EXISTS (SELECT 1 FROM tutorias WHERE cronograma_id = c.id);
    `);

        // Tutoria 2
        await client.query(`
      INSERT INTO tutorias (cronograma_id, obs_academico, obs_personal, obs_profesional, resumen_general, modalidad)
      SELECT c.id, 'Desempeño regular', 'Problemas de adaptación', 'Sin claridad vocacional', 'Se recomienda seguimiento psicológico', 'Asignada'
      FROM cronogramas c
      WHERE c.codigo_estudiante = '200103'
      AND NOT EXISTS (SELECT 1 FROM tutorias WHERE cronograma_id = c.id);
    `);

        // 3. Insert Derivaciones
        console.log("↪️ Seeding Derivaciones...");
        // Derivacion 1 (Psicologia)
        await client.query(`
        INSERT INTO derivaciones (tutoria_id, especialidad, motivo)
        SELECT t.id, 'Psicología', 'Dificultades de adaptación universitaria'
        FROM tutorias t
        JOIN cronogramas c ON t.cronograma_id = c.id
        WHERE c.codigo_estudiante = '200101'
        AND NOT EXISTS (SELECT 1 FROM derivaciones WHERE tutoria_id = t.id AND especialidad = 'Psicología');
    `);

        // Derivacion 2 (Vocacional)
        await client.query(`
        INSERT INTO derivaciones (tutoria_id, especialidad, motivo)
        SELECT t.id, 'Orientación Vocacional', 'Definir línea profesional acorde a intereses'
        FROM tutorias t
        JOIN cronogramas c ON t.cronograma_id = c.id
        WHERE c.codigo_estudiante = '200103'
        AND NOT EXISTS (SELECT 1 FROM derivaciones WHERE tutoria_id = t.id AND especialidad = 'Orientación Vocacional');
    `);

        console.log("✅ Seed data fixed and completed successfully!");

    } catch (err) {
        console.error("❌ Error running fix seed:", err);
    } finally {
        await client.end();
    }
}

fixSeed();
