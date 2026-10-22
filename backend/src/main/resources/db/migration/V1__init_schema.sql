-- V1: Initial schema

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN', 'ENGINEER', 'AUDITOR')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ
);

CREATE TABLE aircraft (
    id           BIGSERIAL PRIMARY KEY,
    registration VARCHAR(20)     NOT NULL UNIQUE,
    type         VARCHAR(100)    NOT NULL,
    manufacturer VARCHAR(100),
    serial_no    VARCHAR(100),
    total_hours  NUMERIC(10, 1)  NOT NULL DEFAULT 0,
    total_cycles INTEGER         NOT NULL DEFAULT 0,
    status       VARCHAR(20)     NOT NULL CHECK (status IN ('ACTIVE', 'GROUNDED', 'MAINTENANCE', 'RETIRED')),
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ
);

CREATE TABLE components (
    id              BIGSERIAL PRIMARY KEY,
    aircraft_id     BIGINT          NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
    part_number     VARCHAR(100)    NOT NULL,
    serial_no       VARCHAR(100),
    name            VARCHAR(255)    NOT NULL,
    hours_since_new NUMERIC(10, 1),
    cycles_since_new INTEGER,
    installed_date  DATE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE flight_logs (
    id             BIGSERIAL PRIMARY KEY,
    aircraft_id    BIGINT          NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
    flight_date    DATE            NOT NULL,
    hours_flown    NUMERIC(5, 1)   NOT NULL,
    cycles         INTEGER         NOT NULL,
    pilot_name     VARCHAR(255),
    departure_icao CHAR(4),
    arrival_icao   CHAR(4),
    created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE task_templates (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    interval_hours  INTEGER,
    interval_cycles INTEGER,
    interval_days   INTEGER,
    applies_to_type VARCHAR(100)
);

CREATE TABLE maintenance_records (
    id                   BIGSERIAL PRIMARY KEY,
    aircraft_id          BIGINT          NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
    component_id         BIGINT          REFERENCES components(id),
    template_id          BIGINT          NOT NULL REFERENCES task_templates(id),
    performed_date       DATE            NOT NULL,
    hours_at_completion  NUMERIC(10, 1)  NOT NULL,
    cycles_at_completion INTEGER         NOT NULL,
    performed_by         VARCHAR(255)    NOT NULL,
    remarks              TEXT,
    certified_by         VARCHAR(255),
    created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE airworthiness_directives (
    id                  BIGSERIAL PRIMARY KEY,
    ad_number           VARCHAR(50)  NOT NULL UNIQUE,
    title               VARCHAR(255) NOT NULL,
    applies_to_type     VARCHAR(100),
    effective_date      DATE,
    compliance_deadline DATE,
    is_recurring        BOOLEAN      NOT NULL DEFAULT FALSE,
    description         TEXT
);

CREATE TABLE ad_compliance (
    id           BIGSERIAL PRIMARY KEY,
    aircraft_id  BIGINT      NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
    ad_id        BIGINT      NOT NULL REFERENCES airworthiness_directives(id),
    status       VARCHAR(20) NOT NULL CHECK (status IN ('NOT_APPLICABLE','PENDING','COMPLIED','OVERDUE')),
    complied_date DATE,
    remarks      TEXT,
    updated_at   TIMESTAMPTZ,
    UNIQUE (aircraft_id, ad_id)
);

CREATE TABLE documents (
    id          BIGSERIAL PRIMARY KEY,
    aircraft_id BIGINT       NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
    record_id   BIGINT,
    file_name   VARCHAR(255) NOT NULL,
    doc_type    VARCHAR(100),
    file_path   VARCHAR(512) NOT NULL,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT,
    entity     VARCHAR(100) NOT NULL,
    entity_id  BIGINT,
    action     VARCHAR(50)  NOT NULL,
    old_value  TEXT,
    new_value  TEXT,
    timestamp  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes for common lookups
CREATE INDEX idx_flight_logs_aircraft ON flight_logs(aircraft_id);
CREATE INDEX idx_maintenance_records_aircraft ON maintenance_records(aircraft_id);
CREATE INDEX idx_maintenance_records_template ON maintenance_records(aircraft_id, template_id);
CREATE INDEX idx_ad_compliance_aircraft ON ad_compliance(aircraft_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity, entity_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
