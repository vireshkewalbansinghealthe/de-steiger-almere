
-- Sample bedrijfsunit inserts (Type 1)
INSERT INTO public.properties (
  type, name, description, unit_number, type_number,
  gross_area, net_area, industrie_net_area, industrie_gross_area,
  kantoor_net_area, kantoor_gross_area, sale_price, slug,
  status, ceiling_height, parking_spaces, reservation_fee,
  features, specifications, images, location
) VALUES
(
  'bedrijfsunit',
  'Bedrijfsunit Type 1 - Unit 1',
  'Bedrijfsunit Type 1 van 134.7m² netto op De Steiger 74/77 in Almere. Combinatie van industrie- en kantoorfunctie.',
  '1',
  1,
  153.4,
  134.7,
  50.6,
  44.9,
  50.6,
  44.9,
  322140,
  'bedrijfsunit-type-1-unit-1',
  'available',
  3.70,
  2,
  2500.00,
  '["134.7m² netto", "153.4m² bruto", "Industrie + Kantoor", "2 parkeerplaatsen", "Energielabel A+"]'::jsonb,
  '{
    "unitSizes": ["90m²", "150m²", "200m²", "250m²", "300m²"],
    "ceiling": "3.70 meter vrije hoogte",
    "floors": "Vloeropbouw Monolitische afwerking",
    "heating": "Geen vloerverwarming",
    "electricity": "3x25A met mogelijkheid tot uitbreiding",
    "internet": "Glasvezel 1Gbps symmetrisch",
    "parking": "2 eigen parkeerplaatsen per unit",
    "access": "24/7 toegang via app en pincode"
  }'::jsonb,
  '["/images/up/beide1.png", "/images/up/beide2.png", "/images/up/Image1.png"]'::jsonb,
  'De Steiger 74/77, Almere'
)
ON CONFLICT (slug) DO UPDATE SET
  status = EXCLUDED.status,
  sale_price = EXCLUDED.sale_price,
  updated_at = NOW();

-- Sample opslagbox insert (Type 1)
INSERT INTO public.properties (
  type, name, description, unit_number, type_number,
  gross_area, net_area, sale_price, slug,
  status, ceiling_height, parking_spaces, reservation_fee,
  features, specifications, images, location
) VALUES
(
  'opslagbox',
  'Opslagbox Type 1 - Unit 1',
  'Opslagbox Type 1 van 34m² bruto op De Steiger 74/77 in Almere. Ideaal voor opslag en kleine bedrijfsactiviteiten.',
  '1',
  1,
  33.4,
  30,
  73480,
  'opslagbox-type-1-unit-1',
  'available',
  2.70,
  0,
  1500.00,
  '["34m² bruto oppervlakte", "Veilige opslag", "Energielabel A+", "24/7 toegang", "Reservering: € 1,500"]'::jsonb,
  '{
    "ceiling": "2.70 meter vrije hoogte",
    "floors": "Betonvloer",
    "electricity": "Standaard 1x16A aansluiting",
    "internet": "Glasvezel beschikbaar",
    "access": "24/7 toegang via app en pincode",
    "security": "Beveiligingssysteem met camera''s"
  }'::jsonb,
  '["/images/up/opslagbox3.png", "/images/up/opslagbox4.png"]'::jsonb,
  'De Steiger 74/77, Almere'
)
ON CONFLICT (slug) DO UPDATE SET
  status = EXCLUDED.status,
  sale_price = EXCLUDED.sale_price,
  updated_at = NOW();
