const pool = require('../db/pool');

/**
 * cronogramaController.js - Controlador para gestión de cronogramas de tutorías
 */

/**
 * Obtener todos los cronogramas con información de tutores y estudiantes
 * Soporta filtro por nombre de tutor
 */
async function getCronogramas(req, res, next) {
    try {
        const { search } = req.query;

        let query = `
      SELECT 
        c.id,
        c.fecha,
        c.hora,
        c.ambiente,
        c.semestre,
        c.estado,
        c.created_at,
        u.first_name || ' ' || u.last_name as tutor_nombre,
        u.id as tutor_id,
        e.codigo_estudiante,
        e.nombre_estudiante || ' ' || e.apellido_estudiante as estudiante_nombre,
        (
          SELECT COUNT(DISTINCT c2.codigo_estudiante)
          FROM cronogramas c2
          WHERE c2.tutor_user_id = c.tutor_user_id
            AND c2.fecha = c.fecha
            AND c2.hora = c.hora
        ) as num_estudiantes
      FROM cronogramas c
      INNER JOIN tutores t ON c.tutor_user_id = t.user_id
      INNER JOIN users u ON t.user_id = u.id
      INNER JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
      WHERE 1=1
    `;

        const params = [];

        if (search) {
            query += ` AND (u.first_name ILIKE $1 OR u.last_name ILIKE $1)`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY c.fecha DESC, c.hora DESC`;

        const result = await pool.query(query, params);

        // Agrupar por fecha, hora y tutor para mostrar correctamente
        const cronogramasMap = new Map();

        result.rows.forEach(row => {
            const key = `${row.tutor_id}-${row.fecha}-${row.hora}`;

            if (!cronogramasMap.has(key)) {
                // Calcular hora fin (hora inicio + 15 minutos)
                const [hours, minutes] = row.hora.split(':');
                const date = new Date();
                date.setHours(parseInt(hours), parseInt(minutes));
                date.setMinutes(date.getMinutes() + 15);
                const endHours = date.getHours().toString().padStart(2, '0');
                const endMinutes = date.getMinutes().toString().padStart(2, '0');
                const horaFin = `${endHours}:${endMinutes}`;

                cronogramasMap.set(key, {
                    id: row.id,
                    fecha: new Date(row.fecha).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                    }),
                    horario: `${row.hora.substring(0, 5)} - ${horaFin}`,
                    hora_inicio: row.hora.substring(0, 5),
                    aula: row.ambiente,
                    tutor: row.tutor_nombre,
                    tutor_id: row.tutor_id,
                    estudiantes: `${row.num_estudiantes} estudiante${row.num_estudiantes !== 1 ? 's' : ''}`,
                    num_estudiantes: row.num_estudiantes,
                    semestre: row.semestre,
                    estado: row.estado,
                    raw_fecha: row.fecha,
                    raw_hora: row.hora
                });
            }
        });

        const cronogramas = Array.from(cronogramasMap.values());
        res.json(cronogramas);

    } catch (err) {
        next(err);
    }
}

/**
 * Crear un nuevo cronograma
 */
async function createCronograma(req, res, next) {
    try {
        const { tutor_user_id, codigo_estudiante, fecha, hora, ambiente, semestre } = req.body;

        if (!tutor_user_id || !codigo_estudiante || !fecha || !hora || !ambiente || !semestre) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        // Verificar que existe una asignación activa
        const asignacionResult = await pool.query(
            `SELECT id FROM tutor_asignacion 
       WHERE tutor_user_id = $1 
         AND codigo_estudiante = $2 
         AND semestre = $3 
         AND estado = 'activo'`,
            [tutor_user_id, codigo_estudiante, semestre]
        );

        if (asignacionResult.rows.length === 0) {
            return res.status(400).json({
                message: 'No existe una asignación activa entre el tutor y el estudiante para este semestre'
            });
        }

        const asignacion_id = asignacionResult.rows[0].id;

        // Insertar el cronograma
        const insertQuery = `
      INSERT INTO cronogramas (tutor_user_id, codigo_estudiante, asignacion_id, fecha, hora, ambiente, semestre, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'programada')
      RETURNING *
    `;

        const result = await pool.query(insertQuery, [
            tutor_user_id,
            codigo_estudiante,
            asignacion_id,
            fecha,
            hora,
            ambiente,
            semestre
        ]);

        res.status(201).json({
            message: 'Cronograma creado exitosamente',
            cronograma: result.rows[0]
        });

    } catch (err) {
        // Manejar errores de constraints únicos
        if (err.code === '23505') {
            if (err.constraint === 'uq_cronograma_tutor_fecha_hora') {
                return res.status(400).json({
                    message: 'El tutor ya tiene un cronograma programado en esta fecha y hora'
                });
            }
            if (err.constraint === 'uq_cronograma_ambiente_fecha_hora') {
                return res.status(400).json({
                    message: 'El ambiente ya está ocupado en esta fecha y hora'
                });
            }
        }
        next(err);
    }
}

/**
 * Obtener un cronograma por ID
 */
async function getCronogramaById(req, res, next) {
    try {
        const { id } = req.params;

        const query = `
      SELECT 
        c.*,
        u.first_name || ' ' || u.last_name as tutor_nombre,
        e.nombre_estudiante || ' ' || e.apellido_estudiante as estudiante_nombre
      FROM cronogramas c
      INNER JOIN tutores t ON c.tutor_user_id = t.user_id
      INNER JOIN users u ON t.user_id = u.id
      INNER JOIN estudiante e ON c.codigo_estudiante = e.codigo_estudiante
      WHERE c.id = $1
    `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cronograma no encontrado' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        next(err);
    }
}

/**
 * Actualizar un cronograma
 */
async function updateCronograma(req, res, next) {
    try {
        const { id } = req.params;
        const { fecha, hora, ambiente, estado } = req.body;

        // Verificar que el cronograma existe
        const checkResult = await pool.query('SELECT * FROM cronogramas WHERE id = $1', [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Cronograma no encontrado' });
        }

        // Construir query de actualización dinámicamente
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (fecha !== undefined) {
            updates.push(`fecha = $${paramCount++}`);
            params.push(fecha);
        }
        if (hora !== undefined) {
            updates.push(`hora = $${paramCount++}`);
            params.push(hora);
        }
        if (ambiente !== undefined) {
            updates.push(`ambiente = $${paramCount++}`);
            params.push(ambiente);
        }
        if (estado !== undefined) {
            updates.push(`estado = $${paramCount++}`);
            params.push(estado);
        }


        if (updates.length === 0) {
            return res.status(400).json({ message: 'No hay campos para actualizar' });
        }

        params.push(id);
        const query = `
      UPDATE cronogramas 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

        const result = await pool.query(query, params);

        res.json({
            message: 'Cronograma actualizado exitosamente',
            cronograma: result.rows[0]
        });

    } catch (err) {
        next(err);
    }
}

/**
 * Eliminar un cronograma
 */
async function deleteCronograma(req, res, next) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM cronogramas WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cronograma no encontrado' });
        }

        res.json({ message: 'Cronograma eliminado exitosamente' });

    } catch (err) {
        next(err);
    }
}

module.exports = {
    getCronogramas,
    createCronograma,
    getCronogramaById,
    updateCronograma,
    deleteCronograma
};
