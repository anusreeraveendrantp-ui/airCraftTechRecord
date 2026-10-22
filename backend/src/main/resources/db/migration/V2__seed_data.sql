-- V2: Seed data for demo/recruiter walkthrough
-- Password for all users is: Password123!  (BCrypt hash)

INSERT INTO users (name, email, password_hash, role) VALUES
    ('Admin User',    'admin@techrecords.dev',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LnPMx0MnPwy', 'ADMIN'),
    ('Alice Engineer','alice@techrecords.dev',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LnPMx0MnPwy', 'ENGINEER'),
    ('Bob Auditor',   'auditor@techrecords.dev',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LnPMx0MnPwy', 'AUDITOR');

INSERT INTO aircraft (registration, type, manufacturer, serial_no, total_hours, total_cycles, status) VALUES
    ('VT-ABC', 'Cessna 172',  'Cessna',   'C172-00123', 2340.5,  1872, 'ACTIVE'),
    ('VT-DEF', 'Cessna 172',  'Cessna',   'C172-00456', 5820.0,  4210, 'ACTIVE'),
    ('VT-GHI', 'ATR 72-600',  'ATR',      'ATR72-0991', 12450.0, 9340, 'ACTIVE'),
    ('VT-JKL', 'ATR 72-600',  'ATR',      'ATR72-1102', 8930.0,  6811, 'MAINTENANCE'),
    ('VT-MNO', 'Beechcraft Baron', 'Beechcraft', 'BE58-2241', 4120.5, 3108, 'ACTIVE'),
    ('VT-PQR', 'Cessna 172',  'Cessna',   'C172-00789', 780.0,   621,  'ACTIVE'),
    ('VT-STU', 'Piper PA-28', 'Piper',    'PA28-15522', 6201.0,  5104, 'GROUNDED');

-- Task templates
INSERT INTO task_templates (title, description, interval_hours, interval_cycles, interval_days) VALUES
    ('100-Hour Inspection',        'Full airframe and engine inspection per manufacturer''s maintenance manual', 100,  NULL, NULL),
    ('Annual Inspection',          'Annual airworthiness inspection required by DGCA regulations',              NULL, NULL, 365),
    ('Oil Change',                 'Engine oil and filter replacement',                                         50,   NULL, NULL),
    ('ELT Battery Check',          'Emergency Locator Transmitter battery replacement/inspection',              NULL, NULL, 365),
    ('Pitot-Static System Check',  'Altimeter and pitot-static system certification test',                      NULL, NULL, 730),
    ('VOR Receiver Check',         'VOR navigation receiver accuracy check',                                    NULL, NULL, 30 ),
    ('Landing Gear Inspection',    'Retractable gear inspection — lubrication, rigging, and safety systems',    500,  NULL, NULL),
    ('Propeller Dynamic Balance',  'Dynamic balancing of propeller assembly',                                   1000, NULL, NULL),
    ('Engine TBO Overhaul',        'Time Between Overhaul engine rebuild per manufacturer limits',              2000, NULL, NULL),
    ('Transponder Check',          'Transponder and altitude encoder certification',                             NULL, NULL, 730);

-- Cessna 172-specific template
INSERT INTO task_templates (title, description, interval_hours, interval_cycles, interval_days, applies_to_type) VALUES
    ('Lycoming O-320 Spark Plug Rotation', 'Rotate and clean spark plugs — Lycoming O-320 engine', 100, NULL, NULL, 'Cessna 172');

-- ATR 72-specific template
INSERT INTO task_templates (title, description, interval_hours, interval_cycles, interval_days, applies_to_type) VALUES
    ('ATR 72 C-Check',  'Heavy maintenance C-Check inspection', 3000, NULL, NULL, 'ATR 72-600');

-- Airworthiness Directives
INSERT INTO airworthiness_directives (ad_number, title, applies_to_type, effective_date, compliance_deadline, is_recurring, description) VALUES
    ('FAA-2023-0112', 'Cessna 172 Fuel System Inspection',      'Cessna 172',   '2023-03-01', '2023-09-01', FALSE, 'Inspect fuel selector valve for possible contamination per SB-2023-007.'),
    ('FAA-2024-0045', 'Cessna 172 Elevator Control Rod Check',  'Cessna 172',   '2024-01-15', '2024-07-15', FALSE, 'Inspect elevator control rod end fittings for corrosion.'),
    ('EASA-2023-0230','ATR 72 Landing Gear Actuator Inspection','ATR 72-600',   '2023-06-01', '2024-06-01', TRUE,  'Recurring inspection of main landing gear actuator seals per ATR SB 57-5055.'),
    ('DGCA-2024-0018','All Types — ELT Software Update',        NULL,           '2024-02-01', '2024-08-01', FALSE, 'Update ELT firmware to version 3.2 or later to comply with new distress frequency standards.');

-- Maintenance records (most are current; a few are old enough to be OVERDUE)
-- VT-ABC (2340.5 h, 1872 cycles): last 100-hr at 2300 h → next due at 2400 h → NOT overdue yet
INSERT INTO maintenance_records (aircraft_id, template_id, performed_date, hours_at_completion, cycles_at_completion, performed_by, certified_by, remarks)
VALUES (1, 1, CURRENT_DATE - INTERVAL '25 days', 2300.0, 1840, 'Alice Engineer', 'Alice Engineer', '100-hour completed. All items satisfactory.');

-- VT-ABC: Oil change last at 2280 h → next due 2330 → OVERDUE (current 2340.5)
INSERT INTO maintenance_records (aircraft_id, template_id, performed_date, hours_at_completion, cycles_at_completion, performed_by, remarks)
VALUES (1, 3, CURRENT_DATE - INTERVAL '60 days', 2280.0, 1810, 'Bob Mechanic', 'Oil and filter replaced, filter cut-check normal.');

-- VT-ABC: Annual — last done over 13 months ago → OVERDUE
INSERT INTO maintenance_records (aircraft_id, template_id, performed_date, hours_at_completion, cycles_at_completion, performed_by, certified_by, remarks)
VALUES (1, 2, CURRENT_DATE - INTERVAL '400 days', 2050.0, 1640, 'Alice Engineer', 'Alice Engineer', 'Annual inspection. Minor squawks resolved.');

-- VT-GHI (ATR 72, 12450 h): Engine TBO last at 10500 h → next due 12500 → DUE_SOON
INSERT INTO maintenance_records (aircraft_id, template_id, performed_date, hours_at_completion, cycles_at_completion, performed_by, certified_by, remarks)
VALUES (3, 9, CURRENT_DATE - INTERVAL '540 days', 10500.0, 7900, 'ATR MRO Team', 'DGCA Inspector', 'Engine 1 overhauled per Pratt & Whitney CMM.');

-- VT-GHI: C-Check last at 9500 h → next due 12500 → DUE_SOON  
INSERT INTO maintenance_records (aircraft_id, template_id, performed_date, hours_at_completion, cycles_at_completion, performed_by, certified_by, remarks)
VALUES (3, 12, CURRENT_DATE - INTERVAL '900 days', 9500.0, 7100, 'ATR MRO Team', 'DGCA Inspector', 'C-Check completed at certified MRO facility.');

-- AD compliance records
INSERT INTO ad_compliance (aircraft_id, ad_id, status, complied_date, remarks) VALUES
    (1, 1, 'COMPLIED', CURRENT_DATE - INTERVAL '45 days', 'Fuel selector valve inspected — no anomalies found.'),
    (2, 1, 'COMPLIED', CURRENT_DATE - INTERVAL '30 days', 'Complied per AD requirements.'),
    (3, 3, 'COMPLIED', CURRENT_DATE - INTERVAL '10 days', 'Landing gear actuator seals replaced — recurring interval reset.'),
    (4, 3, 'OVERDUE',  NULL, 'Maintenance ongoing; aircraft currently in hangar.'),
    (1, 4, 'COMPLIED', CURRENT_DATE - INTERVAL '20 days', 'ELT firmware updated to v3.2.'),
    (2, 2, 'PENDING',  NULL, 'Elevator control rod inspection scheduled for next 100-hr.');
