CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- TABLAS
-- =========================

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

CREATE TABLE IF NOT EXISTS activation_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP
);

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
    fecha_reasignacion TIMESTAMP,

    CONSTRAINT chk_estado_asignacion
        CHECK (estado IN ('activo', 'finalizado', 'reasignado')),

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

CREATE TABLE IF NOT EXISTS cronogramas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_user_id UUID NOT NULL,
    codigo_estudiante VARCHAR(20) NOT NULL,
    asignacion_id UUID NOT NULL,

    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    ambiente VARCHAR(100) NOT NULL,
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
        ON DELETE RESTRICT,

    CONSTRAINT fk_cronograma_asignacion
        FOREIGN KEY (asignacion_id)
        REFERENCES tutor_asignacion(id)
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

-- =========================
-- ÍNDICES
-- =========================

CREATE UNIQUE INDEX IF NOT EXISTS uq_asignacion_activa
ON tutor_asignacion (codigo_estudiante, semestre)
WHERE estado = 'activo';

CREATE UNIQUE INDEX IF NOT EXISTS uq_cronograma_tutor_fecha_hora
ON cronogramas (tutor_user_id, fecha, hora);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cronograma_ambiente_fecha_hora
ON cronogramas (fecha, hora, ambiente)
WHERE ambiente IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cronograma_semestre
ON cronogramas (semestre);

CREATE INDEX IF NOT EXISTS idx_tutoria_cronograma
ON tutorias (cronograma_id);

CREATE INDEX IF NOT EXISTS idx_cronograma_tutor
ON cronogramas (tutor_user_id);

-- =========================
-- FUNCIONES
-- =========================

CREATE OR REPLACE FUNCTION set_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION bloquear_edicion_tutoria_fuera_fecha()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM cronogramas c
        WHERE c.id = OLD.cronograma_id
          AND (c.fecha + c.hora) < CURRENT_TIMESTAMP
    ) THEN
        RAISE EXCEPTION 'No se puede modificar tutorías de fechas pasadas';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION bloquear_edicion_cronograma_pasado()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.fecha + OLD.hora) < CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'No se puede modificar cronogramas de fechas pasadas';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validar_asignacion_cronograma()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM tutor_asignacion ta
        WHERE ta.id = NEW.asignacion_id
          AND ta.estado = 'activo'
          AND ta.semestre = NEW.semestre
          AND ta.tutor_user_id = NEW.tutor_user_id
          AND ta.codigo_estudiante = NEW.codigo_estudiante
    ) THEN
        RAISE EXCEPTION
        'La asignación no es válida: tutor, estudiante, semestre o estado incorrecto';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION bloquear_delete_cronograma_realizado()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado = 'realizada' THEN
        RAISE EXCEPTION 'No se puede eliminar un cronograma ya realizado';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- TRIGGERS
-- =========================

CREATE TRIGGER trg_update_fecha_tutoria
BEFORE UPDATE ON tutorias
FOR EACH ROW
WHEN (OLD IS DISTINCT FROM NEW)
EXECUTE FUNCTION set_fecha_actualizacion();

CREATE TRIGGER trg_bloquear_edicion_tutoria
BEFORE UPDATE ON tutorias
FOR EACH ROW
EXECUTE FUNCTION bloquear_edicion_tutoria_fuera_fecha();

CREATE TRIGGER trg_bloquear_edicion_cronograma
BEFORE UPDATE ON cronogramas
FOR EACH ROW
EXECUTE FUNCTION bloquear_edicion_cronograma_pasado();

CREATE TRIGGER trg_validar_asignacion_cronograma
BEFORE INSERT OR UPDATE ON cronogramas
FOR EACH ROW
EXECUTE FUNCTION validar_asignacion_cronograma();

CREATE TRIGGER trg_bloquear_delete_cronograma
BEFORE DELETE ON cronogramas
FOR EACH ROW
EXECUTE FUNCTION bloquear_delete_cronograma_realizado();