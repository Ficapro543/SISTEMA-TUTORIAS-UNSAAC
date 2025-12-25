-- Add code column to users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'code') THEN
        ALTER TABLE users ADD COLUMN code TEXT;
    END IF;
END $$;

-- Create Semesters table
CREATE TABLE IF NOT EXISTS semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g., '2025-I'
    is_active BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT now()
);

-- Ensure only one semester is active at a time (optional trigger/rule, but keeping it simple for now)

-- Create Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    cycle TEXT, -- e.g., '5to Ciclo'
    created_at TIMESTAMP DEFAULT now()
);

-- Create Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES users(id),
    student_id UUID NOT NULL REFERENCES students(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(student_id, semester_id) -- A student can only have one tutor per semester
);

-- Seed data for testing (optional, generic)
-- INSERT INTO semesters (name, is_active) VALUES ('2025-I', TRUE) ON CONFLICT DO NOTHING;
