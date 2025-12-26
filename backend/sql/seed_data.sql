-- =====================================
-- USUARIO ADMINISTRADOR
-- =====================================
INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    password_hash,
    roles,
    is_active
) VALUES (
    gen_random_uuid(),
    'Administrador',
    'General',
    'admin@unsaac.edu.pe',
    '$2b$10$wH3gL0N0Y0Fz8E1c4a3p1OZzHqW6F8pJrZ9m7Qk1L0fUuFZ6zYy3K',
    ARRAY['administrador'],
    TRUE
);

-- =====================================
-- USUARIOS TUTORES
-- =====================================
INSERT INTO users (
    id, first_name, last_name, email, password_hash, roles, is_active
) VALUES
(
    gen_random_uuid(),
    'Carlos',
    'Gómez',
    'tutor1@unsaac.edu.pe',
    '$2b$10$wH3gL0N0Y0Fz8E1c4a3p1OZzHqW6F8pJrZ9m7Qk1L0fUuFZ6zYy3K',
    ARRAY['tutor'],
    TRUE
),
(
    gen_random_uuid(),
    'Rosa',
    'Valdivia',
    'tutor2@unsaac.edu.pe',
    '$2b$10$wH3gL0N0Y0Fz8E1c4a3p1OZzHqW6F8pJrZ9m7Qk1L0fUuFZ6zYy3K',
    ARRAY['tutor'],
    TRUE
);

-- =====================================
-- TABLA TUTORES
-- =====================================
INSERT INTO tutores (user_id, cubiculo)
SELECT id, 'Cubículo B-203'
FROM users
WHERE email = 'tutor1@unsaac.edu.pe';

INSERT INTO tutores (user_id, cubiculo)
SELECT id, 'Cubículo C-110'
FROM users
WHERE email = 'tutor2@unsaac.edu.pe';

-- =====================================
-- ESTUDIANTES
-- =====================================
INSERT INTO estudiante (codigo_estudiante, nombre_estudiante, apellido_estudiante) VALUES
('200101', 'Ana', 'Quispe'),
('200102', 'José', 'Huamán'),
('200103', 'Lucía', 'Ramos'),
('200104', 'Miguel', 'Condori'),
('200105', 'Elena', 'Torres'),
('200106', 'Bruno', 'Cáceres');

-- =====================================
-- ASIGNACIONES TUTOR - ESTUDIANTE
-- =====================================
INSERT INTO tutor_asignacion (tutor_user_id, codigo_estudiante, semestre)
SELECT t.user_id, '200101', '2025-I'
FROM tutores t JOIN users u ON u.id = t.user_id
WHERE u.email = 'tutor1@unsaac.edu.pe';

INSERT INTO tutor_asignacion (tutor_user_id, codigo_estudiante, semestre)
SELECT t.user_id, '200102', '2025-I'
FROM tutores t JOIN users u ON u.id = t.user_id
WHERE u.email = 'tutor1@unsaac.edu.pe';

INSERT INTO tutor_asignacion (tutor_user_id, codigo_estudiante, semestre)
SELECT t.user_id, '200103', '2025-I'
FROM tutores t JOIN users u ON u.id = t.user_id
WHERE u.email = 'tutor2@unsaac.edu.pe';

-- =====================================
-- CRONOGRAMAS 
-- =====================================
INSERT INTO cronogramas (
    tutor_user_id, codigo_estudiante, fecha, hora, ambiente, semestre
)
SELECT t.user_id, '200101', CURRENT_DATE + INTERVAL '1 day', '09:00', 'Sala Tutoría 1', '2025-I'
FROM tutores t JOIN users u ON u.id = t.user_id
WHERE u.email = 'tutor1@unsaac.edu.pe';

INSERT INTO cronogramas (
    tutor_user_id, codigo_estudiante, fecha, hora, ambiente, semestre
)
SELECT t.user_id, '200102', CURRENT_DATE + INTERVAL '2 days', '10:30', 'Sala Tutoría 1', '2025-I'
FROM tutores t JOIN users u ON u.id = t.user_id
WHERE u.email = 'tutor1@unsaac.edu.pe';

INSERT INTO cronogramas (
    tutor_user_id, codigo_estudiante, fecha, hora, ambiente, semestre
)
SELECT t.user_id, '200103', CURRENT_DATE + INTERVAL '3 days', '11:00', 'Sala Tutoría 2', '2025-I'
FROM tutores t JOIN users u ON u.id = t.user_id
WHERE u.email = 'tutor2@unsaac.edu.pe';

-- =====================================
-- TUTORÍAS
-- =====================================
INSERT INTO tutorias (
    cronograma_id,
    obs_academico,
    obs_personal,
    obs_profesional,
    resumen_general,
    modalidad
)
SELECT
    c.id,
    'Bajo rendimiento en cursos básicos',
    'Buena disposición al diálogo',
    'Interés en prácticas tempranas',
    'Se definió plan de refuerzo académico',
    'Asignada'
FROM cronogramas c
WHERE c.codigo_estudiante = '200101';

INSERT INTO tutorias (
    cronograma_id,
    obs_academico,
    obs_personal,
    obs_profesional,
    resumen_general,
    modalidad
)
SELECT
    c.id,
    'Desempeño regular',
    'Problemas de adaptación',
    'Sin claridad vocacional',
    'Se recomienda seguimiento psicológico',
    'Asignada'
FROM cronogramas c
WHERE c.codigo_estudiante = '200103';

-- =====================================
-- DERIVACIONES
-- =====================================
INSERT INTO derivaciones (
    tutoria_id,
    especialidad,
    motivo
)
SELECT
    t.id,
    'Psicología',
    'Dificultades de adaptación universitaria'
FROM tutorias t
ORDER BY t.fecha_registro
LIMIT 1;

INSERT INTO derivaciones (
    tutoria_id,
    especialidad,
    motivo
)
SELECT
    t.id,
    'Orientación Vocacional',
    'Definir línea profesional acorde a intereses'
FROM tutorias t
ORDER BY t.fecha_registro
OFFSET 1
LIMIT 1;