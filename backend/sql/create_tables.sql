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
    id_tutor SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    cubiculo VARCHAR(50),

    CONSTRAINT fk_tutores_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS estudiante (
    codigo_estudiante VARCHAR(20) NOT NULL UNIQUE,
    nombre_estudiante VARCHAR(100) NOT NULL,
    apellido_estudiante VARCHAR(100) NOT NULL,
    semestre VARCHAR(10) NOT NULL,
    id_tutor INTEGER NOT NULL,

    CONSTRAINT fk_tutorandos_tutor
        FOREIGN KEY (id_tutor)
        REFERENCES tutores(id_tutor)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cronogramas (
    id_cronograma VARCHAR(20) PRIMARY KEY,
    semestre VARCHAR(10) NOT NULL,
    fecha DATE NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Creado',

    CONSTRAINT chk_estado_cronograma
        CHECK (estado IN ('Creado', 'En Curso', 'Concluido'))
);

CREATE TABLE IF NOT EXISTS tutorias (
    id_tutoria SERIAL PRIMARY KEY,

    id_tutor INTEGER NOT NULL,
    codigo_estudiante INTEGER NOT NULL,
    id_cronograma VARCHAR(20) NOT NULL,

    obs_personal TEXT,
    obs_academico TEXT,
    obs_profesional TEXT,
    resumen_general TEXT,

    requiere_derivacion BOOLEAN NOT NULL DEFAULT FALSE,
    especialidad_derivacion VARCHAR(100),
    motivo_derivacion TEXT,

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    modalidad TEXT NOT NULL DEFAULT 'Asignada',

    CONSTRAINT chk_modalidad_tutoria
        CHECK (modalidad IN ('Solicitada', 'Asignada')),

    CONSTRAINT fk_tutorias_tutor
        FOREIGN KEY (id_tutor)
        REFERENCES tutores(id_tutor)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_tutorias_tutorando
        FOREIGN KEY (id_tutorando)
        REFERENCES estudiante(id_tutorando)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_tutorias_cronograma
        FOREIGN KEY (id_cronograma)
        REFERENCES cronogramas(id_cronograma)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_tutoria_semestre
        UNIQUE (id_tutor, id_tutorando, id_cronograma)
);

CREATE TABLE IF NOT EXISTS derivaciones (
    id_derivacion SERIAL PRIMARY KEY,

    id_tutoria INTEGER NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    motivo TEXT NOT NULL,

    fecha_derivacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_derivacion_tutoria
        FOREIGN KEY (id_tutoria)
        REFERENCES tutorias(id_tutoria)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
