require('dotenv').config();
const pool = require('../src/db/pool');

const createTablesQuery = `
-- CUIDADO: Este script asegura que las tablas existan.

-- 1. Asegurar columna 'code' en users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'code') THEN
        ALTER TABLE users ADD COLUMN code TEXT;
    END IF;
END $$;

-- 2. Tabla Semestres
CREATE TABLE IF NOT EXISTS semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT now()
);

-- 3. Tabla Estudiantes
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    cycle TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- 4. Tabla Asignaciones
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES users(id),
    student_id UUID NOT NULL REFERENCES students(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(student_id, semester_id)
);
`;

async function seed() {
    console.log("🌱 Iniciando configuración de base de datos...");

    try {
        // 1. Crear Tablas
        await pool.query(createTablesQuery);
        console.log("✅ Tablas verificadas/creadas.");

        // 2. Crear Semestre Activo si no existe
        const semCheck = await pool.query("SELECT * FROM semesters WHERE is_active = true");
        let semesterId;
        if (semCheck.rows.length === 0) {
            const semRes = await pool.query(
                "INSERT INTO semesters (name, is_active, start_date) VALUES ('2025-I', TRUE, NOW()) RETURNING id"
            );
            semesterId = semRes.rows[0].id;
            console.log("✅ Semestre activo '2025-I' creado.");
        } else {
            semesterId = semCheck.rows[0].id;
            console.log("ℹ️ Ya existe un semestre activo.");
        }

        // 3. Insertar Estudiantes de prueba (si no hay)
        const studCheck = await pool.query("SELECT count(*) FROM students");
        if (parseInt(studCheck.rows[0].count) === 0) {
            await pool.query(`
         INSERT INTO students (code, first_name, last_name, cycle) VALUES 
         ('160001', 'Juan', 'Perez', '5to'),
         ('160002', 'Maria', 'Gomez', '7mo'),
         ('160003', 'Carlos', 'Ruiz', '3er')
       `);
            console.log("✅ Estudiantes de prueba insertados.");
        } else {
            console.log("ℹ️ Ya existen estudiantes en la BD.");
        }

        console.log("\n🚀 Configuración completada con éxito.");
    } catch (err) {
        console.error("❌ Error en el script:", err);
    } finally {
        process.exit();
    }
}

seed();
