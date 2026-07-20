-- ==========================================================
-- NUSCAS Website — Add Departments to Events Migration
-- Version 1.1 · July 2026
-- ==========================================================

ALTER TABLE public.events 
ADD COLUMN departments text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.events 
ADD CONSTRAINT check_departments CHECK (departments <@ ARRAY['CASuals', 'TOPICS', 'Palette']::text[]);
