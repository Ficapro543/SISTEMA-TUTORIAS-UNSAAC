const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

/**
 * assignmentController.js - REFACTORED FOR LEGACY SCHEMA
 */

async function getActiveSemester(req, res, next) {
  try {
    // Legacy schema doesn't have a semesters table with is_active.
    // We return a default or the latest semester found in assignments.
    const result = await pool.query('SELECT semestre FROM tutor_asignacion ORDER BY fecha_asignacion DESC LIMIT 1');
    const name = result.rows.length > 0 ? result.rows[0].semestre : '2025-I';
    res.json({ id: name, name: name, is_active: true });
  } catch (err) {
    next(err);
  }
}

async function getAllSemesters(req, res, next) {
  try {
    const result = await pool.query('SELECT DISTINCT semestre FROM tutor_asignacion UNION SELECT DISTINCT semestre FROM cronogramas ORDER BY semestre DESC');
    const semesters = result.rows.map(r => ({ id: r.semestre, name: r.semestre, is_active: false }));
    res.json(semesters);
  } catch (err) {
    next(err);
  }
}

async function getTutors(req, res, next) {
  try {
    const { search } = req.query;
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.email,
        (SELECT COUNT(*) FROM tutor_asignacion ta 
         WHERE ta.tutor_user_id = u.id AND ta.estado = 'activo') as student_count
      FROM users u
      INNER JOIN tutores t ON u.id = t.user_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1)`;
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
    const { semesterId } = req.query; // This will be the semester name (e.g. '2025-I')
    if (!semesterId) {
      return res.status(400).json({ message: 'Semestre es requerido' });
    }

    const query = `
      SELECT e.codigo_estudiante as id, e.codigo_estudiante as code, e.nombre_estudiante as first_name, e.apellido_estudiante as last_name
      FROM estudiante e
      WHERE e.codigo_estudiante NOT IN (
        SELECT codigo_estudiante FROM tutor_asignacion WHERE semestre = $1 AND estado = 'activo'
      )
      ORDER BY e.apellido_estudiante ASC
    `;
    const result = await pool.query(query, [semesterId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function assignStudents(req, res, next) {
  try {
    const { tutorId, studentIds, semesterId } = req.body;

    if (!tutorId || !studentIds || !studentIds.length || !semesterId) {
      return res.status(400).json({ message: 'Datos incompletos para la asignación.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertQuery = `
        INSERT INTO tutor_asignacion (tutor_user_id, codigo_estudiante, semestre, estado, fecha_asignacion) 
        VALUES ($1, $2, $3, 'activo', now())
      `;

      for (const studentCode of studentIds) {
        await client.query(insertQuery, [tutorId, studentCode, semesterId]);
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
    const tutoringsCount = await pool.query("SELECT COUNT(*) FROM tutorias");
    const studentsCount = await pool.query("SELECT COUNT(*) FROM estudiante");
    const tutorsCount = await pool.query("SELECT COUNT(*) FROM tutores");

    // For pending, we count students NOT in tutor_asignacion for the current semester
    // We'll use a heuristic for current semester or a provided one
    const semResult = await pool.query('SELECT semestre FROM tutor_asignacion ORDER BY fecha_asignacion DESC LIMIT 1');
    const currentSem = semResult.rows.length > 0 ? semResult.rows[0].semestre : '2025-I';

    const pendingRes = await pool.query(`
      SELECT COUNT(*) FROM estudiante 
      WHERE codigo_estudiante NOT IN (SELECT codigo_estudiante FROM tutor_asignacion WHERE semestre = $1 AND estado = 'activo')
    `, [currentSem]);

    res.json({
      tutorings: parseInt(tutoringsCount.rows[0].count),
      students: parseInt(studentsCount.rows[0].count),
      tutors: parseInt(tutorsCount.rows[0].count),
      pending: parseInt(pendingRes.rows[0].count)
    });
  } catch (err) {
    next(err);
  }
}

async function getStudentsByTutor(req, res, next) {
  try {
    const { tutorId } = req.params;
    const { semesterId } = req.query;

    if (!tutorId || !semesterId) {
      return res.status(400).json({ message: 'Tutor ID y Semestre son requeridos.' });
    }

    const query = `
      SELECT e.codigo_estudiante as id, e.codigo_estudiante as code, e.nombre_estudiante as first_name, e.apellido_estudiante as last_name,
      (SELECT COUNT(*) FROM tutorias t 
       INNER JOIN cronogramas c ON t.cronograma_id = c.id
       WHERE c.codigo_estudiante = e.codigo_estudiante AND c.semestre = $2) as tutorias_count
      FROM tutor_asignacion ta
      INNER JOIN estudiante e ON ta.codigo_estudiante = e.codigo_estudiante
      WHERE ta.tutor_user_id = $1 AND ta.semestre = $2 AND ta.estado = 'activo'
      ORDER BY e.apellido_estudiante ASC
    `;

    const result = await pool.query(query, [tutorId, semesterId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function transferStudents(req, res, next) {
  const client = await pool.connect();
  try {
    const { originTutorId, destinationTutorId, studentIds, semesterId } = req.body;

    if (!originTutorId || !destinationTutorId || !studentIds || !studentIds.length || !semesterId) {
      return res.status(400).json({ message: 'Datos incompletos para la transferencia.' });
    }

    await client.query('BEGIN');

    // Actualizar las asignaciones
    const updateQuery = `
      UPDATE tutor_asignacion 
      SET tutor_user_id = $1 
      WHERE tutor_user_id = $2 AND semestre = $3 AND codigo_estudiante = ANY($4::text[]) AND estado = 'activo'
    `;
    const updateResult = await client.query(updateQuery, [destinationTutorId, originTutorId, semesterId, studentIds]);

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'No se encontraron asignaciones coincidentes para transferir.' });
    }

    // Nota: El usuario pidió no crear tablas adicionales, por lo que hemos eliminado transfer_logs.
    // La auditoría tendría que ser a nivel de logs de la aplicación o disparadores si se requiere.

    await client.query('COMMIT');
    res.json({ message: 'Transferencia realizada con éxito.', count: updateResult.rowCount });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

module.exports = {
  getActiveSemester,
  getAllSemesters,
  getTutors,
  getUnassignedStudents,
  assignStudents,
  getDashboardStats,
  getStudentsByTutor,
  transferStudents
};
