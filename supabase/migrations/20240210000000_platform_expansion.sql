-- Academy Platform Expansion - Complete Database Schema
-- This migration adds all tables for the expanded platform

-- =====================================================
-- PHASE 1: USER PROFILES AND ROLES
-- =====================================================

-- User profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('customer', 'teacher', 'admin')) default 'customer',
  full_name text,
  full_name_ar text,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =====================================================
-- TEACHERS TABLE
-- =====================================================

create table if not exists public.teachers (
  id uuid primary key references public.profiles(id) on delete cascade,
  commission_rate decimal(5,2) not null default 70.00 check (commission_rate >= 0 and commission_rate <= 100),
  wallet_balance decimal(10,2) not null default 0.00,
  bio text,
  bio_ar text,
  specializations text[],
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.teachers enable row level security;

-- RLS policies for teachers
create policy "Teachers can view their own data"
  on public.teachers for select
  using (auth.uid() = id);

create policy "Teachers can update their own data"
  on public.teachers for update
  using (auth.uid() = id);

create policy "Everyone can view verified teachers"
  on public.teachers for select
  using (is_verified = true);

create policy "Admins can manage all teachers"
  on public.teachers for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =====================================================
-- EDUCATIONAL CATEGORIZATION
-- =====================================================

-- Educational levels (elementary, middle, secondary, university, academic, courses)
create table if not exists public.educational_levels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text not null,
  slug text unique not null,
  order_index int not null,
  created_at timestamptz default now()
);

alter table public.educational_levels enable row level security;

create policy "Anyone can view educational levels"
  on public.educational_levels for select
  to public
  using (true);

-- Educational years/grades
create table if not exists public.educational_years (
  id uuid primary key default gen_random_uuid(),
  level_id uuid references public.educational_levels(id) on delete cascade,
  name text not null,
  name_ar text not null,
  slug text not null,
  order_index int not null,
  created_at timestamptz default now(),
  unique(level_id, slug)
);

alter table public.educational_years enable row level security;

create policy "Anyone can view educational years"
  on public.educational_years for select
  to public
  using (true);

-- Subjects
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  year_id uuid references public.educational_years(id) on delete cascade,
  name text not null,
  name_ar text not null,
  slug text not null,
  created_at timestamptz default now(),
  unique(year_id, slug)
);

alter table public.subjects enable row level security;

create policy "Anyone can view subjects"
  on public.subjects for select
  to public
  using (true);

-- Colleges (for university level)
create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

alter table public.colleges enable row level security;

create policy "Anyone can view colleges"
  on public.colleges for select
  to public
  using (true);

-- Departments
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  college_id uuid references public.colleges(id) on delete cascade,
  name text not null,
  name_ar text not null,
  slug text not null,
  created_at timestamptz default now(),
  unique(college_id, slug)
);

alter table public.departments enable row level security;

create policy "Anyone can view departments"
  on public.departments for select
  to public
  using (true);

-- =====================================================
-- ENHANCED COURSES TABLE
-- =====================================================

-- Drop existing courses table and recreate with new schema
-- WARNING: This will delete existing course data. Backup first!
-- drop table if exists public.courses cascade;

-- Create new courses table
create table if not exists public.courses_new (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teachers(id) on delete cascade,
  
  -- Basic info
  title text not null,
  title_ar text,
  description text,
  description_ar text,
  price decimal(10,2) not null default 0.00,
  is_free boolean default false,
  
  -- Categorization (only one set will be used)
  educational_year_id uuid references public.educational_years(id),
  subject_id uuid references public.subjects(id),
  department_id uuid references public.departments(id),
  
  -- Content
  video_url text,
  pdf_url text,
  thumbnail_url text,
  duration_minutes int,
  
  -- Metadata
  status text check (status in ('draft', 'published', 'archived')) default 'draft',
  view_count int default 0,
  enrollment_count int default 0,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.courses_new enable row level security;

-- RLS policies for courses
create policy "Anyone can view published courses"
  on public.courses_new for select
  using (status = 'published');

create policy "Teachers can manage their own courses"
  on public.courses_new for all
  using (auth.uid() = teacher_id);

create policy "Admins can manage all courses"
  on public.courses_new for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =====================================================
-- FINANCIAL MANAGEMENT
-- =====================================================

-- Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  course_id uuid references public.courses_new(id) on delete set null,
  amount decimal(10,2) not null,
  payment_method text check (payment_method in ('card', 'transfer', 'voucher')),
  payment_service text, -- Stripe, PayPal, Zaincash, etc.
  status text check (status in ('pending', 'completed', 'failed', 'refunded')) default 'pending',
  metadata jsonb, -- Additional payment details
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.transactions enable row level security;

-- RLS policies for transactions
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Admins can view all transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Teacher earnings
create table if not exists public.teacher_earnings (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teachers(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete cascade,
  amount decimal(10,2) not null,
  commission_rate decimal(5,2) not null,
  status text check (status in ('pending', 'available', 'paid', 'held')) default 'pending',
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table public.teacher_earnings enable row level security;

create policy "Teachers can view their own earnings"
  on public.teacher_earnings for select
  using (auth.uid() = teacher_id);

create policy "Admins can manage all earnings"
  on public.teacher_earnings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Wallet transactions
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teachers(id) on delete cascade,
  amount decimal(10,2) not null,
  type text check (type in ('earning', 'withdrawal', 'adjustment')),
  description text,
  description_ar text,
  reference_id uuid, -- Can reference transaction or earning
  created_at timestamptz default now()
);

alter table public.wallet_transactions enable row level security;

create policy "Teachers can view their own wallet transactions"
  on public.wallet_transactions for select
  using (auth.uid() = teacher_id);

create policy "Admins can manage wallet transactions"
  on public.wallet_transactions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =====================================================
-- PREPAID CARDS/VOUCHERS
-- =====================================================

create table if not exists public.prepaid_cards (
  id uuid primary key default gen_random_uuid(),
  serial_number text unique not null,
  secret_code text not null, -- Should be hashed in production
  value decimal(10,2) not null,
  status text check (status in ('active', 'used', 'expired', 'cancelled')) default 'active',
  used_by_user_id uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table public.prepaid_cards enable row level security;

create policy "Users can view cards they've used"
  on public.prepaid_cards for select
  using (auth.uid() = used_by_user_id);

create policy "Admins can manage all cards"
  on public.prepaid_cards for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =====================================================
-- ANNOUNCEMENTS
-- =====================================================

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_ar text,
  content text not null,
  content_ar text,
  image_url text,
  target_audience text check (target_audience in ('all', 'students', 'teachers')) default 'all',
  is_active boolean default true,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.announcements enable row level security;

create policy "Anyone can view active announcements"
  on public.announcements for select
  using (is_active = true and published_at <= now());

create policy "Admins can manage announcements"
  on public.announcements for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =====================================================
-- MESSAGES AND CONTACT
-- =====================================================

-- Messages between users
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references auth.users(id) on delete set null,
  to_user_id uuid references auth.users(id) on delete set null,
  subject text,
  content text not null,
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users can view their messages"
  on public.messages for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = from_user_id);

create policy "Users can mark their received messages as read"
  on public.messages for update
  using (auth.uid() = to_user_id);

-- Contact form submissions
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text check (status in ('new', 'in_progress', 'resolved', 'closed')) default 'new',
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.contact_submissions enable row level security;

create policy "Users can view their own submissions"
  on public.contact_submissions for select
  using (auth.uid() = user_id);

create policy "Anyone can create contact submission"
  on public.contact_submissions for insert
  with check (true);

create policy "Admins can manage contact submissions"
  on public.contact_submissions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =====================================================
-- UPDATE COURSE_PURCHASES TABLE
-- =====================================================

-- Update existing course_purchases to work with new schema
alter table public.course_purchases 
  add column if not exists transaction_id uuid references public.transactions(id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_teachers_verified on public.teachers(is_verified);
create index if not exists idx_courses_teacher on public.courses_new(teacher_id);
create index if not exists idx_courses_status on public.courses_new(status);
create index if not exists idx_courses_year on public.courses_new(educational_year_id);
create index if not exists idx_courses_subject on public.courses_new(subject_id);
create index if not exists idx_transactions_user on public.transactions(user_id);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_teacher_earnings_teacher on public.teacher_earnings(teacher_id);
create index if not exists idx_teacher_earnings_status on public.teacher_earnings(status);
create index if not exists idx_announcements_active on public.announcements(is_active, published_at);
create index if not exists idx_messages_to_user on public.messages(to_user_id, is_read);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to relevant tables
create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.teachers
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.courses_new
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.transactions
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.announcements
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.contact_submissions
  for each row execute function public.handle_updated_at();

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'customer', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
