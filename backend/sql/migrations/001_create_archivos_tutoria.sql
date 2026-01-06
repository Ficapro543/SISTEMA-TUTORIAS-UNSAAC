CREATE TABLE IF NOT EXISTS archivos_tutoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutoria_id UUID NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    path TEXT NOT NULL,
    mimetype TEXT NOT NULL,
    size BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),

    CONSTRAINT fk_archivo_tutoria
        FOREIGN KEY (tutoria_id)
        REFERENCES tutorias(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_archivos_tutoria_tutoria
ON archivos_tutoria (tutoria_id);
