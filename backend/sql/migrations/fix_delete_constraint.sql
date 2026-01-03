-- Drop the existing constraint
ALTER TABLE tutorias DROP CONSTRAINT IF EXISTS fk_tutoria_cronograma;

-- Re-add the constraint with ON DELETE CASCADE
ALTER TABLE tutorias
ADD CONSTRAINT fk_tutoria_cronograma
FOREIGN KEY (cronograma_id)
REFERENCES cronogramas(id)
ON UPDATE CASCADE
ON DELETE CASCADE;
