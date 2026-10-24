-- Flyway V3: Change departure_icao and arrival_icao from CHAR(4) to VARCHAR(4)
-- to match the JPA entity mapping (String -> VARCHAR)
ALTER TABLE flight_logs
    ALTER COLUMN departure_icao TYPE VARCHAR(4),
    ALTER COLUMN arrival_icao   TYPE VARCHAR(4);
