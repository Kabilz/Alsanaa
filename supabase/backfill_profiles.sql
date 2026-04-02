-- Backfill profile rows for any auth users who don't have one yet
INSERT INTO public.profiles (id, role, full_name, wallet_balance)
SELECT
  au.id,
  'customer',
  au.raw_user_meta_data->>'full_name',
  0.00
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;
