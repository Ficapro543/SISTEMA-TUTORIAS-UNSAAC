const pool = require('../db/pool');

// TEMPORAL: Descubrir esquema de BD
async function getSchema(req, res) {
    try {
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;
        const columnsQuery = `
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            ORDER BY table_name, ordinal_position;
        `;

        const tables = await pool.query(tablesQuery);
        const columns = await pool.query(columnsQuery);

        res.json({
            tables: tables.rows,
            columns: columns.rows
        });
    } catch (error) {
        console.error('Error getSchema:', error);
        res.status(500).json({ error: error.message });
    }
}

// HU-VER-01: Control de estudiantes atendidos y pendientes
// GET /api/verificador/estudiantes?semestre=2025-2&estado=Atendido|Pendiente
async function getEstudiantesPorSemestreEstado(req, res) {
    try {
        const { semestre, estado } = req.query;

        if (!semestre) {
            return res.status(400).json({ message: 'El parámetro "semestre" es obligatorio.' });
        }

        const params = [semestre];
        let whereClause = 'c.semestre = $1';
        let paramIndex = 2;

        // Si estado es "Todos" o vacío, no filtramos por estado.
        // Si viene Atendido/Pendiente, mapeamos a realizada/programada
        if (estado && estado !== 'Todos') {
            const est = estado.toLowerCase();
            let estadoDB = null;
            if (est === 'atendido') estadoDB = 'realizada';
            else if (est === 'pendiente') estadoDB = 'programada';

            if (estadoDB) {
                whereClause += ` AND c.estado = $${paramIndex}`;
                params.push(estadoDB);
                paramIndex++;
            }
        }

        const query = `
      SELECT DISTINCT ON (c.codigo_estudiante)
        c.codigo_estudiante AS codigo,
        CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS nombre,
        (c.fecha + c.hora) AS fecha_atencion,
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

// HU-VER-02: Consulta de tutorías por semestre, tipo y tutor
// GET /api/verificador/tutorias?semestre=...&tipo=...&tutor=...
async function getTutoriasPorSemestre(req, res) {
    try {
        const { semestre, tipo, tutor } = req.query;

        if (!semestre) {
            return res.status(400).json({ message: 'El parámetro "semestre" es obligatorio.' });
        }

        const params = [semestre];
        let whereClause = 'c.semestre = $1';
        let paramIndex = 2;

        if (tipo && tipo !== 'Todos') {
            whereClause += ` AND c.tipo_tutoria = $${paramIndex}`;
            params.push(tipo);
            paramIndex++;
        }

        // tutor viene como nombre "Dr. Juan", pero necesitamos ID o búsqueda.
        // Asumo que el frontend enviará el NOMBRE exacto o filtraremos por string match si no hay ID.
        // Dado el mock anterior, el frontend enviaba nombres. Lo ideal es ID.
        // Voy a intentar coincidencia parcial con nombre si no es ID, o exacto.
        if (tutor && tutor !== 'Todos') {
            whereClause += ` AND CONCAT(u.first_name, ' ', u.last_name) = $${paramIndex}`;
            params.push(tutor);
            paramIndex++;
        }

        const query = `
            SELECT 
                CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS estudiante,
                CONCAT(u.first_name, ' ', u.last_name) AS tutor,
                c.tipo_tutoria AS tipo,
                c.fecha,
                c.estado
            FROM cronogramas c
            JOIN estudiante e ON e.codigo_estudiante = c.codigo_estudiante
            JOIN users u ON u.id = c.tutor_user_id
            WHERE ${whereClause}
            ORDER BY c.fecha DESC, c.hora DESC
        `;

        const { rows } = await pool.query(query, params);
        return res.json(rows);
    } catch (error) {
        console.error('Error getTutoriasPorSemestre:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// HU-VER-03: Seguimiento individual - BUSCAR
// GET /api/verificador/estudiantes/buscar?q=...
async function buscarEstudiante(req, res) {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        // Búsqueda por código o nombre
        const query = `
            SELECT 
                e.codigo_estudiante AS codigo,
                CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS nombre,
                e.escuela_profesional AS escuela,
                e.email_institucional AS email,
                -- Intentar obtener el tutor actual (último asignado o de la última sesión)
                (
                    SELECT CONCAT(u.first_name, ' ', u.last_name)
                    FROM cronogramas c2
                    JOIN users u ON u.id = c2.tutor_user_id
                    WHERE c2.codigo_estudiante = e.codigo_estudiante
                    ORDER BY c2.fecha DESC LIMIT 1
                ) as tutor_actual
            FROM estudiante e
            WHERE e.codigo_estudiante ILIKE $1 OR 
                  CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) ILIKE $1
            LIMIT 10
        `;

        const { rows } = await pool.query(query, [`%${q}%`]);
        return res.json(rows);

    } catch (error) {
        console.error('Error buscarEstudiante:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// HU-VER-03: Seguimiento individual - HISTORIAL
// GET /api/verificador/estudiantes/:codigo/historial
async function getHistorialEstudiante(req, res) {
    try {
        const { codigo } = req.params;

        const query = `
            SELECT 
                c.fecha,
                c.tipo_tutoria AS tipo,
                CONCAT(u.first_name, ' ', u.last_name) AS tutor,
                c.estado,
                c.observacion AS observaciones
            FROM cronogramas c
            JOIN users u ON u.id = c.tutor_user_id
            WHERE c.codigo_estudiante = $1
            ORDER BY c.fecha DESC
        `;

        const { rows } = await pool.query(query, [codigo]);
        return res.json(rows);
    } catch (error) {
        console.error('Error getHistorialEstudiante:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// HU-VER-04: Seguimiento tutor - LISTA TUTORES
// GET /api/verificador/tutores
async function getTutores(req, res) {
    try {
        // Obtener usuarios con rol 'tutor'. 
        // Asumiendo que hay una columna o tabla de roles, o un filtro en users.
        // Dado el esquema usual, quizá roles está en users.roles o tabla separada.
        // Voy a asumir que puedo filtrar por roles->>'tutor' si es JSONB, o join con roles.
        // Como no tengo el esquema exacto de roles, voy a buscar usuarios que estén en la tabla de cronogramas como tutores, para asegurar que existan.
        // O mejor: SELECT * FROM users WHERE roles->>'tutor' = 'true' (si es el patrón comun)
        // Usaré DISTINCT de cronogramas para ir a la segura si no conozco la estructura de roles.

        const query = `
            SELECT DISTINCT u.id, CONCAT(u.first_name, ' ', u.last_name) as nombre
            FROM users u
            JOIN cronogramas c ON c.tutor_user_id = u.id
            ORDER BY nombre
        `;

        const { rows } = await pool.query(query);
        return res.json(rows);
    } catch (error) {
        console.error('Error getTutores:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

// HU-VER-04: Seguimiento tutor - DETALLE Y KPIS
// GET /api/verificador/tutores/:id/seguimiento?semestre=...
async function getSeguimientoTutor(req, res) {
    try {
        const { id } = req.params; // tutor_user_id
        const { semestre } = req.query;

        if (!semestre) {
            return res.status(400).json({ message: 'Semestre requerido' });
        }

        // KPIs
        const kpiQuery = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN estado = 'realizada' THEN 1 END) as realizadas,
                COUNT(CASE WHEN estado = 'programada' THEN 1 END) as pendientes
            FROM cronogramas
            WHERE tutor_user_id = $1 AND semestre = $2
        `;
        const kpiRes = await pool.query(kpiQuery, [id, semestre]);
        const kpis = kpiRes.rows[0];

        // Detalle
        const detalleQuery = `
            SELECT 
                CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS estudiante,
                c.fecha,
                c.tipo_tutoria AS tipo,
                c.estado
            FROM cronogramas c
            JOIN estudiante e ON e.codigo_estudiante = c.codigo_estudiante
            WHERE c.tutor_user_id = $1 AND c.semestre = $2
            ORDER BY c.fecha DESC
        `;
        const detalleRes = await pool.query(detalleQuery, [id, semestre]);

        return res.json({
            kpi: kpis,
            detalle: detalleRes.rows
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
    getSeguimientoTutor,
    getSchema
};
