const pool = require('../db/pool');

// GET /api/verificador/estudiantes?semestre=2025-2&estado=Atendido|Pendiente
async function getEstudiantesPorSemestreEstado(req, res) {
    try {
        const { semestre, estado } = req.query;

        if (!semestre) {
            return res.status(400).json({ message: 'El parámetro "semestre" es obligatorio.' });
        }

        // Mapear "Atendido/Pendiente" a estados reales de cronogramas
        let estadoDB = null;
        if (estado) {
            const est = estado.toLowerCase();
            if (est === 'atendido') estadoDB = 'realizada';
            else if (est === 'pendiente') estadoDB = 'programada';
            else return res.status(400).json({ message: 'Estado inválido. Usa Atendido o Pendiente.' });
        }

        const params = [semestre];
        let whereEstado = '';

        if (estadoDB) {
            params.push(estadoDB);
            whereEstado = `AND c.estado = $2`;
        }

        const query = `
      SELECT DISTINCT ON (c.codigo_estudiante)
        c.codigo_estudiante AS codigo,
        CONCAT(e.nombre_estudiante, ' ', e.apellido_estudiante) AS nombre,
        (c.fecha + c.hora) AS fecha_atencion,
        CONCAT(u.first_name, ' ', u.last_name) AS tutor_responsable,
        c.estado
      FROM cronogramas c
      JOIN estudiante e ON e.codigo_estudiante = c.codigo_estudiante
      JOIN users u ON u.id = c.tutor_user_id
      WHERE c.semestre = $1
        ${whereEstado}
      ORDER BY c.codigo_estudiante, (c.fecha + c.hora) DESC;
    `;

        const { rows } = await pool.query(query, params);
        return res.json(rows);
    } catch (error) {
        console.error('Error getEstudiantesPorSemestreEstado:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

module.exports = { getEstudiantesPorSemestreEstado };
