-- Schema pentru baza de date Supabase

-- Tabel pentru scaune
CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    zone VARCHAR(1) NOT NULL, -- 'A' sau 'B'
    row_number INTEGER NOT NULL,
    seat_number INTEGER NOT NULL,
    is_disabled BOOLEAN DEFAULT FALSE,
    is_occupied BOOLEAN DEFAULT FALSE,
    occupant_name VARCHAR(255),
    occupant_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(zone, row_number, seat_number)
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

-- Index pentru cautari rapide
CREATE INDEX idx_seats_zone_row ON seats(zone, row_number);
CREATE INDEX idx_seats_status ON seats(is_disabled, is_occupied);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Initializare scaune pentru ambele zone (17 randuri x 12 coloane fiecare)
DO $$
DECLARE
    z VARCHAR(1);
    r INTEGER;
    s INTEGER;
BEGIN
    FOR z IN SELECT unnest(ARRAY['A', 'B']) LOOP
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

-- Policy pentru citire (toata lumea poate citi)
CREATE POLICY "Enable read access for all users" ON seats
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON reservations
    FOR SELECT USING (true);

-- Policy pentru scriere (doar pentru autentificare via service role sau admin)
CREATE POLICY "Enable insert for authenticated users" ON seats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON seats
    FOR UPDATE USING (true);

CREATE POLICY "Enable insert for authenticated users" ON reservations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON reservations
    FOR UPDATE USING (true);
