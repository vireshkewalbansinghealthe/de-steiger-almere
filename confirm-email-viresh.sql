-- SQL Script to confirm email for viresh@flexy.nl
-- Copy and paste this into your Supabase SQL editor

-- 1. Update email confirmation status in auth.users table
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'viresh@flexy.nl';

-- 2. Ensure user profile exists and is properly set up
INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  phone,
  company_name,
  role,
  created_at,
  updated_at
) VALUES (
  '82e46230-b55a-4bfa-a7bd-bd6aa6511c42',  -- Use the existing UUID
  'viresh@flexy.nl',
  'Viresh',
  'Kewal Bansing',
  '+31 6 12345678',
  'Flexy B.V.',
  'customer',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  company_name = EXCLUDED.company_name,
  updated_at = NOW();

-- 3. Update auth.users to match profile ID (if needed)
UPDATE auth.users 
SET 
  id = '82e46230-b55a-4bfa-a7bd-bd6aa6511c42',
  updated_at = NOW()
WHERE email = 'viresh@flexy.nl' 
  AND id != '82e46230-b55a-4bfa-a7bd-bd6aa6511c42';

-- 4. Alternative: If above doesn't work, update profile to match existing auth user ID
DO $$
DECLARE
    auth_user_id uuid;
BEGIN
    -- Get the actual user ID from auth.users
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = 'viresh@flexy.nl';
    
    -- If user exists in auth, update profile to use that ID
    IF auth_user_id IS NOT NULL THEN
        INSERT INTO profiles (
            id,
            email,
            first_name,
            last_name,
            phone,
            company_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            auth_user_id,
            'viresh@flexy.nl',
            'Viresh',
            'Kewal Bansing',
            '+31 6 12345678',
            'Flexy B.V.',
            'customer',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            phone = EXCLUDED.phone,
            company_name = EXCLUDED.company_name,
            updated_at = NOW();
            
        RAISE NOTICE 'Profile updated/created for user ID: %', auth_user_id;
    ELSE
        RAISE NOTICE 'No auth user found for viresh@flexy.nl';
    END IF;
END $$;

-- 5. Reset password (set a known password)
UPDATE auth.users 
SET 
  encrypted_password = crypt('NewPassword123!', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'viresh@flexy.nl';

-- 6. Check email confirmation status
SELECT 
  'Email Confirmation Check' as check_type,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  u.confirmed_at IS NOT NULL as account_confirmed,
  u.created_at,
  u.updated_at
FROM auth.users u 
WHERE u.email = 'viresh@flexy.nl'

UNION ALL

SELECT 
  'Profile Check' as check_type,
  p.email,
  (p.first_name || ' ' || p.last_name)::boolean::text as email_confirmed,
  p.company_name::boolean::text as account_confirmed,
  p.created_at::text,
  p.updated_at::text
FROM profiles p 
WHERE p.email = 'viresh@flexy.nl';

-- 7. Show complete user info for debugging
SELECT 
  'Auth User Info' as info_type,
  u.id::text as user_id,
  u.email,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN 'CONFIRMED' 
    ELSE 'NOT CONFIRMED' 
  END as email_status,
  CASE 
    WHEN u.confirmed_at IS NOT NULL THEN 'CONFIRMED' 
    ELSE 'NOT CONFIRMED' 
  END as account_status
FROM auth.users u 
WHERE u.email = 'viresh@flexy.nl'

UNION ALL

SELECT 
  'Profile Info' as info_type,
  p.id::text as user_id,
  p.email,
  p.first_name as email_status,
  p.last_name as account_status
FROM profiles p 
WHERE p.email = 'viresh@flexy.nl';

-- 8. Manual email confirmation (if the above UPDATE doesn't work)
-- This forces email confirmation by directly updating the timestamp
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  '82e46230-b55a-4bfa-a7bd-bd6aa6511c42',
  'viresh@flexy.nl',
  crypt('NewPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO UPDATE SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW(),
  encrypted_password = crypt('NewPassword123!', gen_salt('bf')),
  updated_at = NOW();

-- Final verification
SELECT 
  u.email,
  u.id,
  u.email_confirmed_at,
  u.confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL AND u.confirmed_at IS NOT NULL 
    THEN '✅ FULLY CONFIRMED' 
    ELSE '❌ NOT CONFIRMED' 
  END as status
FROM auth.users u 
WHERE u.email = 'viresh@flexy.nl';


