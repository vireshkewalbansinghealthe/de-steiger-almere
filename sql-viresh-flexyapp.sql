-- SQL Script to assign unit to viresh@flexyapp.com
-- Copy and paste this into your Supabase SQL editor

-- 1. Create or update the user profile for viresh@flexyapp.com
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
  'f8e7d6c5-b4a3-9281-7069-58473a46bef2',  -- Fixed UUID for viresh@flexyapp.com
  'viresh@flexyapp.com',
  'Viresh',
  'Kewal Bansing',
  '+31 6 87654321',
  'Flexy App B.V.',
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

-- 2. Create a demo property (Bedrijfsunit Type 2)
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
  'demo-bedrijfsunit-002-flexyapp',
  'Bedrijfsunit Type 2',
  'BU-002',
  'bedrijfsunit',
  2,
  'available',
  101.2,
  92.0,
  202400,
  'De Steiger 74/77, Almere',
  ARRAY['/images/up/Image4.png', '/images/up/Image5.png', '/images/up/beide2.png'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  status = 'available',
  updated_at = NOW();

-- 3. Create the reservation for viresh@flexyapp.com
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
  'demo-reservation-flexyapp-001',
  'demo-bedrijfsunit-002-flexyapp',  -- References the property above
  'f8e7d6c5-b4a3-9281-7069-58473a46bef2',  -- References the profile above
  'RES-' || EXTRACT(EPOCH FROM NOW())::bigint || '-FLEXYAPP',
  'confirmed',
  'Viresh',
  'Kewal Bansing',
  'viresh@flexyapp.com',
  '+31 6 87654321',
  'Flexy App B.V.',
  'Innovatiestraat 45',
  'Amsterdam',
  '1012 XY',
  'Nederland',
  1500.00,
  202400,
  'completed',
  NOW(),
  'Demo reservation for Flexy App B.V. - Business operations and app development',
  'Software development office and business operations',
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
WHERE id = 'demo-bedrijfsunit-002-flexyapp';

-- 5. Create a second reservation (optional - for demonstration)
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
  'demo-opslagbox-003-flexyapp',
  'Opslagbox Type 3',
  'OB-003',
  'opslagbox',
  3,
  'available',
  34.1,
  32.4,
  75020,
  'De Steiger 74/77, Almere',
  ARRAY['/images/up/opslagbox3.png', '/images/up/opslagbox4.png'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  status = 'available',
  updated_at = NOW();

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
  'demo-reservation-flexyapp-002',
  'demo-opslagbox-003-flexyapp',
  'f8e7d6c5-b4a3-9281-7069-58473a46bef2',
  'RES-' || EXTRACT(EPOCH FROM NOW())::bigint || '-STORAGE',
  'pending_payment',
  'Viresh',
  'Kewal Bansing',
  'viresh@flexyapp.com',
  '+31 6 87654321',
  'Flexy App B.V.',
  'Innovatiestraat 45',
  'Amsterdam',
  '1012 XY',
  'Nederland',
  1500.00,
  75020,
  'pending',
  NULL,
  'Additional storage unit for equipment and inventory',
  'Storage for business equipment and inventory',
  false,
  NOW() + INTERVAL '4 weeks',
  NOW() - INTERVAL '1 day',  -- Created yesterday
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW();

-- Update second property status
UPDATE properties 
SET 
  status = 'reserved',
  updated_at = NOW()
WHERE id = 'demo-opslagbox-003-flexyapp';

-- 6. Verification queries
SELECT 
  'Profile Check' as check_type,
  p.email,
  p.first_name || ' ' || p.last_name as full_name,
  p.company_name,
  p.phone
FROM profiles p 
WHERE p.email = 'viresh@flexyapp.com'

UNION ALL

SELECT 
  'Reservation 1 Check' as check_type,
  r.customer_email,
  r.reservation_number,
  r.status,
  '€' || r.total_property_price::text
FROM reservations r 
WHERE r.customer_email = 'viresh@flexyapp.com' AND r.id = 'demo-reservation-flexyapp-001'

UNION ALL

SELECT 
  'Reservation 2 Check' as check_type,
  r.customer_email,
  r.reservation_number,
  r.status,
  '€' || r.total_property_price::text
FROM reservations r 
WHERE r.customer_email = 'viresh@flexyapp.com' AND r.id = 'demo-reservation-flexyapp-002'

UNION ALL

SELECT 
  'Property 1 Check' as check_type,
  pr.name,
  pr.unit_number,
  pr.status,
  pr.location
FROM properties pr 
WHERE pr.id = 'demo-bedrijfsunit-002-flexyapp'

UNION ALL

SELECT 
  'Property 2 Check' as check_type,
  pr.name,
  pr.unit_number,
  pr.status,
  pr.location
FROM properties pr 
WHERE pr.id = 'demo-opslagbox-003-flexyapp';

-- 7. Show complete reservation data (for profile page testing)
SELECT 
  r.*,
  p.name as property_name,
  p.type as property_type,
  p.unit_number,
  p.images as property_images,
  p.location,
  p.gross_area,
  p.net_area,
  p.sale_price
FROM reservations r
JOIN properties p ON r.property_id = p.id
WHERE r.customer_email = 'viresh@flexyapp.com'
ORDER BY r.created_at DESC;


