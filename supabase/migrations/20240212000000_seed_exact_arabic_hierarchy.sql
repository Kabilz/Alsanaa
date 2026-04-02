-- Update Educational Levels to match user requested terms
UPDATE public.educational_levels
SET name_ar = 'ابتدائي'
WHERE slug = 'elementary';

UPDATE public.educational_levels
SET name_ar = 'اعدادي'
WHERE slug = 'middle';

UPDATE public.educational_levels
SET name_ar = 'ثانوي'
WHERE slug = 'secondary';

UPDATE public.educational_levels
SET name_ar = 'جامعي'
WHERE slug = 'university';

UPDATE public.educational_levels
SET name_ar = 'اكاديمي'
WHERE slug = 'academic';

UPDATE public.educational_levels
SET name_ar = 'دورات'
WHERE slug = 'courses';


-- Update Elementary Years (الابتدائي)
UPDATE public.educational_years
SET name_ar = 'سنة أولى'
WHERE slug = 'first-grade';

UPDATE public.educational_years
SET name_ar = 'سنة ثانية'
WHERE slug = 'second-grade';

UPDATE public.educational_years
SET name_ar = 'سنة ثالثة'
WHERE slug = 'third-grade';

UPDATE public.educational_years
SET name_ar = 'سنة رابعة'
WHERE slug = 'fourth-grade';

UPDATE public.educational_years
SET name_ar = 'سنة خامسة'
WHERE slug = 'fifth-grade';

UPDATE public.educational_years
SET name_ar = 'سنة سادسة'
WHERE slug = 'sixth-grade';


-- Update Preparatory Years (الاعدادي)
UPDATE public.educational_years
SET name_ar = 'أولى اعدادي'
WHERE slug = 'first-middle';

UPDATE public.educational_years
SET name_ar = 'ثانية اعدادي'
WHERE slug = 'second-middle';

UPDATE public.educational_years
SET name_ar = 'الشهادة'
WHERE slug = 'third-middle';


-- Update Secondary Years (الثانوي)
UPDATE public.educational_years
SET name_ar = 'أولى ثانوي'
WHERE slug = 'first-secondary';

UPDATE public.educational_years
SET name_ar = 'ثانية ثانوي'
WHERE slug = 'second-secondary';

UPDATE public.educational_years
SET name_ar = 'الشهادة'
WHERE slug = 'third-secondary';

-- For University and Academic, we already have colleges and departments tables:
-- الجامعي (كلية - تخصص) = Colleges -> Departments
-- اكاديمي (قسم - تخصص) = Academic -> Departments -> Subjects
