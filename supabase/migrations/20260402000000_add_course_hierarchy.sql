-- Add hierarchy columns to courses table
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS educational_year_id uuid REFERENCES public.educational_years(id),
ADD COLUMN IF NOT EXISTS subject_id uuid REFERENCES public.subjects(id),
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id);

-- Add index for new fields
CREATE INDEX IF NOT EXISTS idx_courses_year ON public.courses(educational_year_id);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON public.courses(subject_id);
CREATE INDEX IF NOT EXISTS idx_courses_department ON public.courses(department_id);
