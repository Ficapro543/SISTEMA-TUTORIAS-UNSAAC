require('dotenv').config();
const pool = require('../src/db/pool');
const bcrypt = require('bcrypt');

async function seed() {
    console.log("🌱 Iniciando siembra de datos de prueba...");

    try {
        // 1. Añadir columnas si no existen
        console.log("🛠️ Actualizando esquema de base de datos...");
        await pool.query(`
            ALTER TABLE assignments ADD COLUMN IF NOT EXISTS assignment_date DATE;
            ALTER TABLE assignments ADD COLUMN IF NOT EXISTS assignment_time TIME;
        `);
        console.log("✅ Columnas assignment_date y assignment_time verificadas.");

        // 2. Semestres
        console.log("📅 Configurando semestres...");
        const semestres = [
            { name: '2024-I', is_active: false },
            { name: '2024-II', is_active: false },
            { name: '2025-I', is_active: true }
        ];

        for (const s of semestres) {
            await pool.query(
                "INSERT INTO semesters (name, is_active) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [s.name, s.is_active]
            );
        }
        console.log("✅ Semestres (24-I, 24-II, 25-I) configurados.");

        // 3. Estudiantes (7)
        console.log("🎓 Sembrando estudiantes...");
        const estudiantes = [
            ['200001', 'Alan', 'García', '7mo'],
            ['200002', 'Beatriz', 'Mendoza', '5to'],
            ['200003', 'Carlos', 'Paredes', '3er'],
            ['200004', 'Diana', 'Quispe', '9no'],
            ['200005', 'Enrique', 'Rojas', '1er'],
            ['200006', 'Fabiola', 'Sánchez', '4to'],
            ['200007', 'Gustavo', 'Torres', '8vo']
        ];

        for (const e of estudiantes) {
            await pool.query(
                "INSERT INTO students (code, first_name, last_name, cycle) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING",
                e
            );
        }
        console.log("✅ 7 Estudiantes insertados.");

        // 4. Usuarios (Tutores y Verificadores - 7 de cada uno)
        console.log("👤 Sembrando usuarios (Tutores y Verificadores)...");
        const passwordHash = await bcrypt.hash('123456', 10);

        // Tutores
        for (let i = 1; i <= 7; i++) {
            await pool.query(
                `INSERT INTO users (first_name, last_name, email, password_hash, roles, is_active, code) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO NOTHING`,
                [`Tutor`, `Ejemplo ${i}`, `tutor${i}@unsaac.edu.pe`, passwordHash, ['tutor'], true, `T00${i}`]
            );
        }

        // Verificadores (Asesores)
        for (let i = 1; i <= 7; i++) {
            await pool.query(
                `INSERT INTO users (first_name, last_name, email, password_hash, roles, is_active, code) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO NOTHING`,
                [`Asesor`, `Ejemplo ${i}`, `asesor${i}@unsaac.edu.pe`, passwordHash, ['verificador'], true, `A00${i}`]
            );
        }
        console.log("✅ 7 Tutores y 7 Asesores insertados.");

        console.log("\n🚀 ¡Siembra completada con éxito!");
    } catch (err) {
        console.error("❌ Error durante la siembra:", err);
    } finally {
        process.exit();
    }
}

seed();
