-- =====================================
-- PASO 2: INSERTAR USUARIOS
-- =====================================
-- ===============================================================================================
-- SEED DATA - SISTEMA DE TUTORÍAS UNSAAC
-- ===============================================================================================
-- Descripción: Script de carga masiva de datos de prueba coherentes y realistas.
-- Contiene: 80 usuarios, 200 estudiantes, 25 tutores, 400 asignaciones, 800 cronogramas, 500 tutorías.
-- Autor: Generado por Antigravity
-- ===============================================================================================

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

-- 7. INSERTAR CRONOGRAMAS
-- ===============================================================================================
-- 800 cronogramas distribuidos.
-- Fechas calculadas en base al semestre.
INSERT INTO cronogramas (tutor_user_id, codigo_estudiante, asignacion_id, fecha, hora, ambiente, semestre, estado, created_at)
SELECT 
    ta.tutor_user_id,
    ta.codigo_estudiante,
    ta.id,
    CASE ta.semestre
        WHEN '2023-I' THEN '2023-04-01'::date + (i * 15)
        WHEN '2023-II' THEN '2023-09-01'::date + (i * 15)
        WHEN '2024-I' THEN '2024-04-01'::date + (i * 15)
        WHEN '2024-II' THEN '2024-09-01'::date + (i * 15) -- Actual
        WHEN '2025-I' THEN '2025-04-01'::date + (i * 15) -- Futuro
    END,
    CASE (i % 5)
        WHEN 0 THEN '08:00:00'::time
        WHEN 1 THEN '10:00:00'::time
        WHEN 2 THEN '14:00:00'::time
        WHEN 3 THEN '16:00:00'::time
        ELSE '18:00:00'::time
    END,
    CASE (i % 7)
        WHEN 0 THEN 'A-201' 
        WHEN 1 THEN 'B-305' 
        WHEN 2 THEN 'C-102' 
        WHEN 3 THEN 'D-405'
        WHEN 4 THEN 'Laboratorio 3' 
        WHEN 5 THEN 'Sala Tutores 1'
        ELSE 'Virtual'
    END,
    ta.semestre,
    CASE 
        WHEN ta.semestre IN ('2023-I', '2023-II', '2024-I') THEN 'realizada'
        WHEN ta.semestre = '2024-II' AND i < 3 THEN 'realizada'
        WHEN ta.semestre = '2024-II' AND i >= 3 THEN 'programada'
        ELSE 'programada'
    END, -- Estado inicial
    NOW() - interval '1 day' * i
FROM tutor_asignacion ta
CROSS JOIN generate_series(1, 2) AS i -- 2 cronogramas por asignación
WHERE ta.semestre != '2025-I' OR i = 1; -- Menos cronogramas para futuro

-- Actualizar algunos a cancelados
UPDATE cronogramas SET estado = 'cancelada' 
WHERE id IN (SELECT id FROM cronogramas WHERE estado = 'programada' LIMIT 50);

-- 8. INSERTAR TUTORÍAS (Detalle de sesiones realizadas)
-- ===============================================================================================
INSERT INTO tutorias (cronograma_id, obs_academico, obs_personal, obs_profesional, resumen_general, requiere_derivacion, modalidad, fecha_registro)
SELECT 
    c.id,
    'El estudiante muestra ' || CASE (row_number() OVER() % 3) WHEN 0 THEN 'buen' WHEN 1 THEN 'regular' ELSE 'bajo' END || ' rendimiento en cursos de especialidad.',
    'Se observa ' || CASE (row_number() OVER() % 4) WHEN 0 THEN 'estabilidad emocional' WHEN 1 THEN 'estrés moderado' WHEN 2 THEN 'problemas familiares' ELSE 'buena adaptación' END,
    'Interés en área de ' || CASE (row_number() OVER() % 3) WHEN 0 THEN 'desarrollo de software' WHEN 1 THEN 'gestión de proyectos' ELSE 'investigación' END,
    'Sesión completada con acuerdos de mejora.',
    CASE WHEN (row_number() OVER() % 4) = 0 THEN TRUE ELSE FALSE END, -- 25% derivación
    CASE WHEN c.ambiente = 'Virtual' THEN 'Virtual' ELSE 'Presencial' END,
    c.fecha + c.hora
FROM cronogramas c
WHERE c.estado = 'realizada';

-- 9. INSERTAR DERIVACIONES
-- ===============================================================================================
INSERT INTO derivaciones (tutoria_id, especialidad, motivo, fecha_derivacion)
SELECT 
    t.id,
    CASE (row_number() OVER() % 4)
        WHEN 0 THEN 'Psicopedagogía'
        WHEN 1 THEN 'Bienestar Social'
        WHEN 2 THEN 'Clínica Médica'
        ELSE 'Tutoría Especializada'
    END,
    'Se requiere evaluación externa por motivos detectados en sesión.',
    t.fecha_registro + interval '1 hour'
FROM tutorias t
WHERE t.requiere_derivacion = TRUE
LIMIT 80;

-- 11. ACTUALIZACIÓN FINAL DE ESTADOS DE ASIGNACIÓN
-- ===============================================================================================
-- Actualizamos a 'finalizado' las asignaciones de semestres pasados para cumplir requisitos.
-- Hacemos esto AL FINAL para no bloquear la inserción de cronogramas previos (por el trigger).
UPDATE tutor_asignacion 
SET estado = 'finalizado' 
WHERE semestre IN ('2023-I', '2023-II', '2024-I');

-- ===============================================================================================
-- FIN DEL SEED - VERIFICACIÓN OPCIONAL
-- ===============================================================================================
-- SELECT 'users' as tabla, COUNT(*) as cantidad FROM users UNION ALL
-- SELECT 'estudiante', COUNT(*) FROM estudiante UNION ALL
-- SELECT 'tutores', COUNT(*) FROM tutores UNION ALL
-- SELECT 'tutor_asignacion', COUNT(*) FROM tutor_asignacion UNION ALL
-- SELECT 'cronogramas', COUNT(*) FROM cronogramas UNION ALL
-- SELECT 'tutorias', COUNT(*) FROM tutorias UNION ALL
-- SELECT 'derivaciones', COUNT(*) FROM derivaciones;