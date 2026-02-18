-- Add missing INSERT policies for profiles and teachers

-- Allow users to insert their own profile (in case trigger fails or for robustness)
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Allow users to become teachers (insert their own teacher record)
create policy "Users can create their own teacher profile"
  on public.teachers for insert
  with check (auth.uid() = id);
