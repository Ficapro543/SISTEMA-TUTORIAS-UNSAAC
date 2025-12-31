-- =====================================
-- PASO 2: INSERTAR USUARIOS
-- =====================================

-- 1. Administrador
INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    password_hash,
    roles,
    is_active,
    created_at
) VALUES (
    gen_random_uuid(),
    'Administrador',
    'General',
    'admin@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2', -- password: Contraseña1?
    ARRAY['administrador'],
    TRUE,
    NOW()
);

-- 2. Tutores
WITH nuevos_tutores AS (
    INSERT INTO users (
        id,
        first_name,
        last_name,
        email,
        password_hash,
        roles,
        is_active,
        created_at
    ) VALUES
    (
        gen_random_uuid(),
        'Carlos',
        'Gómez',
        'tutor1@unsaac.edu.pe',
        '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2', -- password: Contraseña1?
        ARRAY['tutor'],
        TRUE,
        NOW()
    ),
    (
        gen_random_uuid(),
        'Rosa',
        'Valdivia',
        'tutor2@unsaac.edu.pe',
        '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2', -- password: Contraseña1?
        ARRAY['tutor'],
        TRUE,
        NOW()
    ),
    (
        gen_random_uuid(),
        'Luis',
        'Fernández',
        'tutor3@unsaac.edu.pe',
        '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2', -- password: Contraseña1?
        ARRAY['tutor'],
        TRUE,
        NOW()
    ),
    (
        gen_random_uuid(),
        'María',
        'Rodríguez',
        'tutor4@unsaac.edu.pe',
        '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2', -- password: Contraseña1?
        ARRAY['tutor'],
        TRUE,
        NOW()
    ),
    (
        gen_random_uuid(),
        'Juan',
        'Pérez',
        'tutor5@unsaac.edu.pe',
        '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2', -- password: Contraseña1?
        ARRAY['tutor'],
        TRUE,
        NOW()
    )
    RETURNING id, email
)
-- Insertar en tabla tutores
INSERT INTO tutores (user_id, cubiculo)
SELECT 
    id,
    CASE 
        WHEN email = 'tutor1@unsaac.edu.pe' THEN 'Cubículo B-203'
        WHEN email = 'tutor2@unsaac.edu.pe' THEN 'Cubículo C-110'
        WHEN email = 'tutor3@unsaac.edu.pe' THEN 'Cubículo D-305'
        WHEN email = 'tutor4@unsaac.edu.pe' THEN 'Cubículo A-102'
        WHEN email = 'tutor5@unsaac.edu.pe' THEN 'Cubículo E-410'
    END
FROM nuevos_tutores;

-- 3. Evaluador
INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    password_hash,
    roles,
    is_active,
    created_at
) VALUES (
    gen_random_uuid(),
    'Evaluador',
    'General',
    'evaluador@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2', -- password: Contraseña1?
    ARRAY['evaluador'],
    TRUE,
    NOW()
);

-- =====================================
-- PASO 3: INSERTAR ESTUDIANTES
-- =====================================
INSERT INTO estudiante (codigo_estudiante, nombre_estudiante, apellido_estudiante) VALUES
('200101', 'Ana', 'Quispe'),
('200102', 'José', 'Huamán'),
('200103', 'Lucía', 'Ramos'),
('200104', 'Miguel', 'Condori'),
('200105', 'Elena', 'Torres'),
('200106', 'Bruno', 'Cáceres'),
('200107', 'Sofía', 'Mendoza'),
('200108', 'Ricardo', 'García'),
('200109', 'Carmen', 'López'),
('200110', 'Oscar', 'Silva'),
('200111', 'Patricia', 'Vargas'),
('200112', 'Daniel', 'Castro');

-- =====================================
-- PASO 4: CREAR ASIGNACIONES Y CRONOGRAMAS EN UN SOLO PASO
-- =====================================

-- Primero, obtener los IDs de los tutores
WITH tutor_ids AS (
    SELECT 
        u.id as tutor_user_id,
        u.email,
        ROW_NUMBER() OVER (ORDER BY u.email) as tutor_num
    FROM users u
    JOIN tutores t ON t.user_id = u.id
    WHERE 'tutor' = ANY(u.roles)
),
estudiantes_lista AS (
    SELECT 
        codigo_estudiante,
        ROW_NUMBER() OVER (ORDER BY codigo_estudiante) as est_num,
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY codigo_estudiante) <= 4 THEN '2025-I'
            WHEN ROW_NUMBER() OVER (ORDER BY codigo_estudiante) <= 8 THEN '2025-II'
            ELSE '2026-I'
        END as semestre_asignado
    FROM estudiante
),
-- Distribuir estudiantes entre tutores evitando duplicados por semestre
asignaciones_distribuidas AS (
    SELECT 
        ti.tutor_user_id,
        el.codigo_estudiante,
        el.semestre_asignado,
        ROW_NUMBER() OVER (PARTITION BY el.semestre_asignado, el.codigo_estudiante) as rn
    FROM tutor_ids ti
    CROSS JOIN estudiantes_lista el
    WHERE (ti.tutor_num + el.est_num) % 5 = (el.est_num % 5)  -- Distribución balanceada
),
asignaciones_completas AS (
    -- Crear asignaciones tutor-estudiante SIN DUPLICADOS
    INSERT INTO tutor_asignacion (
        tutor_user_id, 
        codigo_estudiante, 
        semestre,
        estado,
        fecha_asignacion
    )
    SELECT DISTINCT ON (ad.codigo_estudiante, ad.semestre_asignado)
        ad.tutor_user_id,
        ad.codigo_estudiante,
        ad.semestre_asignado,
        'activo',
        NOW() - INTERVAL '30 days' * RANDOM()
    FROM asignaciones_distribuidas ad
    WHERE ad.rn = 1  -- Solo la primera asignación por estudiante-semestre
    RETURNING 
        id as asignacion_id, 
        tutor_user_id, 
        codigo_estudiante, 
        semestre
)

-- Insertar cronogramas usando las asignaciones creadas
INSERT INTO cronogramas (
    tutor_user_id, 
    codigo_estudiante, 
    asignacion_id,
    fecha, 
    hora, 
    ambiente, 
    semestre,
    estado,
    created_at
)
SELECT 
    ac.tutor_user_id,
    ac.codigo_estudiante,
    ac.asignacion_id,
    
    -- Fecha: fechas pasadas para semestres pasados, futuras para futuros
    CASE ac.semestre
        WHEN '2025-I' THEN CURRENT_DATE - INTERVAL '1 month'
        WHEN '2025-II' THEN CURRENT_DATE - INTERVAL '15 days'
        ELSE CURRENT_DATE + INTERVAL '15 days'
    END +
    INTERVAL '1 day' * (s.num_sesion - 1) * 14 as fecha,
    
    -- Hora: necesita ser CAST a TIME
	CASE ((s.num_sesion + ROW_NUMBER() OVER (
	        PARTITION BY ac.tutor_user_id
	        ORDER BY ac.codigo_estudiante
	     )) % 4)
	    WHEN 0 THEN '09:00'::time
	    WHEN 1 THEN '11:00'::time
	    WHEN 2 THEN '14:00'::time
	    WHEN 3 THEN '16:00'::time
	END as hora,
    
    -- Ambiente
    CASE (s.num_sesion % 3)
        WHEN 0 THEN 'Sala Tutoría 1'
        WHEN 1 THEN 'Sala Tutoría 2'
        WHEN 2 THEN 'Sala Tutoría 3'
    END as ambiente,
    
    -- Semestre
    ac.semestre,
    
    -- Estado: si la fecha es en el pasado, es 'realizada', si es futura 'programada'
    CASE 
        WHEN ac.semestre IN ('2025-I', '2025-II') THEN 'realizada'
        ELSE 'programada'
    END as estado,
    
    -- Created_at
    NOW() - INTERVAL '10 days' * s.num_sesion
FROM asignaciones_completas ac
CROSS JOIN generate_series(1, 3) as s(num_sesion);

-- =====================================
-- PASO 5: INSERTAR TUTORÍAS PARA CRONOGRAMAS REALIZADOS
-- =====================================
WITH cronogramas_realizados AS (
    SELECT 
        c.id as cronograma_id,
        c.codigo_estudiante,
        ROW_NUMBER() OVER (ORDER BY c.created_at) as row_num
    FROM cronogramas c
    WHERE c.estado = 'realizada'
)
INSERT INTO tutorias (
    cronograma_id,
    obs_academico,
    obs_personal,
    obs_profesional,
    resumen_general,
    requiere_derivacion,
    modalidad,
    fecha_registro
)
SELECT 
    cr.cronograma_id,
    
    -- Observaciones académicas
    CASE (cr.row_num % 6)
        WHEN 0 THEN 'Excelente rendimiento en cursos básicos'
        WHEN 1 THEN 'Bajo rendimiento en cursos de especialidad'
        WHEN 2 THEN 'Progreso constante, necesita refuerzo en matemáticas'
        WHEN 3 THEN 'Dificultades con metodología de estudio'
        WHEN 4 THEN 'Buen desempeño, pero con altibajos'
        WHEN 5 THEN 'Necesita mejorar asistencia a clases'
    END,
    
    -- Observaciones personales
    CASE (cr.row_num % 5)
        WHEN 0 THEN 'Buena adaptación, sociable'
        WHEN 1 THEN 'Problemas de adaptación, tímido'
        WHEN 2 THEN 'Equilibrado emocionalmente'
        WHEN 3 THEN 'Muestra signos de estrés académico'
        WHEN 4 THEN 'Motivado pero con baja autoestima'
    END,
    
    -- Observaciones profesionales
    CASE (cr.row_num % 4)
        WHEN 0 THEN 'Interés definido en investigación'
        WHEN 1 THEN 'Vocación hacia la docencia'
        WHEN 2 THEN 'Interés en emprendimiento tecnológico'
        WHEN 3 THEN 'Sin claridad vocacional'
    END,
    
    -- Resumen general
    CASE (cr.row_num % 3)
        WHEN 0 THEN 'Se acordó plan de refuerzo académico semanal'
        WHEN 1 THEN 'Se recomienda seguimiento psicológico'
        WHEN 2 THEN 'Se definieron metas académicas para el semestre'
    END,
    
    -- ¿Requiere derivación?
    (cr.row_num % 5) = 0,  -- 20% requieren derivación
    
    -- Modalidad
    CASE (cr.row_num % 3)
        WHEN 0 THEN 'Asignada'
        WHEN 1 THEN 'Virtual'
        WHEN 2 THEN 'Presencial'
    END,
    
    NOW() - INTERVAL '7 days' * RANDOM()
FROM cronogramas_realizados cr;

-- =====================================
-- PASO 6: INSERTAR DERIVACIONES
-- =====================================
WITH tutorias_con_derivacion AS (
    SELECT 
        t.id as tutoria_id,
        t.cronograma_id,
        ROW_NUMBER() OVER (ORDER BY t.fecha_registro) as row_num
    FROM tutorias t
    WHERE t.requiere_derivacion = TRUE
)
INSERT INTO derivaciones (
    tutoria_id,
    especialidad,
    motivo,
    fecha_derivacion
)
SELECT 
    tcd.tutoria_id,
    
    CASE (tcd.row_num % 4)
        WHEN 0 THEN 'Psicología'
        WHEN 1 THEN 'Orientación Vocacional'
        WHEN 2 THEN 'Apoyo Académico'
        WHEN 3 THEN 'Bienestar Estudiantil'
    END,
    
    CASE (tcd.row_num % 4)
        WHEN 0 THEN 'Dificultades de adaptación universitaria y manejo de estrés'
        WHEN 1 THEN 'Necesita definir línea profesional acorde a sus intereses'
        WHEN 2 THEN 'Refuerzo académico en cursos específicos'
        WHEN 3 THEN 'Problemas económicos afectando rendimiento académico'
    END,
    
    NOW() - INTERVAL '5 days' * RANDOM()
FROM tutorias_con_derivacion tcd;


-- =====================================
-- PASO 8: VERIFICAR DATOS INSERTADOS
-- =====================================
SELECT '=== RESUMEN DE DATOS INSERTADOS ===' as info;

SELECT 'Usuarios totales:' as tipo, COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'Estudiantes:', COUNT(*) FROM estudiante
UNION ALL
SELECT 'Asignaciones activas:', COUNT(*) FROM tutor_asignacion WHERE estado = 'activo'
UNION ALL
SELECT 'Cronogramas totales:', COUNT(*) FROM cronogramas
UNION ALL
SELECT 'Tutorías registradas:', COUNT(*) FROM tutorias
UNION ALL
SELECT 'Derivaciones:', COUNT(*) FROM derivaciones
UNION ALL
SELECT 'Registros pendientes:', COUNT(*) FROM pending_users;

-- Verificar que todas las asignaciones tengan cronogramas
SELECT '=== VERIFICACIÓN DE INTEGRIDAD ===' as info;

SELECT 
    'Asignaciones sin cronogramas:' as verificación,
    COUNT(DISTINCT ta.id) as cantidad
FROM tutor_asignacion ta
LEFT JOIN cronogramas c ON c.asignacion_id = ta.id
WHERE c.id IS NULL;

SELECT 
    'Cronogramas sin asignación válida:' as verificación,
    COUNT(*) as cantidad
FROM cronogramas c
WHERE NOT EXISTS (
    SELECT 1 
    FROM tutor_asignacion ta 
    WHERE ta.id = c.asignacion_id 
    AND ta.estado = 'activo'
    AND ta.semestre = c.semestre
);

-- Mostrar ejemplo de datos
SELECT '=== EJEMPLO DE DATOS ===' as info;

SELECT 
    u.first_name || ' ' || u.last_name as tutor,
    e.nombre_estudiante || ' ' || e.apellido_estudiante as estudiante,
    ta.semestre,
    COUNT(c.id) as sesiones_programadas,
    SUM(CASE WHEN c.estado = 'realizada' THEN 1 ELSE 0 END) as sesiones_realizadas
FROM tutor_asignacion ta
JOIN users u ON u.id = ta.tutor_user_id
JOIN estudiante e ON e.codigo_estudiante = ta.codigo_estudiante
LEFT JOIN cronogramas c ON c.asignacion_id = ta.id
GROUP BY u.first_name, u.last_name, e.nombre_estudiante, e.apellido_estudiante, ta.semestre
ORDER BY tutor, estudiante
LIMIT 5;*/

/*
-- =====================================
-- 1. Insertar estudiantes nuevos (nombres/apellidos repetidos)
-- =====================================
INSERT INTO estudiante (codigo_estudiante, nombre_estudiante, apellido_estudiante)
VALUES
('200113', 'Ana', 'Rodriguez'),
('200114', 'José', 'Pérez'),
('200115', 'Lucía', 'Torres'),
('200116', 'Miguel', 'Huamán'),
('200117', 'Elena', 'Ramos'),
('200118', 'Bruno', 'Valdivia'),
('200119', 'Sofía', 'Fernández'),
('200120', 'Ricardo', 'Silva');

-- =====================================
-- 2. Crear asignaciones y cronogramas
-- =====================================
WITH tutor_ids AS (
    SELECT 
        u.id as tutor_user_id,
        u.email,
        ROW_NUMBER() OVER (ORDER BY u.email) as tutor_num
    FROM users u
    JOIN tutores t ON t.user_id = u.id
    WHERE 'tutor' = ANY(u.roles)
),
estudiantes_nuevos AS (
    SELECT 
        codigo_estudiante,
        ROW_NUMBER() OVER (ORDER BY codigo_estudiante) as est_num,
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY codigo_estudiante) <= 4 THEN '2025-I'
            ELSE '2025-II'
        END as semestre_asignado
    FROM estudiante
    WHERE codigo_estudiante >= '200113'
),
asignaciones_distribuidas AS (
    SELECT 
        ti.tutor_user_id,
        en.codigo_estudiante,
        en.semestre_asignado,
        ROW_NUMBER() OVER (PARTITION BY en.semestre_asignado, en.codigo_estudiante) as rn
    FROM tutor_ids ti
    CROSS JOIN estudiantes_nuevos en
    WHERE (ti.tutor_num + en.est_num) % 5 = (en.est_num % 5)
),
asignaciones_completas AS (
    INSERT INTO tutor_asignacion (
        tutor_user_id, 
        codigo_estudiante, 
        semestre,
        estado,
        fecha_asignacion
    )
    SELECT DISTINCT ON (ad.codigo_estudiante, ad.semestre_asignado)
        ad.tutor_user_id,
        ad.codigo_estudiante,
        ad.semestre_asignado,
        'activo',
        NOW() - INTERVAL '30 days' * RANDOM()
    FROM asignaciones_distribuidas ad
    WHERE ad.rn = 1
    RETURNING id as asignacion_id, tutor_user_id, codigo_estudiante, semestre
)
INSERT INTO cronogramas (
    tutor_user_id, 
    codigo_estudiante, 
    asignacion_id,
    fecha, 
    hora, 
    ambiente, 
    semestre,
    estado,
    created_at
)
SELECT 
    ac.tutor_user_id,
    ac.codigo_estudiante,
    ac.asignacion_id,
    CURRENT_DATE - INTERVAL '15 days' + INTERVAL '1 day' * (s.num_sesion - 1) * 14 as fecha,
    
    -- Hora modificada para evitar duplicados
    '09:00'::time + (INTERVAL '1 hour' * ((ROW_NUMBER() OVER (
        PARTITION BY ac.tutor_user_id, CURRENT_DATE - INTERVAL '15 days' + INTERVAL '1 day' * (s.num_sesion - 1) * 14
        ORDER BY ac.codigo_estudiante
    ) - 1) % 8)) as hora,
    
    CASE (s.num_sesion % 3)
        WHEN 0 THEN 'Sala Tutoría 1'
        WHEN 1 THEN 'Sala Tutoría 2'
        WHEN 2 THEN 'Sala Tutoría 3'
    END as ambiente,
    ac.semestre,
    'realizada' as estado,
    NOW() - INTERVAL '10 days' * s.num_sesion
FROM asignaciones_completas ac
CROSS JOIN generate_series(1, 3) as s(num_sesion);

-- =====================================
-- 3. Insertar tutorías para estos cronogramas
-- =====================================
WITH cronogramas_realizados AS (
    SELECT 
        c.id as cronograma_id,
        ROW_NUMBER() OVER (ORDER BY c.created_at) as row_num
    FROM cronogramas c
    WHERE c.estado = 'realizada'
      AND c.codigo_estudiante >= '200113'
)
INSERT INTO tutorias (
    cronograma_id,
    obs_academico,
    obs_personal,
    obs_profesional,
    resumen_general,
    requiere_derivacion,
    modalidad,
    fecha_registro
)
SELECT 
    cr.cronograma_id,
    CASE (cr.row_num % 6)
        WHEN 0 THEN 'Excelente rendimiento en cursos básicos'
        WHEN 1 THEN 'Bajo rendimiento en cursos de especialidad'
        WHEN 2 THEN 'Progreso constante, necesita refuerzo en matemáticas'
        WHEN 3 THEN 'Dificultades con metodología de estudio'
        WHEN 4 THEN 'Buen desempeño, pero con altibajos'
        WHEN 5 THEN 'Necesita mejorar asistencia a clases'
    END,
    CASE (cr.row_num % 5)
        WHEN 0 THEN 'Buena adaptación, sociable'
        WHEN 1 THEN 'Problemas de adaptación, tímido'
        WHEN 2 THEN 'Equilibrado emocionalmente'
        WHEN 3 THEN 'Muestra signos de estrés académico'
        WHEN 4 THEN 'Motivado pero con baja autoestima'
    END,
    CASE (cr.row_num % 4)
        WHEN 0 THEN 'Interés definido en investigación'
        WHEN 1 THEN 'Vocación hacia la docencia'
        WHEN 2 THEN 'Interés en emprendimiento tecnológico'
        WHEN 3 THEN 'Sin claridad vocacional'
    END,
    CASE (cr.row_num % 3)
        WHEN 0 THEN 'Se acordó plan de refuerzo académico semanal'
        WHEN 1 THEN 'Se recomienda seguimiento psicológico'
        WHEN 2 THEN 'Se definieron metas académicas para el semestre'
    END,
    (cr.row_num % 5) = 0,
    CASE (cr.row_num % 3)
        WHEN 0 THEN 'Asignada'
        WHEN 1 THEN 'Virtual'
        WHEN 2 THEN 'Presencial'
    END,
    NOW() - INTERVAL '7 days' * RANDOM()
FROM cronogramas_realizados cr;
