-- SQL Scripts to create user and reservation for viresh@flexy.nl
-- Copy and paste these into your Supabase SQL editor

-- 1. First, create or update the user profile
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
  '82e46230-b55a-4bfa-a7bd-bd6aa6511c42',  -- Fixed UUID for viresh@flexy.nl
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

-- 2. Create a demo property if none exists
INSERT INTO properties (
  id,
  name,
  unit_number,
  type,
  type_number,
  status,
  gross_area,
  net_area,
  sale_price,
  location,
  images,
  created_at,
  updated_at
) VALUES (
  'demo-bedrijfsunit-001',
  'Bedrijfsunit Type 1',
  'BU-001',
  'bedrijfsunit',
  1,
  'available',
  153.4,
  134.7,
  306800,
  'De Steiger 74/77, Almere',
  ARRAY['/images/up/Image1.png', '/images/up/Image2.png', '/images/up/beide1.png'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  status = 'available',
  updated_at = NOW();

-- 3. Create the reservation
INSERT INTO reservations (
  id,
  property_id,
  customer_id,
  reservation_number,
  status,
  customer_first_name,
  customer_last_name,
  customer_email,
  customer_phone,
  customer_company,
  customer_address,
  customer_city,
  customer_postal_code,
  customer_country,
  reservation_fee_amount,
  total_property_price,
  payment_status,
  paid_at,
  notes,
  intended_use,
  financing_confirmed,
  reservation_expires_at,
  created_at,
  updated_at
) VALUES (
  'demo-reservation-viresh-001',
  'demo-bedrijfsunit-001',  -- References the property above
  '82e46230-b55a-4bfa-a7bd-bd6aa6511c42',  -- References the profile above
  'RES-' || EXTRACT(EPOCH FROM NOW())::bigint || '-VIRESH',
  'confirmed',
  'Viresh',
  'Kewal Bansing',
  'viresh@flexy.nl',
  '+31 6 12345678',
  'Flexy B.V.',
  'Teststraat 123',
  'Amsterdam',
  '1012 AB',
  'Nederland',
  1500.00,
  306800,
  'completed',
  NOW(),
  'Demo reservation created via SQL for profile page testing',
  'Business operations and office space',
  false,
  NOW() + INTERVAL '4 weeks',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  status = 'confirmed',
  payment_status = 'completed',
  paid_at = NOW(),
  updated_at = NOW();

-- 4. Update the property status to reserved
UPDATE properties 
SET 
  status = 'reserved',
  updated_at = NOW()
WHERE id = 'demo-bedrijfsunit-001';

-- 5. Verify the data was inserted correctly
SELECT 
  'Profile Check' as check_type,
  p.email,
  p.first_name,
  p.last_name,
  p.company_name
FROM profiles p 
WHERE p.email = 'viresh@flexy.nl'

UNION ALL

SELECT 
  'Reservation Check' as check_type,
  r.customer_email,
  r.reservation_number,
  r.status,
  CAST(r.total_property_price AS TEXT)
FROM reservations r 
WHERE r.customer_email = 'viresh@flexy.nl'

UNION ALL

SELECT 
  'Property Check' as check_type,
  pr.name,
  pr.unit_number,
  pr.status,
  pr.location
FROM properties pr 
WHERE pr.id = 'demo-bedrijfsunit-001';


