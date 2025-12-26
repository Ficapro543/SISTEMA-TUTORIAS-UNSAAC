const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

/**
 * developmentController.js
 * 
 * Este controlador contiene utilidades de desarrollo y depuración.
 * No debe contener lógica de negocio crítica para el funcionamiento final.
 */

async function debugSeed(req, res, next) {
    try {
        const createTablesQuery = `
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'code') THEN
              ALTER TABLE users ADD COLUMN code TEXT;
          END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS semesters (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          is_active BOOLEAN DEFAULT FALSE,
          start_date DATE,
          end_date DATE,
          created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS students (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code TEXT NOT NULL UNIQUE,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT,
          cycle TEXT,
          created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tutor_id UUID NOT NULL REFERENCES users(id),
          student_id UUID NOT NULL REFERENCES students(id),
          semester_id UUID NOT NULL REFERENCES semesters(id),
          created_at TIMESTAMP DEFAULT now(),
          UNIQUE(student_id, semester_id)
      );
    `;

        await pool.query(createTablesQuery);

        const semCheck = await pool.query("SELECT * FROM semesters WHERE is_active = true");
        let semesterId;
        if (semCheck.rows.length === 0) {
            const semRes = await pool.query(
                "INSERT INTO semesters (name, is_active, start_date) VALUES ('2025-I', TRUE, NOW()) RETURNING id"
            );
            semesterId = semRes.rows[0].id;
        }

        const studCheck = await pool.query("SELECT count(*) FROM students");
        if (parseInt(studCheck.rows[0].count) === 0) {
            await pool.query(`
         INSERT INTO students (code, first_name, last_name, cycle) VALUES 
         ('160001', 'Juan', 'Perez', '5to'),
         ('160002', 'Maria', 'Gomez', '7mo'),
         ('160003', 'Carlos', 'Ruiz', '3er')
       `);
        }

        res.json({ message: "DB Seed Completado" });
    } catch (err) {
        next(err);
    }
}

async function debugPromote(req, res, next) {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: "Email required" });

        await pool.query(
            "UPDATE users SET roles = array_append(roles, 'administrador') WHERE email = $1 AND NOT ('administrador' = ANY(roles))",
            [email]
        );
        res.json({ message: `Usuario ${email} promovido a administrador.` });
    } catch (err) {
        next(err);
    }
}

async function debugCreateAdmin(req, res, next) {
    try {
        const email = 'admin@unsaac.edu.pe';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rowCount > 0) {
            await pool.query(
                "UPDATE users SET roles = array_append(roles, 'administrador'), is_active = true WHERE email = $1 AND NOT ('administrador' = ANY(roles))",
                [email]
            );
            return res.json({ message: "Usuario admin@unsaac.edu.pe ya existía. Se aseguró rol administrador.", credentials: { email, password } });
        }

        await pool.query(
            `INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [uuidv4(), 'Admin', 'Test', email, hashedPassword, ['administrador', 'tutor'], true, 'ADM001']
        );

        res.json({ message: "Usuario administrador creado exitosamente.", credentials: { email, password } });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    debugSeed,
    debugPromote,
    debugCreateAdmin
};
