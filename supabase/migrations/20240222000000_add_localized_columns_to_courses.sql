-- Migration: Add localized columns to the courses table
-- Run this in Supabase Studio -> SQL Editor
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS title_ar       text,
  ADD COLUMN IF NOT EXISTS title_en       text,
  ADD COLUMN IF NOT EXISTS description_ar text,
  ADD COLUMN IF NOT EXISTS description_en text;
