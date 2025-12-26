// src/controllers/adminController.js
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendAdminApprovalEmail, sendUserActivationEmail } = require('../services/mailService');

async function createPendingUser(req, res, next) {
  try {
    const { first_name, last_name, email, password, roles } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await pool.query(
      `INSERT INTO pending_users (id, first_name, last_name, email, password_hash, roles)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, first_name, last_name, email, hashed, roles]
    );

    // enviar notificación a un administrador
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

async function approvePendingUser(req, res, next) {
  try {
    const { pendingUserId } = req.body;

    const q = await pool.query(`SELECT * FROM pending_users WHERE id=$1`, [pendingUserId]);
    if (q.rowCount === 0)
      return res.status(404).json({ message: 'Solicitud no encontrada' });

    const pendingUser = q.rows[0];

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
        pendingUser.roles,
        false
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

async function getAllPendingUser(req, res, next){
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

async function getOnePendingUser(req, res, next){
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

async function getSemestresCerrados(req, res, next){
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

async function getTutoriasPorSemestre(req, res, next){
  const { semestre } = req.query; // Cambiado de semestreId a semestre (string)

  console.log('🔍 GET /admin/tutorias - semestre:', semestre);
  console.log('🔍 Usuario autenticado:', req.user);

  if (!semestre) {
    return res.status(400).json({ message: 'Semestre requerido' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT 
        t.id,
        CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) as estudiante,
        CONCAT(u.first_name, ' ', u.last_name) as tutor,
        -- Determinar el tipo de tutoría basado en las observaciones
        CASE 
          WHEN t.obs_academico IS NOT NULL AND t.obs_academico != '' THEN 'ACADEMICA'
          WHEN t.obs_personal IS NOT NULL AND t.obs_personal != '' THEN 'PERSONAL'
          WHEN t.obs_profesional IS NOT NULL AND t.obs_profesional != '' THEN 'PROFESIONAL'
          ELSE 'GENERAL'
        END as tipo,
        c.fecha,
        t.fecha_registro,
        t.resumen_general
       FROM tutorias t
       INNER JOIN cronogramas c ON t.cronograma_id = c.id
       INNER JOIN tutores tu ON c.tutor_user_id = tu.user_id
       INNER JOIN users u ON tu.user_id = u.id
       INNER JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
       WHERE c.semestre = $1
       AND c.estado = 'realizada'
       ORDER BY c.fecha DESC, t.fecha_registro DESC`,
      [semestre]
    );

    console.log('📊 Tutorías encontradas:', rows.length);

    res.json(rows);
  } catch (err) {
    console.error('❌ Error en getTutoriasPorSemestre:', err);
    next(err);
  }
}

async function getTutoriaDetalle(req, res, next){
  try {
    const { rows } = await pool.query(
      `SELECT 
        t.id,
        CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) as estudiante,
        e.codigo_estudiante,
        CONCAT(u.first_name, ' ', u.last_name) as tutor,
        u.email as tutor_email,
        c.fecha,
        c.hora,
        c.ambiente,
        c.semestre,
        -- Determinar el tipo de tutoría
        CASE 
          WHEN t.obs_academico IS NOT NULL AND t.obs_academico != '' THEN 'ACADEMICA'
          WHEN t.obs_personal IS NOT NULL AND t.obs_personal != '' THEN 'PERSONAL'
          WHEN t.obs_profesional IS NOT NULL AND t.obs_profesional != '' THEN 'PROFESIONAL'
          ELSE 'GENERAL'
        END as tipo,
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
      tipo: tutoria.tipo,
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
  rejectOnePendingUser,
  decideRol,
  getSemestresCerrados,
  getTutoriasPorSemestre,
  getTutoriaDetalle,
};
