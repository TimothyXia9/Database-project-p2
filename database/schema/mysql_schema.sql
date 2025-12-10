-- ============================================================================
-- MySQL DDL Schema for Web Series Management System (NEWS)
-- Converted from Oracle Data Modeler
-- Database: MySQL 8.0+
-- Total Tables: 13
-- ============================================================================

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS telecast;
DROP TABLE IF EXISTS subtitle_language;
DROP TABLE IF EXISTS dubbing_language;
DROP TABLE IF EXISTS web_series_release;
DROP TABLE IF EXISTS series_contract;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS episode;
DROP TABLE IF EXISTS producer_affiliation;
DROP TABLE IF EXISTS web_series;
DROP TABLE IF EXISTS producer;
DROP TABLE IF EXISTS production_house;
DROP TABLE IF EXISTS viewer_account;
DROP TABLE IF EXISTS country;

-- ============================================================================
-- Table: country
-- Description: Countries/regions where web series are released
-- ============================================================================
CREATE TABLE country (
    country_name VARCHAR(64) NOT NULL COMMENT 'Web series releasing country name',
    PRIMARY KEY (country_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: production_house
-- Description: Production companies that produce web series
-- ============================================================================
CREATE TABLE production_house (
    house_id VARCHAR(10) NOT NULL COMMENT 'Production house ID',
    name VARCHAR(64) NOT NULL COMMENT 'Production house name',
    year_established VARCHAR(10) NOT NULL COMMENT 'Year established',
    street VARCHAR(64) NOT NULL COMMENT 'Production house street address',
    city VARCHAR(64) NOT NULL COMMENT 'Production house city address',
    state VARCHAR(64) NOT NULL COMMENT 'Production house state address',
    nationality VARCHAR(20) NOT NULL COMMENT 'Production house nationality',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (house_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: producer
-- Description: Individual producers who work with production houses
-- ============================================================================
CREATE TABLE producer (
    producer_id VARCHAR(10) NOT NULL COMMENT 'Producer ID',
    first_name VARCHAR(64) NOT NULL COMMENT 'Producer first name',
    middle_name VARCHAR(64) COMMENT 'Producer middle name',
    last_name VARCHAR(64) NOT NULL COMMENT 'Producer last name',
    phone VARCHAR(15) NOT NULL COMMENT 'Producer phone number',
    street VARCHAR(64) NOT NULL COMMENT 'Producer street address',
    city VARCHAR(64) NOT NULL COMMENT 'Producer city address',
    state VARCHAR(32) NOT NULL COMMENT 'Producer state address',
    email VARCHAR(64) NOT NULL COMMENT 'Producer email address',
    nationality VARCHAR(20) NOT NULL COMMENT 'Producer nationality',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (producer_id),
    UNIQUE KEY uk_producer_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: producer_affiliation
-- Description: Many-to-many relationship between producers and production houses
-- ============================================================================
CREATE TABLE producer_affiliation (
    producer_id VARCHAR(10) NOT NULL COMMENT 'Producer ID',
    house_id VARCHAR(10) NOT NULL COMMENT 'Production house ID',
    start_date DATE NOT NULL COMMENT 'Affiliation start date',
    end_date DATE COMMENT 'Affiliation end date (NULL if currently employed)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (producer_id, house_id),
    CONSTRAINT fk_affiliation_producer FOREIGN KEY (producer_id)
        REFERENCES producer(producer_id) ON DELETE CASCADE,
    CONSTRAINT fk_affiliation_house FOREIGN KEY (house_id)
        REFERENCES production_house(house_id) ON DELETE RESTRICT,
    CONSTRAINT chk_affiliation_dates CHECK (end_date IS NULL OR end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: web_series
-- Description: Main web series table
-- ============================================================================
CREATE TABLE web_series (
    webseries_id VARCHAR(10) NOT NULL COMMENT 'Web series ID',
    title VARCHAR(64) NOT NULL COMMENT 'Web series title',
    num_episodes INT NOT NULL COMMENT 'Number of episodes',
    type VARCHAR(15) NOT NULL COMMENT 'Web series type (e.g., Drama, Comedy, Thriller)',
    house_id VARCHAR(10) NOT NULL COMMENT 'Production house ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (webseries_id),
    CONSTRAINT fk_series_house FOREIGN KEY (house_id)
        REFERENCES production_house(house_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: episode
-- Description: Individual episodes of web series
-- ============================================================================
CREATE TABLE episode (
    episode_id VARCHAR(10) NOT NULL COMMENT 'Episode ID',
    episode_number VARCHAR(10) NOT NULL COMMENT 'Episode number',
    title VARCHAR(64) COMMENT 'Episode title',
    webseries_id VARCHAR(10) NOT NULL COMMENT 'Web series ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (episode_id),
    CONSTRAINT fk_episode_series FOREIGN KEY (webseries_id)
        REFERENCES web_series(webseries_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: viewer_account
-- Description: User accounts with role-based access (Customer/Employee/Admin)
-- ============================================================================
CREATE TABLE viewer_account (
    account_id VARCHAR(10) NOT NULL COMMENT 'Account ID',
    email VARCHAR(64) NOT NULL COMMENT 'User email address',
    password_hash VARCHAR(128) NOT NULL COMMENT 'Hashed password (bcrypt)',
    role VARCHAR(16) NOT NULL DEFAULT 'Customer' COMMENT 'User role: Customer, Employee, or Admin',
    first_name VARCHAR(30) NOT NULL COMMENT 'Account owner first name',
    middle_name VARCHAR(30) COMMENT 'Account owner middle name',
    last_name VARCHAR(30) NOT NULL COMMENT 'Account owner last name',
    street VARCHAR(64) NOT NULL COMMENT 'Account owner street address',
    city VARCHAR(64) NOT NULL COMMENT 'Account owner city address',
    state VARCHAR(64) NOT NULL COMMENT 'Account owner state address',
    open_date DATE NOT NULL COMMENT 'Account open date',
    monthly_service_charge DECIMAL(10,2) NOT NULL COMMENT 'Monthly service charge',
    country_name VARCHAR(64) NOT NULL COMMENT 'Account owner country name',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (account_id),
    UNIQUE KEY uk_account_email (email),
    CONSTRAINT fk_account_country FOREIGN KEY (country_name)
        REFERENCES country(country_name) ON DELETE RESTRICT,
    CONSTRAINT chk_account_role CHECK (role IN ('Customer', 'Employee', 'Admin'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: feedback
-- Description: User ratings and reviews for web series
-- ============================================================================
CREATE TABLE feedback (
    feedback_id VARCHAR(10) NOT NULL COMMENT 'Feedback ID',
    rating TINYINT NOT NULL COMMENT 'Feedback rating (1-5)',
    feedback_text VARCHAR(128) NOT NULL COMMENT 'Feedback text',
    feedback_date DATE NOT NULL COMMENT 'Feedback date',
    account_id VARCHAR(10) NOT NULL COMMENT 'Account ID',
    webseries_id VARCHAR(10) NOT NULL COMMENT 'Web series ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (feedback_id),
    CONSTRAINT fk_feedback_account FOREIGN KEY (account_id)
        REFERENCES viewer_account(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_series FOREIGN KEY (webseries_id)
        REFERENCES web_series(webseries_id) ON DELETE CASCADE,
    CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: series_contract
-- Description: Contractual agreements for web series
-- ============================================================================
CREATE TABLE series_contract (
    contract_id VARCHAR(10) NOT NULL COMMENT 'Contract ID',
    webseries_id VARCHAR(10) NOT NULL COMMENT 'Web series ID',
    signed_date DATE NOT NULL COMMENT 'Contract sign date',
    start_date DATE NOT NULL COMMENT 'Contract start date',
    end_date DATE NOT NULL COMMENT 'Contract end date',
    charge_per_episode DECIMAL(7,2) NOT NULL COMMENT 'Charge per episode',
    status VARCHAR(16) NOT NULL COMMENT 'Contract status: Active, Expired, Terminated, Pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (contract_id),
    CONSTRAINT fk_contract_series FOREIGN KEY (webseries_id)
        REFERENCES web_series(webseries_id) ON DELETE CASCADE,
    CONSTRAINT chk_contract_charge CHECK (charge_per_episode > 0),
    CONSTRAINT chk_contract_status CHECK (status IN ('Active', 'Expired', 'Terminated', 'Pending')),
    CONSTRAINT chk_contract_dates CHECK (end_date > start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: telecast
-- Description: Broadcasting/streaming information for episodes
-- ============================================================================
CREATE TABLE telecast (
    telecast_id VARCHAR(10) NOT NULL COMMENT 'Telecast ID',
    episode_id VARCHAR(10) NOT NULL COMMENT 'Episode ID',
    start_date DATE NOT NULL COMMENT 'Start date & time of the episode',
    end_date DATE NOT NULL COMMENT 'End date & time of the episode',
    tech_interruption CHAR(1) NOT NULL DEFAULT 'N' COMMENT 'Technical interruption in telecast (Y/N)',
    total_viewers BIGINT NOT NULL DEFAULT 0 COMMENT 'Total number of viewers',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (telecast_id),
    CONSTRAINT fk_telecast_episode FOREIGN KEY (episode_id)
        REFERENCES episode(episode_id) ON DELETE CASCADE,
    CONSTRAINT chk_telecast_dates CHECK (end_date > start_date),
    CONSTRAINT chk_telecast_viewers CHECK (total_viewers >= 0),
    CONSTRAINT chk_telecast_interruption CHECK (tech_interruption IN ('Y', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: dubbing_language
-- Description: Available dubbing languages for web series
-- ============================================================================
CREATE TABLE dubbing_language (
    dubbing_language_id VARCHAR(10) NOT NULL COMMENT 'Dubbing language ID',
    language_name VARCHAR(20) NOT NULL COMMENT 'Dubbing language name',
    webseries_id VARCHAR(10) NOT NULL COMMENT 'Web series ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (dubbing_language_id),
    CONSTRAINT fk_dubbing_series FOREIGN KEY (webseries_id)
        REFERENCES web_series(webseries_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: subtitle_language
-- Description: Available subtitle languages for web series
-- ============================================================================
CREATE TABLE subtitle_language (
    subtitle_language_id VARCHAR(10) NOT NULL COMMENT 'Subtitle language ID',
    language_name VARCHAR(20) NOT NULL COMMENT 'Subtitle language name',
    webseries_id VARCHAR(10) NOT NULL COMMENT 'Web series ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (subtitle_language_id),
    CONSTRAINT fk_subtitle_series FOREIGN KEY (webseries_id)
        REFERENCES web_series(webseries_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: web_series_release
-- Description: Release information by country
-- ============================================================================
CREATE TABLE web_series_release (
    webseries_id VARCHAR(10) NOT NULL COMMENT 'Web series ID',
    country_name VARCHAR(64) NOT NULL COMMENT 'Web series releasing country name',
    release_date DATE NOT NULL COMMENT 'Web series release date',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    PRIMARY KEY (webseries_id, country_name),
    CONSTRAINT fk_release_series FOREIGN KEY (webseries_id)
        REFERENCES web_series(webseries_id) ON DELETE CASCADE,
    CONSTRAINT fk_release_country FOREIGN KEY (country_name)
        REFERENCES country(country_name) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
