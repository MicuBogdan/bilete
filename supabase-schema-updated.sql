-- Schema actualizată cu zone laterale și jos

-- Drop table-urile vechi dacă există
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS hall_config CASCADE;

-- Tabel pentru configurare sală
CREATE TABLE hall_config (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(50) UNIQUE NOT NULL,
    total_seats INTEGER NOT NULL,
    rows INTEGER,
    cols INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel pentru scaune (versiune nouă cu zone)
CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    zone VARCHAR(50) NOT NULL, -- 'A', 'B', 'LEFT', 'RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT'
    row_number INTEGER,
    seat_number INTEGER,
    position_order INTEGER, -- Pentru zone fără rânduri (laterale, jos)
    is_disabled BOOLEAN DEFAULT FALSE,
    is_occupied BOOLEAN DEFAULT FALSE,
    occupant_name VARCHAR(255),
    occupant_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel pentru rezervari
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    group_size INTEGER NOT NULL,
    seat_ids INTEGER[] NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index-uri
CREATE INDEX idx_seats_zone ON seats(zone);
CREATE INDEX idx_seats_status ON seats(is_disabled, is_occupied);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_hal_config_zone ON hall_config(zone_name);

-- Inițializare configurare sală
INSERT INTO hall_config (zone_name, total_seats, rows, cols, description) VALUES
('A', 204, 17, 12, 'Zona principală A - 17 rânduri x 12 scaune'),
('B', 204, 17, 12, 'Zona principală B - 17 rânduri x 12 scaune'),
('LEFT', 0, NULL, NULL, 'Laterala stânga - configurable'),
('RIGHT', 0, NULL, NULL, 'Laterala dreapta - configurable'),
('BOTTOM_LEFT', 0, NULL, NULL, 'Zona jos stânga - configurable'),
('BOTTOM_RIGHT', 0, NULL, NULL, 'Zona jos dreapta - configurable');

-- Inițializare scaune pentru zona A și B (17 rânduri x 12 coloane fiecare)
DO $$
DECLARE
    z VARCHAR(50);
    r INTEGER;
    s INTEGER;
BEGIN
    FOR z IN SELECT unnest(ARRAY['A', 'B']::text[]) LOOP
        FOR r IN 1..17 LOOP
            FOR s IN 1..12 LOOP
                INSERT INTO seats (zone, row_number, seat_number) 
                VALUES (z, r, s);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_config ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON seats
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON reservations
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON hall_config
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON seats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON seats
    FOR UPDATE USING (true);

CREATE POLICY "Enable insert for authenticated users" ON reservations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON reservations
    FOR UPDATE USING (true);

CREATE POLICY "Enable insert for authenticated users" ON hall_config
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON hall_config
    FOR UPDATE USING (true);
