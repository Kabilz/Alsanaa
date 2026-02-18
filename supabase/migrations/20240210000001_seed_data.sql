-- Seed data for Academy Platform
-- This populates the educational categorization tables

-- =====================================================
-- EDUCATIONAL LEVELS
-- =====================================================

INSERT INTO public.educational_levels (id, name, name_ar, slug, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Elementary', 'ابتدائي', 'elementary', 1),
  ('22222222-2222-2222-2222-222222222222', 'Middle School', 'اعدادي', 'middle', 2),
  ('33333333-3333-3333-3333-333333333333', 'Secondary', 'ثانوي', 'secondary', 3),
  ('44444444-4444-4444-4444-444444444444', 'University', 'جامعي', 'university', 4),
  ('55555555-5555-5555-5555-555555555555', 'Academic', 'اكاديمي', 'academic', 5),
  ('66666666-6666-6666-6666-666666666666', 'Professional Courses', 'دورات', 'courses', 6)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ELEMENTARY YEARS (1st - 6th grade)
-- =====================================================

INSERT INTO public.educational_years (level_id, name, name_ar, slug, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', 'First Grade', 'السنة الأولى', 'first-grade', 1),
  ('11111111-1111-1111-1111-111111111111', 'Second Grade', 'السنة الثانية', 'second-grade', 2),
  ('11111111-1111-1111-1111-111111111111', 'Third Grade', 'السنة الثالثة', 'third-grade', 3),
  ('11111111-1111-1111-1111-111111111111', 'Fourth Grade', 'السنة الرابعة', 'fourth-grade', 4),
  ('11111111-1111-1111-1111-111111111111', 'Fifth Grade', 'السنة الخامسة', 'fifth-grade', 5),
  ('11111111-1111-1111-1111-111111111111', 'Sixth Grade', 'السنة السادسة', 'sixth-grade', 6);

-- =====================================================
-- MIDDLE SCHOOL YEARS
-- =====================================================

INSERT INTO public.educational_years (level_id, name, name_ar, slug, order_index) VALUES
  ('22222222-2222-2222-2222-222222222222', 'First Middle', 'الأولى اعدادي', 'first-middle', 1),
  ('22222222-2222-2222-2222-222222222222', 'Second Middle', 'الثانية اعدادي', 'second-middle', 2),
  ('22222222-2222-2222-2222-222222222222', 'Third Middle (Certificate)', 'الثالثة اعدادي (الشهادة)', 'third-middle', 3);

-- =====================================================
-- SECONDARY YEARS
-- =====================================================

INSERT INTO public.educational_years (level_id, name, name_ar, slug, order_index) VALUES
  ('33333333-3333-3333-3333-333333333333', 'First Secondary', 'الأولى ثانوي', 'first-secondary', 1),
  ('33333333-3333-3333-3333-333333333333', 'Second Secondary', 'الثانية ثانوي', 'second-secondary', 2),
  ('33333333-3333-3333-3333-333333333333', 'Third Secondary (Baccalaureate)', 'الثالثة ثانوي (الشهادة)', 'third-secondary', 3);

-- =====================================================
-- SAMPLE SUBJECTS FOR ELEMENTARY
-- =====================================================

-- First Grade subjects
INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Mathematics', 'الرياضيات', 'mathematics' 
FROM public.educational_years WHERE slug = 'first-grade';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Arabic Language', 'اللغة العربية', 'arabic-language' 
FROM public.educational_years WHERE slug = 'first-grade';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'English Language', 'اللغة الإنجليزية', 'english-language' 
FROM public.educational_years WHERE slug = 'first-grade';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Science', 'العلوم', 'science' 
FROM public.educational_years WHERE slug = 'first-grade';

-- Second Grade subjects
INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Mathematics', 'الرياضيات', 'mathematics' 
FROM public.educational_years WHERE slug = 'second-grade';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Arabic Language', 'اللغة العربية', 'arabic-language' 
FROM public.educational_years WHERE slug = 'second-grade';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'English Language', 'اللغة الإنجليزية', 'english-language' 
FROM public.educational_years WHERE slug = 'second-grade';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Science', 'العلوم', 'science' 
FROM public.educational_years WHERE slug = 'second-grade';

-- =====================================================
-- SAMPLE SUBJECTS FOR MIDDLE SCHOOL
-- =====================================================

-- First Middle subjects
INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Mathematics', 'الرياضيات', 'mathematics' 
FROM public.educational_years WHERE slug = 'first-middle';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Arabic Language', 'اللغة العربية', 'arabic-language' 
FROM public.educational_years WHERE slug = 'first-middle';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'English Language', 'اللغة الإنجليزية', 'english-language' 
FROM public.educational_years WHERE slug = 'first-middle';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Physics', 'الفيزياء', 'physics' 
FROM public.educational_years WHERE slug = 'first-middle';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Chemistry', 'الكيمياء', 'chemistry' 
FROM public.educational_years WHERE slug = 'first-middle';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Biology', 'الأحياء', 'biology' 
FROM public.educational_years WHERE slug = 'first-middle';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'History', 'التاريخ', 'history' 
FROM public.educational_years WHERE slug = 'first-middle';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Geography', 'الجغرافيا', 'geography' 
FROM public.educational_years WHERE slug = 'first-middle';

-- =====================================================
-- SAMPLE SUBJECTS FOR SECONDARY
-- =====================================================

-- First Secondary subjects
INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Mathematics', 'الرياضيات', 'mathematics' 
FROM public.educational_years WHERE slug = 'first-secondary';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Arabic Language', 'اللغة العربية', 'arabic-language' 
FROM public.educational_years WHERE slug = 'first-secondary';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'English Language', 'اللغة الإنجليزية', 'english-language' 
FROM public.educational_years WHERE slug = 'first-secondary';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Physics', 'الفيزياء', 'physics' 
FROM public.educational_years WHERE slug = 'first-secondary';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Chemistry', 'الكيمياء', 'chemistry' 
FROM public.educational_years WHERE slug = 'first-secondary';

INSERT INTO public.subjects (year_id, name, name_ar, slug) 
SELECT id, 'Biology', 'الأحياء', 'biology' 
FROM public.educational_years WHERE slug = 'first-secondary';

-- =====================================================
-- SAMPLE COLLEGES
-- =====================================================

INSERT INTO public.colleges (name, name_ar, slug) VALUES
  ('College of Engineering', 'كلية الهندسة', 'engineering'),
  ('College of Medicine', 'كلية الطب', 'medicine'),
  ('College of Science', 'كلية العلوم', 'science'),
  ('College of Arts', 'كلية الآداب', 'arts'),
  ('College of Business', 'كلية الإدارة والاقتصاد', 'business'),
  ('College of Law', 'كلية القانون', 'law'),
  ('College of Education', 'كلية التربية', 'education'),
  ('College of Computer Science', 'كلية علوم الحاسوب', 'computer-science');

-- =====================================================
-- SAMPLE DEPARTMENTS FOR ENGINEERING
-- =====================================================

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Civil Engineering', 'الهندسة المدنية', 'civil' 
FROM public.colleges WHERE slug = 'engineering';

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Electrical Engineering', 'الهندسة الكهربائية', 'electrical' 
FROM public.colleges WHERE slug = 'engineering';

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Mechanical Engineering', 'الهندسة الميكانيكية', 'mechanical' 
FROM public.colleges WHERE slug = 'engineering';

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Computer Engineering', 'هندسة الحاسوب', 'computer' 
FROM public.colleges WHERE slug = 'engineering';

-- =====================================================
-- SAMPLE DEPARTMENTS FOR COMPUTER SCIENCE
-- =====================================================

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Software Engineering', 'هندسة البرمجيات', 'software' 
FROM public.colleges WHERE slug = 'computer-science';

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Information Systems', 'نظم المعلومات', 'information-systems' 
FROM public.colleges WHERE slug = 'computer-science';

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Artificial Intelligence', 'الذكاء الاصطناعي', 'ai' 
FROM public.colleges WHERE slug = 'computer-science';

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Cybersecurity', 'الأمن السيبراني', 'cybersecurity' 
FROM public.colleges WHERE slug = 'computer-science';

-- =====================================================
-- SAMPLE DEPARTMENTS FOR MEDICINE
-- =====================================================

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'General Medicine', 'الطب العام', 'general-medicine' 
FROM public.colleges WHERE slug = 'medicine';

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Surgery', 'الجراحة', 'surgery' 
FROM public.colleges WHERE slug = 'medicine';

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Pediatrics', 'طب الأطفال', 'pediatrics' 
FROM public.colleges WHERE slug = 'medicine';

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Dentistry', 'طب الأسنان', 'dentistry' 
FROM public.colleges WHERE slug = 'medicine';

INSERT INTO public.departments (college_id, name, name_ar, slug) 
SELECT id, 'Pharmacy', 'الصيدلة', 'pharmacy' 
FROM public.colleges WHERE slug = 'medicine';
