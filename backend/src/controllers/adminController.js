// src/controllers/adminController.js
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendAdminApprovalEmail, sendUserActivationEmail } = require('../services/mailService');

async function createPendingUser(req, res, next) {
  try {
    const { first_name, last_name, email, password, roles } = req.body;

    // 1. Verificar si ya existe en la tabla de usuarios definitivos
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rowCount > 0) {
      return res.status(400).json({ message: 'Este correo ya está registrado y activo.' });
    }

    // 2. Verificar si ya existe una solicitud pendiente
    const pendingCheck = await pool.query('SELECT id FROM pending_users WHERE email = $1', [email]);
    if (pendingCheck.rowCount > 0) {
      return res.status(400).json({ message: 'Ya existe una solicitud pendiente para este correo. Por favor, espera la aprobación del administrador.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await pool.query(
      `INSERT INTO pending_users (id, first_name, last_name, email, password_hash, roles)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, first_name, last_name, email, hashed, roles]
    );

    // enviar notificación a administradores
    const adminEmail = process.env.ADMIN_EMAIL;
    await sendAdminApprovalEmail(adminEmail, id);

    // === PARA PRODUCCION ===
    // const adminsQuery = await pool.query(`
    //   SELECT email
    //   FROM users
    //   WHERE is_active = true
    //   AND 'Administrador' = ANY(roles)
    // `);
    // if (adminsQuery.rowCount === 0){
    //   console.warn('⚠️ No hay administradores activos para notificar');
    // }else{
    //   //Enviar correo a cada administrador
    //   for(const admin of adminsQuery.rows){
    //     await sendAdminApprovalEmail(admin.email, id);
    //   }
    // }

    res.json({ message: 'Solicitud enviada, esperando aprobación' });
  } catch (err) {
    next(err);
  }
}

async function getPendingUsers(req, res, next) {
  try {
    console.log('GET /api/admin/solicitudes - Fetching pending users...');
    const result = await pool.query('SELECT id, first_name, last_name, email, roles, created_at FROM pending_users ORDER BY created_at DESC');
    console.log(`Found ${result.rows.length} pending users.`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pending users:', err);
    next(err);
  }
}

async function getPendingUserDetail(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM pending_users WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Solicitud no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function approvePendingUser(req, res, next) {
  try {
    const { pendingUserId, roles } = req.body; // allow overriding roles during approval

    const q = await pool.query(`SELECT * FROM pending_users WHERE id=$1`, [pendingUserId]);
    if (q.rowCount === 0)
      return res.status(404).json({ message: 'Solicitud no encontrada' });

    const pendingUser = q.rows[0];
    const finalRoles = roles || pendingUser.roles;

    // Crear decisiones para todos los roles como aprobados
    const rolesDecisiones = pendingUser.roles.map(rol => ({
      rol,
      decision: 'aprobado'
    }));

    // Actualizar las decisiones antes de aprobar
    await pool.query(
      `UPDATE pending_users 
       SET roles_decisiones=$1 
       WHERE id=$2`,
      [JSON.stringify(rolesDecisiones), pendingUserId]
    );

    const newUserId = uuidv4();

    await pool.query(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        newUserId,
        pendingUser.first_name,
        pendingUser.last_name,
        pendingUser.email,
        pendingUser.password_hash,
        finalRoles,
        true // ACTIVACIÓN DIRECTA
      ]
    );

    // Crear token de activación
    const activationToken = uuidv4();
    console.log("Token generado (UUID):", activationToken);
    const expiration = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 horas

    await pool.query(
      `INSERT INTO activation_tokens (id, user_id, token, expires_at)
      VALUES (gen_random_uuid(), $1, $2, $3)`,
      [newUserId, activationToken, expiration]
    );

    // Eliminar de pending_users
    await pool.query(`DELETE FROM pending_users WHERE id=$1`, [pendingUserId]);

    // Enviar correo con token, NO con userId
    await sendUserActivationEmail(pendingUser.email, activationToken);

    res.json({
      message: 'Usuario aprobado y correo de activación enviado',
      userId: newUserId,
      email: pendingUser.email
    });

  } catch (err) {
    console.error("Error en approvePendingUser:", err);
    next(err);
  }
}

async function getAllPendingUser(req, res, next) {
  try {
    const q = await pool.query(`
      SELECT id, first_name, last_name, email, roles, created_at
      FROM pending_users
      ORDER BY created_at DESC
    `);
    res.json(q.rows);
  } catch (err) {
    next(err);
  }
}

async function getOnePendingUser(req, res, next) {
  try {
    const { id } = req.params;
    const q = await pool.query(
      `SELECT id, first_name, last_name, email, roles, created_at, 
       roles_decisiones
       FROM pending_users WHERE id=$1`,
      [id]
    );

    if (q.rowCount === 0)
      return res.status(404).json({ message: 'Solicitud no encontrada' });

    const user = q.rows[0];
    // Asegurarnos de que roles_decisiones sea un array
    if (!user.roles_decisiones) {
      user.roles_decisiones = [];
    }

    res.json(q.rows[0]);
  } catch (err) {
    console.error("Error en getOnePendingUser:", err);
    next(err);
  }
}

async function rejectOnePendingUser(req, res, next) {
  try {
    const { pendingUserId } = req.body;

    const q = await pool.query(`SELECT roles FROM pending_users WHERE id=$1`, [pendingUserId]);
    if (q.rowCount === 0)
      return res.status(404).json({ message: 'Solicitud no encontrada' });

    const pendingUser = q.rows[0];

    // Crear decisiones para todos los roles como rechazados
    const rolesDecisiones = pendingUser.roles.map(rol => ({
      rol,
      decision: 'rechazado'
    }));

    // Actualizar las decisiones antes de rechazar
    await pool.query(
      `UPDATE pending_users 
       SET roles_decisiones=$1 
       WHERE id=$2`,
      [JSON.stringify(rolesDecisiones), pendingUserId]
    );

    await pool.query(`DELETE FROM pending_users WHERE id=$1`, [pendingUserId]);

    res.json({ message: 'Solicitud rechazada' });
  } catch (err) {
    next(err);
  }
}

async function rejectPendingUser(req, res, next) {
  try {
    const { pendingUserId } = req.body;
    const result = await pool.query('DELETE FROM pending_users WHERE id = $1 RETURNING email', [pendingUserId]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Solicitud no encontrada' });

    // Optionally send an email notifying rejection
    res.json({ message: 'Solicitud rechazada y eliminada.' });
  } catch (err) {
    next(err);
  }
}

// Aprobar o rechazar un rol específico
async function decideRol(req, res, next) {
  try {
    const { pendingUserId, rol } = req.params;
    const { decision } = req.body; // "aprobado" o "rechazado"

    // Obtener usuario pendiente
    const q = await pool.query(
      `SELECT roles, roles_decisiones FROM pending_users WHERE id=$1`,
      [pendingUserId]
    );

    if (q.rowCount === 0) return res.status(404).json({ message: 'Solicitud no encontrada' });

    const user = q.rows[0];
    const roles = user.roles; // array de roles
    let rolesDecisiones = user.roles_decisiones || [];

    // Verificar si el rol existe en la solicitud
    if (!roles.includes(rol)) {
      return res.status(400).json({ message: `Rol ${rol} no fue solicitado` });
    }

    // Buscar si ya existe una decisión para este rol
    let rolEncontrado = false;
    let nuevasDecisiones = [];
    if (rolesDecisiones && rolesDecisiones.length > 0) {
      nuevasDecisiones = rolesDecisiones.map(item => {
        if (item.rol === rol) {
          rolEncontrado = true;
          return { rol, decision };
        }
        return item;
      });
    }

    // Si no existía, agregarlo
    if (!rolEncontrado) {
      nuevasDecisiones.push({ rol, decision });
    }

    // Actualizar en la DB
    await pool.query(
      `UPDATE pending_users 
       SET roles_decisiones=$1 
       WHERE id=$2`,
      [JSON.stringify(nuevasDecisiones), pendingUserId]
    );

    res.json({
      message: `Rol ${rol} ${decision}`,
      roles_decisiones: nuevasDecisiones
    });
  } catch (err) {
    console.error("Error en decideRol:", err);
    next(err);
  }
}

async function getSemestresCerrados(req, res, next) {
  try {
    // Obtener semestres únicos de cronogramas con tutorías realizadas
    const { rows } = await pool.query(
      `SELECT DISTINCT 
        c.semestre,
        MIN(c.fecha) as fecha_inicio,
        MAX(c.fecha) as fecha_fin
       FROM cronogramas c
       INNER JOIN tutorias t ON t.cronograma_id = c.id
       WHERE c.estado = 'realizada'
       GROUP BY c.semestre
       ORDER BY c.semestre DESC`
    );

    // Formatear los semestres para el frontend
    const semestresFormateados = rows.map((row, index) => ({
      id: index + 1, // ID temporal ya que no tenemos tabla de semestres
      nombre: row.semestre,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      cerrado: true // Asumimos que todos los semestres con tutorías realizadas están cerrados
    }));

    res.json(semestresFormateados);
  } catch (err) {
    console.error('Error en getSemestresCerrados:', err);
    next(err);
  }
}

async function getTutoriasPorSemestre(req, res, next) {
  const { semestre } = req.query;

  if (!semestre) {
    return res.status(400).json({ message: 'Semestre requerido' });
  }

  try {
    const query = `
      SELECT 
        t.id,
        CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS estudiante,
        e.codigo_estudiante,
        CONCAT(u.first_name, ' ', u.last_name) AS tutor,
        u.email AS tutor_email,
        c.semestre,
        TO_CHAR(c.fecha, 'YYYY-MM-DD') AS fecha,
        c.hora,
        c.ambiente,
        t.obs_academico,
        t.obs_personal,
        t.obs_profesional,
        t.resumen_general,
        t.requiere_derivacion,
        t.modalidad,
        t.fecha_registro,
        t.fecha_actualizacion,
        d.especialidad AS derivacion_especialidad,
        d.motivo AS derivacion_motivo
      FROM tutorias t
      INNER JOIN cronogramas c ON t.cronograma_id = c.id
      INNER JOIN tutores tu ON c.tutor_user_id = tu.user_id
      INNER JOIN users u ON tu.user_id = u.id
      INNER JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
      LEFT JOIN derivaciones d ON t.id = d.tutoria_id
      WHERE c.semestre = $1
        AND c.estado = 'realizada'
        AND c.fecha IS NOT NULL
      ORDER BY c.fecha DESC, t.fecha_registro DESC
    `;

    const { rows } = await pool.query(query, [semestre]);

    const tutoriasFormateadas = rows.map(t => ({
      id: t.id,
      estudiante: t.estudiante,
      codigo_estudiante: t.codigo_estudiante,
      tutor: t.tutor,
      tutor_email: t.tutor_email,
      semestre: t.semestre,
      fecha: `${t.fecha} ${t.hora || ''}`,
      modalidad: t.modalidad,
      ambiente: t.ambiente,
      observaciones: {
        academico: t.obs_academico,
        personal: t.obs_personal,
        profesional: t.obs_profesional,
        general: t.resumen_general
      },
      requiere_derivacion: t.requiere_derivacion,
      derivacion: t.derivacion_especialidad ? {
        especialidad: t.derivacion_especialidad,
        motivo: t.derivacion_motivo
      } : null,
      fechas: {
        registro: t.fecha_registro,
        actualizacion: t.fecha_actualizacion
      }
    }));

    res.json(tutoriasFormateadas);
  } catch (err) {
    console.error('❌ Error en getTutoriasPorSemestre:', err);
    next(err);
  }
}

async function getTutoriasPorEstudiante(req, res, next) {
  const { codigo, nombre, apellido } = req.query;

  try {
    // Validar que al menos haya un criterio de búsqueda
    if (!codigo && !nombre && !apellido) {
      return res.status(400).json({ 
        message: 'Debe proporcionar al menos un criterio de búsqueda (código, nombre o apellido)' 
      });
    }

    let filtros = [];
    let values = [];
    let idx = 1;

    // Filtro por código de estudiante (exacto)
    if (codigo) {
      filtros.push(`e.codigo_estudiante = $${idx}`);
      values.push(codigo);
      idx++;
    }

    // Si se proporciona un valor en "nombre", puede ser nombre completo (nombre + apellido)
    if (nombre && !apellido) {
      // Intentar separar nombre y apellido si viene en un solo campo
      const partes = nombre.trim().split(' ');
      if (partes.length >= 2) {
        // Si hay al menos dos partes, asumimos que la primera es nombre y las demás apellido
        const primerNombre = partes[0];
        const apellidos = partes.slice(1).join(' ');
        
        filtros.push(`(
          (LOWER(e.nombre_estudiante) LIKE LOWER($${idx}) 
           AND LOWER(e.apellido_estudiante) LIKE LOWER($${idx + 1}))
          OR CONCAT(LOWER(e.nombre_estudiante), ' ', LOWER(e.apellido_estudiante)) LIKE LOWER($${idx})
        )`);
        values.push(`%${primerNombre}%`, `%${apellidos}%`);
        idx += 2;
      } else {
        // Solo un término, buscar en ambos campos
        filtros.push(`(
          LOWER(e.nombre_estudiante) LIKE LOWER($${idx})
          OR LOWER(e.apellido_estudiante) LIKE LOWER($${idx})
        )`);
        values.push(`%${nombre}%`);
        idx++;
      }
    }

    // Si se proporcionan nombre y apellido por separado
    if (nombre && apellido) {
      filtros.push(`(
        LOWER(e.nombre_estudiante) LIKE LOWER($${idx})
        AND LOWER(e.apellido_estudiante) LIKE LOWER($${idx + 1})
      )`);
      values.push(`%${nombre}%`, `%${apellido}%`);
      idx += 2;
    }

    // Solo si se proporciona apellido solo (sin nombre)
    if (!nombre && apellido) {
      filtros.push(`LOWER(e.apellido_estudiante) LIKE LOWER($${idx})`);
      values.push(`%${apellido}%`);
      idx++;
    }

    // Solo tutorías realizadas
    filtros.push(`c.estado = 'realizada'`);

    // Solo fechas válidas
    filtros.push(`c.fecha IS NOT NULL`);

    // Construir la consulta SQL
    const query = `
      SELECT 
        t.id,
        CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS estudiante,
        e.codigo_estudiante,
        CONCAT(u.first_name, ' ', u.last_name) AS tutor,
        u.email as tutor_email,
        c.semestre,
        TO_CHAR(c.fecha, 'YYYY-MM-DD') AS fecha,
        c.hora,
        c.ambiente,
        t.obs_academico,
        t.obs_personal,
        t.obs_profesional,
        t.resumen_general,
        t.requiere_derivacion,
        t.modalidad,
        t.fecha_registro,
        t.fecha_actualizacion,
        -- Información de derivación si existe
        d.especialidad as derivacion_especialidad,
        d.motivo as derivacion_motivo
      FROM tutorias t
      INNER JOIN cronogramas c ON t.cronograma_id = c.id
      INNER JOIN tutores tu ON c.tutor_user_id = tu.user_id
      INNER JOIN users u ON tu.user_id = u.id
      INNER JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
      LEFT JOIN derivaciones d ON t.id = d.tutoria_id
      WHERE ${filtros.join(' AND ')}
      ORDER BY c.semestre DESC, c.fecha DESC
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontraron tutorías para el estudiante especificado'
      });
    }

    // Formatear la respuesta para el frontend
    const tutoriasFormateadas = rows.map(t => ({
      id: t.id,
      estudiante: t.estudiante,
      codigo_estudiante: t.codigo_estudiante,
      tutor: t.tutor,
      tutor_email: t.tutor_email,
      semestre: t.semestre,
      fecha: t.hora ? `${t.fecha} ${t.hora}` : t.fecha,
      modalidad: t.modalidad,
      ambiente: t.ambiente,
      observaciones: {
        academico: t.obs_academico,
        personal: t.obs_personal,
        profesional: t.obs_profesional,
        general: t.resumen_general
      },
      requiere_derivacion: t.requiere_derivacion,
      derivacion: t.derivacion_especialidad ? {
        especialidad: t.derivacion_especialidad,
        motivo: t.derivacion_motivo
      } : null,
      fechas: {
        registro: t.fecha_registro,
        actualizacion: t.fecha_actualizacion
      }
    }));

    res.json(tutoriasFormateadas);

  } catch (err) {
    console.error('❌ Error en getTutoriasPorEstudiante:', err);
    next(err);
  }
}

async function getTutoriaDetalle(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT 
        t.id,
        CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) as estudiante,
        e.codigo_estudiante,
        CONCAT(u.first_name, ' ', u.last_name) as tutor,
        u.email as tutor_email,
        TO_CHAR(c.fecha, 'YYYY-MM-DD') AS fecha,
        c.hora,
        c.ambiente,
        c.semestre,
        t.obs_academico,
        t.obs_personal,
        t.obs_profesional,
        t.resumen_general,
        t.requiere_derivacion,
        t.modalidad,
        t.fecha_registro,
        t.fecha_actualizacion,
        -- Información de derivación si existe
        d.especialidad as derivacion_especialidad,
        d.motivo as derivacion_motivo
       FROM tutorias t
       INNER JOIN cronogramas c ON t.cronograma_id = c.id
       INNER JOIN tutores tu ON c.tutor_user_id = tu.user_id
       INNER JOIN users u ON tu.user_id = u.id
       INNER JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
       LEFT JOIN derivaciones d ON t.id = d.tutoria_id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Tutoría no encontrada' });
    }

    const tutoria = rows[0];

    // Formatear la respuesta
    const respuesta = {
      id: tutoria.id,
      estudiante: tutoria.estudiante,
      codigo_estudiante: tutoria.codigo_estudiante,
      tutor: tutoria.tutor,
      tutor_email: tutoria.tutor_email,
      fecha: `${tutoria.fecha} ${tutoria.hora}`,
      semestre: tutoria.semestre,
      modalidad: tutoria.modalidad,
      ambiente: tutoria.ambiente,
      observaciones: {
        academico: tutoria.obs_academico,
        personal: tutoria.obs_personal,
        profesional: tutoria.obs_profesional,
        general: tutoria.resumen_general
      },
      requiere_derivacion: tutoria.requiere_derivacion,
      derivacion: tutoria.derivacion_especialidad ? {
        especialidad: tutoria.derivacion_especialidad,
        motivo: tutoria.derivacion_motivo
      } : null,
      fechas: {
        registro: tutoria.fecha_registro,
        actualizacion: tutoria.fecha_actualizacion
      }
    };

    res.json(respuesta);
  } catch (err) {
    console.error('Error en getTutoriaDetalle:', err);
    next(err);
  }
}

module.exports = {
  createPendingUser,
  approvePendingUser,
  getAllPendingUser,
  getOnePendingUser,
  getPendingUsers,
  getPendingUserDetail,
  rejectOnePendingUser,
  rejectPendingUser,
  decideRol,
  getSemestresCerrados,
  getTutoriasPorSemestre,
  getTutoriasPorEstudiante,
  getTutoriaDetalle,
};