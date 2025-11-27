-- Check for duplicate reservations for unit 9
SELECT id, reservation_number, customer_email, status, created_at
FROM reservations r
JOIN properties p ON r.property_id = p.id
WHERE p.unit_number = '9'
ORDER BY created_at DESC;

-- Delete the most recent duplicate (keep the oldest one)
-- Replace 'RESERVATION_ID_HERE' with the actual ID after checking above
-- DELETE FROM reservations WHERE id = 'RESERVATION_ID_HERE';

