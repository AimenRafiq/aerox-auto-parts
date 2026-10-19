-- ==============================================================================
-- Aerox Auto Parts — Schema Migration 003: Development Seed Data
-- Target: PostgreSQL / Supabase
-- WARNING: FOR DEVELOPMENT / STAGING SEEDING ONLY. DO NOT RUN IN PRODUCTION.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Insert Categories
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Braking Systems', 'braking-systems', 'Brake pads, coated rotors, hydraulic calipers, and lines.', 1, true),
  ('c1000000-0000-0000-0000-000000000002', 'Suspension & Steering', 'suspension-steering', 'Struts, control arms, sway bar links, and shock absorbers.', 2, true),
  ('c1000000-0000-0000-0000-000000000003', 'Filters & Maintenance', 'filters-maintenance', 'OEM replacement engine air filters, oil filters, and cabin HEPA filters.', 3, true),
  ('c1000000-0000-0000-0000-000000000004', 'Engine & Drivetrain', 'engine-drivetrain', 'Spark plugs, ignition coils, timing components, and gaskets.', 4, true),
  ('c1000000-0000-0000-0000-000000000005', 'Electrical & Lighting', 'electrical-lighting', 'Alternators, starter motors, headlamp units, and engine sensors.', 5, true),
  ('c1000000-0000-0000-0000-000000000006', 'Cooling & Heating', 'cooling-heating', 'Radiators, water pumps, thermostats, and heater cores.', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 2. Insert Brands
-- ------------------------------------------------------------------------------
INSERT INTO public.brands (id, name, slug, is_active)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Brembo', 'brembo', true),
  ('b1000000-0000-0000-0000-000000000002', 'Bosch', 'bosch', true),
  ('b1000000-0000-0000-0000-000000000003', 'Bilstein', 'bilstein', true),
  ('b1000000-0000-0000-0000-000000000004', 'Denso', 'denso', true),
  ('b1000000-0000-0000-0000-000000000005', 'NGK', 'ngk', true),
  ('b1000000-0000-0000-0000-000000000006', 'Mann-Filter', 'mann-filter', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 3. Insert development sample parts. This seed intentionally contains no
-- vehicle or fitment records because no compatibility data source is approved.
-- ------------------------------------------------------------------------------
INSERT INTO public.products (
  id,
  sku,
  name,
  slug,
  short_description,
  description,
  brand_id,
  category_id,
  price,
  compare_at_price,
  currency,
  stock_quantity,
  is_published,
  weight,
  dimensions
)
VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'BRM-P28076N',
    'Brembo Prime Ceramic Front Brake Pad Set',
    'brembo-prime-ceramic-front-brake-pad-set',
    'Low-dust ceramic formulation designed for OE stopping power and minimal rotor wear.',
    'Manufactured using multi-layer shim damping technology to eliminate squeal and brake vibration. Engineered with positive molding processes for high-density friction material. Meets and exceeds standard SAE J661 friction test procedures.',
    'b1000000-0000-0000-0000-000000000001', -- Brembo
    'c1000000-0000-0000-0000-000000000001', -- Braking
    68.50,
    79.99,
    'USD',
    42,
    true,
    1.85,
    '145mm x 55mm x 16.5mm'
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'BRM-09A76111',
    'Brembo UV-Coated Front Vented Brake Rotor',
    'brembo-uv-coated-front-vented-brake-rotor',
    'Anti-corrosion UV coating with high carbon content for thermal stability.',
    'High-carbon cast iron rotor designed to minimize thermal distortion and braking shudder under repeated load cycles. UV metallic coating on the hat and outer edge protects against rust and road salt degradation.',
    'b1000000-0000-0000-0000-000000000001', -- Brembo
    'c1000000-0000-0000-0000-000000000001', -- Braking
    124.00,
    139.00,
    'USD',
    28,
    true,
    8.20,
    '282mm Outer Diameter, 23mm Nominal Thickness'
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    'BIL-24-218206',
    'Bilstein B6 Performance Front Shock Absorber',
    'bilstein-b6-performance-front-shock-absorber',
    'Monotube gas-pressure damper designed for enhanced vehicle control and stability.',
    'Bilstein B6 dampers utilize monotube gas-pressure construction to resist fluid aeration and fade under prolonged driving conditions. Calibrated for factory springs to improve damping response without lowering chassis height.',
    'b1000000-0000-0000-0000-000000000003', -- Bilstein
    'c1000000-0000-0000-0000-000000000002', -- Suspension
    189.95,
    NULL,
    'USD',
    16,
    true,
    3.80,
    '520mm Extended Length'
  ),
  (
    'p1000000-0000-0000-0000-000000000004',
    'BSH-16010729',
    'Bosch QuietCast Premium Disc Brake Rotor',
    'bosch-quietcast-premium-disc-brake-rotor',
    'Precision balanced vented rotor with bi-metal aluminum and zinc coating.',
    'Factory mill-balanced to prevent pedal pulsation and steering wheel vibration. Clean-look coating prevents corrosion on non-friction surfaces. Cast with G3000 heat-flowed iron for durability.',
    'b1000000-0000-0000-0000-000000000002', -- Bosch
    'c1000000-0000-0000-0000-000000000001', -- Braking
    78.25,
    89.00,
    'USD',
    35,
    true,
    7.40,
    '296mm Outer Diameter, 28mm Vented'
  ),
  (
    'p1000000-0000-0000-0000-000000000005',
    'MAN-C28038',
    'Mann-Filter Premium Engine Air Filter',
    'mann-filter-premium-engine-air-filter',
    'High particulate separation efficiency and low flow resistance.',
    'Multi-pleat embossed filter paper structure provides consistent air permeability and high dirt retention capacity throughout service intervals. Polyurethane seal ring conforms precisely to airbox housing to prevent unfiltered bypass air.',
    'b1000000-0000-0000-0000-000000000006', -- Mann-Filter
    'c1000000-0000-0000-0000-000000000003', -- Filters
    22.95,
    NULL,
    'USD',
    64,
    true,
    0.35,
    '278mm x 185mm x 45mm'
  ),
  (
    'p1000000-0000-0000-0000-000000000006',
    'DEN-673-1309',
    'Denso Direct Ignition Coil',
    'denso-direct-ignition-coil',
    'Original equipment ignition coil delivering fast rise times and high spark energy.',
    'Engineered with magnetic silicone steel laminations and tight secondary winding count for secondary voltage delivery up to 35,000V. Epoxy resin encapsulation prevents electrical breakdown and moisture intrusion.',
    'b1000000-0000-0000-0000-000000000004', -- Denso
    'c1000000-0000-0000-0000-000000000004', -- Engine
    54.00,
    62.50,
    'USD',
    24,
    true,
    0.42,
    '160mm Height, 4-Pin Connector'
  ),
  (
    'p1000000-0000-0000-0000-000000000007',
    'NGK-94461-4PK',
    'NGK Laser Iridium Spark Plug (Pack of 4)',
    'ngk-laser-iridium-spark-plug-pack-of-4',
    'Laser-welded 0.6mm iridium center electrode with platinum ground electrode.',
    'Engineered for long service intervals up to 100,000 miles. Fine-wire center tip concentrates electrical field for improved cold starting and reduced ignition voltage demand. Trivalent metal plating provides corrosion resistance.',
    'b1000000-0000-0000-0000-000000000005', -- NGK
    'c1000000-0000-0000-0000-000000000004', -- Engine
    46.80,
    52.00,
    'USD',
    50,
    true,
    0.28,
    '14mm Thread, 26.5mm Reach, 0.032" Gap'
  ),
  (
    'p1000000-0000-0000-0000-000000000008',
    'BSH-6055C',
    'Bosch HEPA Cabin Air Filter',
    'bosch-hepa-cabin-air-filter',
    'True HEPA media capturing 99.97% of airborne particles at 0.3 microns.',
    'Features a multi-layer melt-blown media structure with support scrim. Eliminates pollen, brake dust, and fine particulate emissions from entering the vehicle passenger ventilation system.',
    'b1000000-0000-0000-0000-000000000002', -- Bosch
    'c1000000-0000-0000-0000-000000000003', -- Filters
    21.50,
    26.00,
    'USD',
    80,
    true,
    0.22,
    '215mm x 200mm x 30mm'
  )
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  is_published = EXCLUDED.is_published;
