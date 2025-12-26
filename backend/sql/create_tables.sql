CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS pending_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    roles TEXT[] NOT NULL,
    roles_decisiones JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    roles TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE activation_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP
);

-- Tabla para códigos de recuperación
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tutores (
    user_id UUID PRIMARY KEY,
    cubiculo VARCHAR(50),

    CONSTRAINT fk_tutores_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS estudiante (
    codigo_estudiante VARCHAR(20) PRIMARY KEY,
    nombre_estudiante VARCHAR(100) NOT NULL,
    apellido_estudiante VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS tutor_asignacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tutor_user_id UUID NOT NULL,
    codigo_estudiante VARCHAR(20) NOT NULL,
    semestre VARCHAR(10) NOT NULL,

    estado TEXT NOT NULL DEFAULT 'activo',
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT now(),
    fecha_fin TIMESTAMP,

    CONSTRAINT chk_estado_asignacion
        CHECK (estado IN ('activo', 'finalizado')),

    CONSTRAINT fk_asignacion_tutor
        FOREIGN KEY (tutor_user_id)
        REFERENCES tutores(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_asignacion_estudiante
        FOREIGN KEY (codigo_estudiante)
        REFERENCES estudiante(codigo_estudiante)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_asignacion_activa
ON tutor_asignacion (codigo_estudiante, semestre)
WHERE estado = 'activo';

CREATE TABLE IF NOT EXISTS cronogramas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tutor_user_id UUID NOT NULL,
    codigo_estudiante VARCHAR(20) NOT NULL,

    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    ambiente VARCHAR(100),

    semestre VARCHAR(10) NOT NULL,
    estado TEXT NOT NULL DEFAULT 'programada',

    created_at TIMESTAMP DEFAULT now(),

    CONSTRAINT chk_estado_cronograma
        CHECK (estado IN ('programada', 'realizada', 'cancelada')),

    CONSTRAINT fk_cronograma_tutor
        FOREIGN KEY (tutor_user_id)
        REFERENCES tutores(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_cronograma_estudiante
        FOREIGN KEY (codigo_estudiante)
        REFERENCES estudiante(codigo_estudiante)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS tutorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cronograma_id UUID NOT NULL,

    obs_academico TEXT,
    obs_personal TEXT,
    obs_profesional TEXT,
    resumen_general TEXT,

    requiere_derivacion BOOLEAN DEFAULT FALSE,

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    modalidad TEXT NOT NULL DEFAULT 'Asignada',

    CONSTRAINT fk_tutoria_cronograma
        FOREIGN KEY (cronograma_id)
        REFERENCES cronogramas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS derivaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tutoria_id UUID NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    motivo TEXT NOT NULL,

    fecha_derivacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_derivacion_tutoria
        FOREIGN KEY (tutoria_id)
        REFERENCES tutorias(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
