const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

/**
 * assignmentController.js
 * 
 * Gestiona la lógica de semestres, tutores y la asignación de estudiantes.
 */

async function getActiveSemester(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM semesters WHERE is_active = TRUE LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No hay semestre activo configurado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getAllSemesters(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM semesters ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getTutors(req, res, next) {
  try {
    const { search } = req.query;
    let query = `
      SELECT id, first_name, last_name, code, email, 
      (SELECT COUNT(*) FROM assignments a 
       JOIN semesters s ON a.semester_id = s.id 
       WHERE a.tutor_id = users.id AND s.is_active = TRUE) as student_count
      FROM users 
      WHERE ('tutor' = ANY(roles) OR 'Tutor' = ANY(roles))
    `;
    const params = [];

    if (search) {
      query += ` AND (first_name ILIKE $1 OR last_name ILIKE $1 OR code ILIKE $1)`;
      params.push(`%${search}%`);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getUnassignedStudents(req, res, next) {
  try {
    const { semesterId } = req.query;
    if (!semesterId) {
      return res.status(400).json({ message: 'Semester ID is required' });
    }

    const query = `
      SELECT s.* FROM students s
      WHERE s.id NOT IN (
        SELECT student_id FROM assignments WHERE semester_id = $1
      )
      ORDER BY last_name ASC
    `;
    const result = await pool.query(query, [semesterId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function assignStudents(req, res, next) {
  try {
    const { tutorId, studentIds, semesterId, assignmentDate, assignmentTime } = req.body;

    if (!tutorId || !studentIds || !studentIds.length || !semesterId) {
      return res.status(400).json({ message: 'Datos incompletos para la asignación.' });
    }

    // Check if students are already assigned (extra safety)
    const checkQuery = `SELECT student_id FROM assignments WHERE semester_id = $1 AND student_id = ANY($2::uuid[])`;
    const checkResult = await pool.query(checkQuery, [semesterId, studentIds]);

    if (checkResult.rowCount > 0) {
      return res.status(409).json({
        message: 'Uno o más estudiantes ya tienen tutor asignado en este semestre.',
        conflicts: checkResult.rows
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertQuery = `
        INSERT INTO assignments (id, tutor_id, student_id, semester_id, assignment_date, assignment_time) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      for (const studentId of studentIds) {
        await client.query(insertQuery, [uuidv4(), tutorId, studentId, semesterId, assignmentDate, assignmentTime]);
      }

      await client.query('COMMIT');
      res.json({ message: 'Asignación realizada con éxito.', count: studentIds.length });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
}

async function getDashboardStats(req, res, next) {
  try {
    const tutoringsCount = await pool.query('SELECT COUNT(*) FROM assignments');
    const studentsCount = await pool.query('SELECT COUNT(*) FROM students');
    const tutorsCount = await pool.query("SELECT COUNT(*) FROM users WHERE 'tutor' = ANY(roles) OR 'Tutor' = ANY(roles)");

    // For pending, we could count students NOT in assignments for the active semester
    const activeSem = await pool.query('SELECT id FROM semesters WHERE is_active = TRUE LIMIT 1');
    let pendingCount = 0;
    if (activeSem.rows.length > 0) {
      const pendingRes = await pool.query(`
        SELECT COUNT(*) FROM students 
        WHERE id NOT IN (SELECT student_id FROM assignments WHERE semester_id = $1)
      `, [activeSem.rows[0].id]);
      pendingCount = pendingRes.rows[0].count;
    }

    res.json({
      tutorings: parseInt(tutoringsCount.rows[0].count),
      students: parseInt(studentsCount.rows[0].count),
      tutors: parseInt(tutorsCount.rows[0].count),
      pending: parseInt(pendingCount)
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getActiveSemester,
  getAllSemesters,
  getTutors,
  getUnassignedStudents,
  assignStudents,
  getDashboardStats
};
