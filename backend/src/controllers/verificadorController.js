const pool = require('../db/pool');

// HU-VER-01: Listado de Estudiantes (Filtro: Fecha, Estado)
// Params: fecha (YYYY-MM-DD), estado (opt)
async function getEstudiantes(req, res) {
    try {
        const { fecha, estado } = req.query;

        let whereClause = '1=1';
        const params = [];
        let paramIndex = 1;

        // Filtro OBLIGATORIO por Fecha (Single Date)
        if (fecha) {
            // Asumiendo que cronogramas.fecha es DATE o TIMESTAMP
            // Si es timestamp, casteamos a date.
            whereClause += ` AND DATE(c.fecha) = $${paramIndex}`;
            params.push(fecha);
            paramIndex++;
        } else {
            // Si no hay fecha, NO devolver nada o devolver un set vacío para no saturar
            // User request: "El botón Buscar debe consultar por: fecha (obligatoria)"
            // Si llega vacía, retornamos vacío.
            return res.json([]);
        }

        // Filtro por Estado
        if (estado && estado !== 'Todos' && estado !== '') {
            whereClause += ` AND c.estado = $${paramIndex}`;
            params.push(estado);
            paramIndex++;
        }

        const query = `
            SELECT DISTINCT ON(c.id)
                c.id,
                c.codigo_estudiante AS codigo,
                CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS estudiante,
                TO_CHAR(c.fecha, 'YYYY-MM-DD') AS fecha_atencion,
                TO_CHAR(c.hora, 'HH24:MI') as hora,
                CONCAT(u.first_name, ' ', u.last_name) AS tutor,
                c.estado
            FROM cronogramas c
            JOIN estudiante e ON e.codigo_estudiante = c.codigo_estudiante
            JOIN users u ON u.id = c.tutor_user_id
            WHERE ${whereClause}
            ORDER BY c.id, c.fecha DESC, c.hora DESC
        `;

        const { rows } = await pool.query(query, params);

        // Formateo final
        const result = rows.map(r => ({
            codigo: r.codigo,
            estudiante: r.estudiante,
            // Combinar si el front lo espera así, o campos separados
            fecha_atencion: `${r.fecha_atencion} ${r.hora}`,
            tutor: r.tutor,
            estado: r.estado
        }));

        return res.json(result);
    } catch (error) {
        console.error('Error getEstudiantes:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// HU-VER-02: Consulta de tutorías (Filtros: Semestre, Tipo)
async function getTutorias(req, res) {
    try {
        const { semestre, tipo } = req.query;

        let whereClause = '1=1';
        const params = [];
        let paramIndex = 1;

        if (semestre && semestre !== 'Todos') {
            whereClause += ` AND c.semestre = $${paramIndex}`;
            params.push(semestre);
            paramIndex++;
        }

        // Filtro por Tipo (Académica, Personal, Profesional)
        let tipoWhere = "";
        if (tipo && tipo !== 'Todos') {
            if (tipo === 'Académica') {
                tipoWhere = ` AND (t.obs_academico IS NOT NULL AND t.obs_academico <> '')`;
            } else if (tipo === 'Personal') {
                tipoWhere = ` AND (t.obs_personal IS NOT NULL AND t.obs_personal <> '')`;
            } else if (tipo === 'Profesional') {
                tipoWhere = ` AND (t.obs_profesional IS NOT NULL AND t.obs_profesional <> '')`;
            }
        }

        const query = `
            SELECT
                c.id AS cronograma_id,
                t.id AS tutoria_id,
                c.codigo_estudiante,
                CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS estudiante_nombre_completo,
                CONCAT(u.first_name, ' ', u.last_name) AS tutor_nombre_completo,
                c.semestre,
                TO_CHAR(c.fecha, 'YYYY-MM-DD') as fecha,
                TO_CHAR(c.hora, 'HH24:MI') as hora,
                c.estado
            FROM cronogramas c
            JOIN estudiante e ON e.codigo_estudiante = c.codigo_estudiante
            JOIN users u ON u.id = c.tutor_user_id
            LEFT JOIN tutorias t ON t.cronograma_id = c.id
            WHERE ${whereClause} ${tipoWhere}
            ORDER BY c.fecha DESC, c.hora DESC
        `;

        const { rows } = await pool.query(query, params);

        const result = rows.map(r => ({
            cronograma_id: r.cronograma_id, // CRITICAL: Frontend needs this
            estudiante: r.estudiante_nombre_completo,
            tutor: r.tutor_nombre_completo,
            fecha: `${r.fecha} ${r.hora}`,
            estado: r.estado // Frontend might use this or derived, but request said remove badge
        }));

        return res.json(result);
    } catch (error) {
        console.error('Error getTutorias:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// Detalle de Tutoria para Modal (EXACT structure for DetalleTutoriaModal)
async function getTutoriaDetalle(req, res) {
    try {
        const { cronogramaId } = req.query; // Query Param required

        if (!cronogramaId) {
            return res.status(400).json({ message: 'Falta parámetro cronogramaId' });
        }

        const query = `
            SELECT 
                c.id AS cronograma_id,
                c.codigo_estudiante,
                CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS estudiante,
                CONCAT(u.first_name, ' ', u.last_name) AS tutor,
                u.email AS tutor_email,
                c.semestre,
                c.fecha AS fecha_raw,
                c.ambiente,
                c.estado AS estado_cronograma,
                t.modalidad,
                t.obs_academico,
                t.obs_personal,
                t.obs_profesional,
                t.resumen_general,
                t.requiere_derivacion,
                d.especialidad,
                d.motivo,
                t.fecha_registro AS fecha_registro,
                t.fecha_actualizacion AS fecha_actualizacion
            FROM cronogramas c
            JOIN estudiante e ON e.codigo_estudiante = c.codigo_estudiante
            JOIN users u ON u.id = c.tutor_user_id
            LEFT JOIN tutorias t ON t.cronograma_id = c.id
            LEFT JOIN derivaciones d ON d.tutoria_id = t.id
            WHERE c.id = $1
            LIMIT 1
        `;

        const { rows } = await pool.query(query, [cronogramaId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Tutoría/Cronograma no encontrado' });
        }

        const data = rows[0];

        // Estructura EXACTA para DetalleTutoriaModal (frontend/src/componentes/DetalleTutoriaModal.jsx)
        const result = {
            estudiante: data.estudiante,
            codigo_estudiante: data.codigo_estudiante,
            tutor: data.tutor,
            tutor_email: data.tutor_email,
            semestre: data.semestre,
            fecha: data.fecha_raw, // Date object or string is fine, component formats it
            modalidad: data.modalidad || data.estado_cronograma, // Fallback if no tutoria record
            ambiente: data.ambiente,
            requiere_derivacion: data.requiere_derivacion,
            observaciones: {
                academico: data.obs_academico,
                personal: data.obs_personal,
                profesional: data.obs_profesional,
                general: data.resumen_general
            },
            derivacion: (data.requiere_derivacion && (data.especialidad || data.motivo)) ? {
                especialidad: data.especialidad,
                motivo: data.motivo
            } : null,
            fechas: {
                registro: data.fecha_registro || data.fecha_raw,
                actualizacion: data.updated_at
            }
        };

        res.json(result);

    } catch (error) {
        console.error('Error getTutoriaDetalle:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// Filtros Dynamic: Estudiantes Atendidos (Estados)
async function getFiltrosEstudiantes(req, res) {
    try {
        const query = `SELECT DISTINCT estado FROM cronogramas WHERE estado IS NOT NULL ORDER BY estado`;
        const { rows } = await pool.query(query);
        const estados = rows.map(r => r.estado);
        res.json({ estados });
    } catch (error) {
        console.error('Error getFiltrosEstudiantes:', error);
        res.status(500).json({ message: 'Error al obtener filtros' });
    }
}

// Filtros Dynamic: Consulta Tutorias (Semestres, Tipos)
async function getFiltrosTutorias(req, res) {
    try {
        const query = `SELECT DISTINCT semestre FROM cronogramas WHERE semestre IS NOT NULL ORDER BY semestre DESC`;
        const { rows } = await pool.query(query);
        // Tipos estáticos
        const tipos = ['Académica', 'Personal', 'Profesional'];
        res.json({
            semestres: rows.map(r => r.semestre),
            tipos
        });
    } catch (error) {
        console.error('Error getFiltrosTutorias:', error);
        res.status(500).json({ message: 'Error al obtener filtros' });
    }
}

// Existing un-modified functions placeholders (to keep file complete)
async function buscarEstudiante(req, res) {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Término de búsqueda requerido' });
        const query = `
            SELECT codigo_estudiante, nombre_estudiante, apellido_estudiante
            FROM estudiante e
            WHERE e.codigo_estudiante ILIKE '%' || $1 || '%' 
               OR (e.nombre_estudiante || ' ' || e.apellido_estudiante) ILIKE '%' || $1 || '%'
            LIMIT 20
        `;
        const { rows } = await pool.query(query, [q]);
        return res.json(rows);
    } catch (error) {
        console.error('Error buscarEstudiante:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function getHistorialEstudiante(req, res) {
    try {
        const { codigo } = req.params;
        const { semestre } = req.query;
        let query = `
            SELECT 
                c.fecha AS fecha_raw,
                TO_CHAR(c.fecha, 'YYYY-MM-DD') as fecha,
                TO_CHAR(c.hora, 'HH24:MI') as hora,
                c.semestre,
                c.ambiente,
                c.estado,
                CONCAT(u.first_name, ' ', u.last_name) AS tutor,
                t.modalidad,
                t.resumen_general,
                t.requiere_derivacion,
                CASE 
                    WHEN t.obs_academico IS NOT NULL AND t.obs_academico <> '' THEN 'Académica'
                    WHEN t.obs_personal IS NOT NULL AND t.obs_personal <> '' THEN 'Personal'
                    WHEN t.obs_profesional IS NOT NULL AND t.obs_profesional <> '' THEN 'Profesional'
                    ELSE 'Individual'
                END as tipo
            FROM cronogramas c
            JOIN users u ON u.id = c.tutor_user_id
            LEFT JOIN tutorias t ON t.cronograma_id = c.id
            WHERE c.codigo_estudiante = $1
        `;
        const params = [codigo];
        if (semestre) {
            query += ` AND c.semestre = $2`;
            params.push(semestre);
        }
        query += ` ORDER BY c.fecha DESC, c.hora DESC`;
        const { rows } = await pool.query(query, params);
        const result = rows.map(r => ({
            fecha: `${r.fecha} ${r.hora}`,
            tipo: r.tipo,
            tutor: r.tutor,
            estado: r.estado,
            modalidad: r.modalidad,
            observaciones: r.resumen_general || '-'
        }));
        return res.json(result);
    } catch (error) {
        console.error('Error getHistorialEstudiante:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function getTutores(req, res) {
    try {
        const query = `
            SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as nombre
            FROM users u
            JOIN tutores t ON t.user_id = u.id
            ORDER BY u.first_name, u.last_name
    `;
        const { rows } = await pool.query(query);
        return res.json(rows);
    } catch (error) {
        console.error('Error getTutores:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function getSeguimientoTutor(req, res) {
    try {
        const { id } = req.params;
        const { semestre } = req.query;
        if (!semestre) return res.status(400).json({ message: 'Semestre requerido' });

        const kpiQuery = `
            SELECT
                COUNT(*) as total,
                COUNT(CASE WHEN estado = 'realizada' THEN 1 END) as realizadas,
                COUNT(CASE WHEN estado = 'programada' THEN 1 END) as pendientes,
                COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as canceladas
            FROM cronogramas
            WHERE tutor_user_id = $1 AND semestre = $2
        `;
        const kpiRes = await pool.query(kpiQuery, [id, semestre]);
        const kpis = kpiRes.rows[0];

        const detalleQuery = `
            SELECT
                c.codigo_estudiante,
                CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS estudiante_nombre,
                TO_CHAR(c.fecha, 'YYYY-MM-DD') as fecha,
                TO_CHAR(c.hora, 'HH24:MI') as hora,
                c.semestre,
                c.estado,
                c.ambiente,
                CASE 
                    WHEN t.obs_academico IS NOT NULL AND t.obs_academico <> '' THEN 'Académica'
                    WHEN t.obs_personal IS NOT NULL AND t.obs_personal <> '' THEN 'Personal'
                    WHEN t.obs_profesional IS NOT NULL AND t.obs_profesional <> '' THEN 'Profesional'
                    ELSE 'Individual'
                END as tipo
            FROM cronogramas c
            JOIN estudiante e ON e.codigo_estudiante = c.codigo_estudiante
            LEFT JOIN tutorias t ON t.cronograma_id = c.id
            WHERE c.tutor_user_id = $1 AND c.semestre = $2
            ORDER BY c.fecha DESC, c.hora DESC
        `;
        const detalleRes = await pool.query(detalleQuery, [id, semestre]);
        const detalle = detalleRes.rows.map(r => ({
            estudiante: r.estudiante_nombre,
            fecha: `${r.fecha} ${r.hora} `,
            tipo: r.tipo,
            estado: r.estado
        }));
        return res.json({
            kpi: {
                total: kpis.total,
                realizadas: kpis.realizadas,
                pendientes: kpis.pendientes,
                canceladas: kpis.canceladas
            },
            detalle: detalle
        });
    } catch (error) {
        console.error('Error getSeguimientoTutor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

module.exports = {
    getEstudiantes,
    getTutorias,
    getFiltrosEstudiantes,
    getFiltrosTutorias,
    getTutoriaDetalle,
    buscarEstudiante,
    getHistorialEstudiante,
    getTutores,
    getSeguimientoTutor
};
