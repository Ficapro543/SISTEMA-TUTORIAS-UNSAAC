-- 1. LIMPIAR TODAS LAS TABLAS (Orden inverso de dependencias)
-- ===============================================================================================
DELETE FROM derivaciones;
DELETE FROM tutorias;
DELETE FROM cronogramas;
DELETE FROM tutor_asignacion;
DELETE FROM tutores;
DELETE FROM estudiante;
DELETE FROM password_reset_tokens;
DELETE FROM activation_tokens;
DELETE FROM refresh_tokens;
DELETE FROM pending_users;
DELETE FROM users;

-- 2. INSERTAR USUARIOS (USERS)
-- ===============================================================================================
-- Se insertan 80 usuarios distribuidos en roles.
-- Password fijo para todos: password123 ($2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2)

-- ADMINISTRADOR el más chero
INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Rayneld Fidel',
    'Castro Pari',
    '231865@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2',
    ARRAY['administador', 'evaluador', 'tutor'],
    BOOLEAN 'true',
    NOW()
);

-- Gente de solo tutor
INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Eleuteria',
    'Quispe Chaiña',
    'eleuteria.quispe@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2',
    ARRAY['tutor'],
    BOOLEAN 'true',
    NOW()
);

INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Juana Beatriz',
    'Mamani Huaman',
    'juana.mamani@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2',
    ARRAY['tutor'],
    BOOLEAN 'true',
    NOW()
);

INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Franchesca Claudia',
    'Medina Miranda',
    'franchesca.medina@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2',
    ARRAY['tutor'],
    BOOLEAN 'true',
    NOW()
);

INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Sofia Anacleta',
    'Admunsen De La Riva Agüero',
    'sofia.admunsen@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2',
    ARRAY['tutor'],
    BOOLEAN 'true',
    NOW()
);

INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Diego',
    'Alanis Rojas',
    'diego.alanis@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2',
    ARRAY['tutor'],
    BOOLEAN 'true',
    NOW()
);

INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Valeria',
    'Montes Quispe',
    'valeria.montes@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2',
    ARRAY['tutor'],
    BOOLEAN 'true',
    NOW()
);

INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Sebastián',
    'Solís Huamán',
    'sebastian.solis@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2',
    ARRAY['tutor'],
    BOOLEAN 'true',
    NOW()
);

INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Mateo',
    'Rentería Paredes',
    'mateo.renteria@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2',
    ARRAY['tutor'],
    BOOLEAN 'true',
    NOW()
);

INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Luciana',
    'Esteban Cornejo',
    'luciana.esteban@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2',
    ARRAY['tutor'],
    BOOLEAN 'true',
    NOW()
);

INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Rodrigo',
    'Trump Paredes',
    'rodrigo.trump@unsaac.edu.pe',
    '$2b$10$IBJekPk8BR4mk4zgiZZz8.pMKo.Na92dk3s3KEcXAcir17wTnRAo2',
    ARRAY['evaluador', 'tutor'],
    BOOLEAN 'true',
    NOW()
);

-- 4. INSERTAR DATOS DEL PERFIL ESTUDIANTE (ESTUDIANTE)
-- ===============================================================================================
-- 200 Estudiantes registrados en el sistema (aunque solo 45 tengan usuario activo)
INSERT INTO estudiante (codigo_estudiante, nombre_estudiante, apellido_estudiante)
SELECT 
    '2023' || lpad(i::text, 5, '0'),
    nombres[1 + (i % array_length(nombres, 1))],
    apellidos[1 + (i % array_length(apellidos, 1))] || ' ' || apellidos[1 + ((i+1) % array_length(apellidos, 1))]
FROM generate_series(1, 200) AS i,
(SELECT ARRAY['Gabriela','Daniel','Andrea','Sebastián','Camila','Matias','Valeria','Alejandro','Paula','Lucas','Mariana','Joaquín','Ximena','Nicolás','Valentina','Bruno','Renato','Fabiola','Ricardo','Adriana'] AS nombres,
        ARRAY['Condori','Cáceres','Pérez','Salazar','Gutiérrez', 'Paredes','Morales','Delgado','Aguilar','Romero','Solis','Vega','Peña','Cabrera','Campos','Fuentes','Carrasco','Bernal'] AS apellidos) AS data;

-- 5. INSERTAR PERFIL DE TUTORES (TUTORES)
-- ===============================================================================================
-- Se vinculan los usuarios con rol 'tutor' a la tabla tutores
INSERT INTO tutores (user_id, cubiculo)
SELECT 
    id,
    CASE ((row_number() OVER (ORDER BY created_at)) % 5)
        WHEN 0 THEN 'C-101'
        WHEN 1 THEN 'D-205'
        WHEN 2 THEN 'E-303'
        WHEN 3 THEN 'F-107'
        ELSE 'G-209'
    END
FROM users 
WHERE 'tutor' = ANY(roles);

-- 6. INSERTAR ASIGNACIONES DE TUTORÍA (TUTOR_ASIGNACION)
-- ===============================================================================================
-- NOTA: Insertamos 'activo' por defecto para evitar bloqueos de triggers al insertar cronogramas,
-- luego validaremos/actualizaremos estados.
-- Distribución: 
-- Semestres pasados (2023-I, 2023-II, 2024-I) -> Serán finalizados
-- Semestre actual (2024-II) -> Serán activos
-- Semestre futuro (2025-I) -> Serán activos

WITH teacher_rows AS (
    SELECT user_id, row_number() OVER (ORDER BY user_id) as rn FROM tutores
),
student_rows AS (
    SELECT codigo_estudiante, row_number() OVER (ORDER BY codigo_estudiante) as rn FROM estudiante
),
semestres AS (
    SELECT unnest(ARRAY['2023-I', '2023-II', '2024-I', '2024-II', '2025-I']) as sem
)
INSERT INTO tutor_asignacion (tutor_user_id, codigo_estudiante, semestre, estado, fecha_asignacion)
SELECT 
    t.user_id,
    s.codigo_estudiante,
    sem.sem,
    'activo', -- Se inserta como activo para permitir creación de cronogramas
    CASE sem.sem
        WHEN '2023-I' THEN '2023-03-15 08:00:00'::timestamp
        WHEN '2023-II' THEN '2023-08-15 08:00:00'::timestamp
        WHEN '2024-I' THEN '2024-03-15 08:00:00'::timestamp
        WHEN '2024-II' THEN '2024-08-15 08:00:00'::timestamp
        WHEN '2025-I' THEN '2025-03-15 08:00:00'::timestamp
    END + (random() * interval '5 days')
FROM teacher_rows t
JOIN student_rows s ON (s.rn % 25) + 1 = t.rn -- Distribución determinística
CROSS JOIN semestres sem
WHERE 
    -- Filtros para controlar cantidad (aprox 400 asignaciones)
    -- Solo asignamos a ciertos estudiantes en ciertos semestres para variar
    (s.rn + length(sem.sem)) % 2 = 0 -- 50% de combinaciones posibles
    AND s.rn <= 160; -- Limitar a primeros 160 estudiantes para dejar algunos libres

-- =========================
-- 7. INSERTAR CRONOGRAMAS (DISTRIBUIDO ENTRE TUTORES)
-- =========================

WITH base AS (
    SELECT
        ta.id AS asignacion_id,
        ta.tutor_user_id,
        ta.codigo_estudiante,
        ta.semestre,
        row_number() OVER (
            PARTITION BY ta.tutor_user_id, ta.semestre
            ORDER BY ta.codigo_estudiante
        ) AS slot
    FROM tutor_asignacion ta
),
fechas_por_semestre AS (
    SELECT '2023-I'  AS semestre, DATE '2023-04-01' AS fecha_base UNION ALL
    SELECT '2023-II', DATE '2023-09-01' UNION ALL
    SELECT '2024-I',  DATE '2024-04-01' UNION ALL
    SELECT '2024-II', DATE '2024-09-01' UNION ALL
    SELECT '2025-I',  DATE '2025-04-01'
)
INSERT INTO cronogramas (
    tutor_user_id,
    codigo_estudiante,
    asignacion_id,
    fecha,
    hora,
    ambiente,
    semestre,
    estado
)
SELECT
    b.tutor_user_id,
    b.codigo_estudiante,
    b.asignacion_id,

    -- Fecha: cada tutor tiene su propio calendario
    f.fecha_base
        + (((b.slot - 1) / 5) * INTERVAL '1 day')
        + ((dense_rank() OVER (ORDER BY b.tutor_user_id) - 1) * INTERVAL '30 days'),

    -- Hora: slots únicos POR TUTOR
    TIME '08:00' + ((b.slot - 1) % 8) * INTERVAL '1 hour',

    -- Ambiente: no colisiona globalmente
    'Aula ' || (
        100
        + ((dense_rank() OVER (ORDER BY b.tutor_user_id) - 1) * 10)
        + ((b.slot - 1) % 10)
    ),

    b.semestre,
    'programada'
FROM base b
JOIN fechas_por_semestre f
  ON f.semestre = b.semestre;

-- =========================
-- 8. TUTORIAS
-- =========================

INSERT INTO tutorias (
    cronograma_id,
    obs_academico,
    obs_personal,
    obs_profesional,
    resumen_general,
    requiere_derivacion,
    modalidad
)
SELECT
    c.id,
    'Avance académico satisfactorio',
    CASE WHEN random() < 0.3 THEN 'Problemas familiares leves' END,
    CASE WHEN random() < 0.2 THEN 'Orientación vocacional requerida' END,
    'Sesión realizada con participación activa del estudiante',
    random() < 0.25,
    CASE WHEN random() < 0.5 THEN 'Presencial' ELSE 'Virtual' END
FROM cronogramas c
ORDER BY random()
LIMIT 500;

-- =========================
-- 9. DERIVACIONES
-- =========================

INSERT INTO derivaciones (
    tutoria_id,
    especialidad,
    motivo
)
SELECT
    t.id,
    CASE
        WHEN random() < 0.4 THEN 'Psicología'
        WHEN random() < 0.7 THEN 'Trabajo Social'
        ELSE 'Orientación Académica'
    END,
    'Se recomienda evaluación especializada'
FROM tutorias t
WHERE t.requiere_derivacion = TRUE;