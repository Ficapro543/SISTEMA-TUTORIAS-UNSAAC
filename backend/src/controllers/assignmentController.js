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
    const { search, semesterId } = req.query;
    const params = [];
    let paramIndex = 1;

    let studentCountSubquery = `(SELECT COUNT(*) FROM tutor_asignacion ta 
         WHERE ta.tutor_user_id = u.id AND ta.estado = 'activo'`;
    
    if (semesterId) {
      studentCountSubquery += ` AND ta.semestre = $${paramIndex}`;
      params.push(semesterId);
      paramIndex++;
    }
    
    studentCountSubquery += `) as student_count`;

    let query = `
      SELECT u.id, u.first_name, u.last_name, u.email, t.codigo as code,
        ${studentCountSubquery}
      FROM users u
      INNER JOIN tutores t ON u.id = t.user_id
      WHERE 1=1
    `;

    if (search) {
      query += ` AND (u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR t.codigo ILIKE $${paramIndex})`;
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

    if (originTutorId === destinationTutorId) {
      return res.status(400).json({ message: 'El tutor origen y destino no pueden ser el mismo.' });
    }

    await client.query('BEGIN');

    // Marcar las asignaciones anteriores como 'reasignado' y establecer fecha_reasignacion
    const updateQuery = `
      UPDATE tutor_asignacion 
      SET estado = 'reasignado',
          fecha_reasignacion = now()
      WHERE tutor_user_id = $1 
        AND semestre = $2 
        AND codigo_estudiante = ANY($3::text[]) 
        AND estado = 'activo'
      RETURNING codigo_estudiante
    `;
    const updateResult = await client.query(updateQuery, [originTutorId, semesterId, studentIds]);

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'No se encontraron asignaciones activas para transferir.' });
    }

    // Crear nuevas asignaciones activas para el tutor destino
    const insertValues = updateResult.rows.map((row, idx) => 
      `($${idx * 3 + 1}, $${idx * 3 + 2}, $${idx * 3 + 3}, 'activo')`
    ).join(', ');

    const insertParams = updateResult.rows.flatMap(row => [
      destinationTutorId,
      row.codigo_estudiante,
      semesterId
    ]);

    const insertQuery = `
      INSERT INTO tutor_asignacion (tutor_user_id, codigo_estudiante, semestre, estado)
      VALUES ${insertValues}
    `;

    await client.query(insertQuery, insertParams);

    await client.query('COMMIT');
    
    res.json({ 
      message: 'Transferencia realizada con éxito.', 
      count: updateResult.rowCount,
      transferred: updateResult.rows.map(r => r.codigo_estudiante)
    });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function transferAllStudents(req, res, next) {
  const client = await pool.connect();
  try {
    const { originTutorId, destinationTutorId, semesterId } = req.body;

    if (!originTutorId || !destinationTutorId || !semesterId) {
      return res.status(400).json({ message: 'Datos incompletos para la reasignación masiva.' });
    }

    if (originTutorId === destinationTutorId) {
      return res.status(400).json({ message: 'El tutor origen y destino no pueden ser el mismo.' });
    }

    // Verificar que el tutor destino esté activo
    const tutorCheck = await pool.query(
      'SELECT u.is_active FROM users u INNER JOIN tutores t ON u.id = t.user_id WHERE t.user_id = $1',
      [destinationTutorId]
    );

    if (tutorCheck.rows.length === 0 || !tutorCheck.rows[0].is_active) {
      return res.status(400).json({ message: 'El tutor destino no está activo.' });
    }

    await client.query('BEGIN');

    // Obtener todos los estudiantes activos del tutor origen
    const studentsQuery = `
      SELECT codigo_estudiante
      FROM tutor_asignacion
      WHERE tutor_user_id = $1 
        AND semestre = $2 
        AND estado = 'activo'
    `;
    const studentsResult = await client.query(studentsQuery, [originTutorId, semesterId]);

    if (studentsResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'No hay estudiantes activos para reasignar.' });
    }

    // Marcar todas las asignaciones anteriores como 'reasignado'
    const updateQuery = `
      UPDATE tutor_asignacion 
      SET estado = 'reasignado',
          fecha_reasignacion = now()
      WHERE tutor_user_id = $1 
        AND semestre = $2 
        AND estado = 'activo'
    `;
    await client.query(updateQuery, [originTutorId, semesterId]);

    // Crear nuevas asignaciones activas para el tutor destino
    const insertValues = studentsResult.rows.map((row, idx) => 
      `($${idx * 3 + 1}, $${idx * 3 + 2}, $${idx * 3 + 3}, 'activo')`
    ).join(', ');

    const insertParams = studentsResult.rows.flatMap(row => [
      destinationTutorId,
      row.codigo_estudiante,
      semesterId
    ]);

    const insertQuery = `
      INSERT INTO tutor_asignacion (tutor_user_id, codigo_estudiante, semestre, estado)
      VALUES ${insertValues}
    `;

    await client.query(insertQuery, insertParams);

    await client.query('COMMIT');
    
    res.json({ 
      message: 'Reasignación masiva completada con éxito.', 
      count: studentsResult.rowCount,
      transferred: studentsResult.rows.map(r => r.codigo_estudiante)
    });

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
  transferStudents,
  transferAllStudents
};
