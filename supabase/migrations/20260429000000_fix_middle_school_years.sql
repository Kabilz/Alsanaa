-- Fix Middle School (الاعدادي) year names to match requested Arabic terms
UPDATE public.educational_years
SET name_ar = 'اول اعدادي', name = 'First Middle'
WHERE slug = 'first-middle';

UPDATE public.educational_years
SET name_ar = 'ثاني اعدادي', name = 'Second Middle'
WHERE slug = 'second-middle';

UPDATE public.educational_years
SET name_ar = 'ثالث اعدادي', name = 'Third Middle'
WHERE slug = 'third-middle';
