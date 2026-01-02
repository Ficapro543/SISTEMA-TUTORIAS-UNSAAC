const pool = require('../db/pool');


// HU-VER-01: Control de estudiantes atendidos y pendientes
// Query Params: semestre (req), estado (opt, 'Atendido'|'Pendiente'|'Todos'|'')
async function getEstudiantesPorSemestreEstado(req, res) {
    try {
        const { semestre, estado } = req.query;

        if (!semestre) {
            return res.status(400).json({ message: 'El parámetro "semestre" es obligatorio.' });
        }

        const params = [semestre];
        let whereClause = 'c.semestre = $1';
        let paramIndex = 2;

        // Si estado viene y NO es vacío ni 'Todos', filtramos.
        if (estado && estado !== 'Todos') {
            const est = estado.toLowerCase();
            let estadoDB = null;

            // Mapeo: 'Atendido' -> 'realizada', 'Pendiente' -> 'programada'
            if (est === 'atendido' || est === 'realizada') estadoDB = 'realizada';
            else if (est === 'pendiente' || est === 'programada') estadoDB = 'programada';

            if (estadoDB) {
                whereClause += ` AND c.estado = $${paramIndex} `;
                params.push(estadoDB);
                paramIndex++;
            }
        }

        const query = `
      SELECT DISTINCT ON(c.codigo_estudiante)
c.codigo_estudiante AS codigo,
    CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS nombre,
        TO_CHAR((c.fecha + c.hora), 'YYYY-MM-DD HH24:MI') AS fecha_atencion,
            CONCAT(u.first_name, ' ', u.last_name) AS tutor,
                c.estado
      FROM cronogramas c
      JOIN estudiante e ON e.codigo_estudiante = c.codigo_estudiante
      JOIN users u ON u.id = c.tutor_user_id
      WHERE ${whereClause}
      ORDER BY c.codigo_estudiante, (c.fecha + c.hora) DESC;
`;

        const { rows } = await pool.query(query, params);
        return res.json(rows);
    } catch (error) {
        console.error('Error getEstudiantesPorSemestreEstado:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// HU-VER-02: Consulta de tutorías por semestre y tipo
// Query Params: semestre (req), tipo (opt), tutor_id (opt)
async function getTutoriasPorSemestre(req, res) {
    try {
        const { semestre, tipo, tutor_id } = req.query;

        if (!semestre) {
            return res.status(400).json({ message: 'El parámetro "semestre" es obligatorio.' });
        }

        const params = [semestre];
        let whereClause = 'c.semestre = $1';
        let paramIndex = 2;

        // Filtro por ID de Tutor si viene
        if (tutor_id && tutor_id !== 'Todos') {
            whereClause += ` AND c.tutor_user_id = $${paramIndex} `;
            params.push(tutor_id);
            paramIndex++;
        }

        // Tipo: Logica JS vs SQL. Como 'tipo' es inferido, es mejor filtrar en SQL si es posible o en JS.
        // Dado el CASE, en SQL sería: AND (CASE ... END) = $param.
        // Pero para simplificar y asegurar compatibilidad, filtraremos en memoria si no resulta muy pesado,
        // O implementamos el CASE en el WHERE. Implementaré CASE en WHERE para eficiencia.

        let tipoWhere = "";
        let tipoParamVal = null;

        if (tipo && tipo !== 'Todos') {
            // 'Académica', 'Personal', 'Profesional'
            if (tipo === 'Académica') {
                tipoWhere = ` AND(t.obs_academico IS NOT NULL AND t.obs_academico <> '')`;
            } else if (tipo === 'Personal') {
                tipoWhere = ` AND(t.obs_personal IS NOT NULL AND t.obs_personal <> '')`;
            } else if (tipo === 'Profesional') {
                tipoWhere = ` AND(t.obs_profesional IS NOT NULL AND t.obs_profesional <> '')`;
            }
        }

        const query = `
SELECT
c.codigo_estudiante,
    CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS estudiante_nombre_completo,
        CONCAT(u.first_name, ' ', u.last_name) AS tutor_nombre_completo,
            c.semestre,
            TO_CHAR(c.fecha, 'YYYY-MM-DD') as fecha,
            TO_CHAR(c.hora, 'HH24:MI') as hora,
            c.estado,
            CASE 
                    WHEN t.obs_academico IS NOT NULL AND t.obs_academico <> '' THEN 'Académica'
                    WHEN t.obs_personal IS NOT NULL AND t.obs_personal <> '' THEN 'Personal'
                    WHEN t.obs_profesional IS NOT NULL AND t.obs_profesional <> '' THEN 'Profesional'
                    ELSE 'Sin registro'
END as tipo
            FROM cronogramas c
            JOIN estudiante e ON e.codigo_estudiante = c.codigo_estudiante
            JOIN users u ON u.id = c.tutor_user_id
            LEFT JOIN tutorias t ON t.cronograma_id = c.id
            WHERE ${whereClause} ${tipoWhere}
            ORDER BY c.fecha DESC, c.hora DESC
        `;

        const { rows } = await pool.query(query, params);

        // Mapeo final para frontend (normalización de nombres de keys si se requiere, pero usaré los del query)
        // Frontend espera: estudiante, tutor, tipo, fecha, estado.
        const result = rows.map(r => ({
            estudiante: r.estudiante_nombre_completo,
            tutor: r.tutor_nombre_completo,
            tipo: r.tipo,
            fecha: `${r.fecha} ${r.hora} `,
            estado: r.estado
        }));

        return res.json(result);
    } catch (error) {
        console.error('Error getTutoriasPorSemestre:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// HU-VER-03: Buscar estudiante
async function buscarEstudiante(req, res) {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Término de búsqueda requerido' });
        }

        // Buscar por código exacto o parcial, o por nombre/apellido
        const query = `
            SELECT 
                codigo_estudiante, 
                nombre_estudiante, 
                apellido_estudiante
            FROM estudiante e
            WHERE 
                e.codigo_estudiante ILIKE '%' || $1 || '%' 
                OR (e.nombre_estudiante || ' ' || e.apellido_estudiante) ILIKE '%' || $1 || '%'
            LIMIT 20
        `;

        const { rows } = await pool.query(query, [q]);
        return res.json(rows);

    } catch (error) {
        console.error('Error buscarEstudiante:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// HU-VER-03: Historial estudiante
async function getHistorialEstudiante(req, res) {
    try {
        const { codigo } = req.params;
        const { semestre } = req.query; // Opcional

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

        // Mantener codigo como texto explícitamente si es necesario en drivers viejos,
        // pero pg con string funciona.
        const params = [codigo];

        if (semestre) {
            query += ` AND c.semestre = $2`;
            params.push(semestre);
        }

        query += ` ORDER BY c.fecha DESC, c.hora DESC`;

        const { rows } = await pool.query(query, params);

        // Formateo final
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
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// HU-VER-04: Lista Tutores
async function getTutores(req, res) {
    try {
        // Solo usuarios que estén en la tabla 'tutores'
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
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// HU-VER-04: Seguimiento Tutor
async function getSeguimientoTutor(req, res) {
    try {
        const { id } = req.params;
        const { semestre } = req.query;

        if (!semestre) {
            return res.status(400).json({ message: 'Semestre requerido' });
        }

        // KPIs
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

        // Detalle
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

        // Formato para frontend
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
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

module.exports = {
    getEstudiantesPorSemestreEstado,
    getTutoriasPorSemestre,
    buscarEstudiante,
    getHistorialEstudiante,
    getTutores,
    getSeguimientoTutor
};
