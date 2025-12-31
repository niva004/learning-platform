-- ============================================
-- The SHARKS - PostgreSQL Database Schema
-- ============================================
-- Wersja: 1.0
-- Data: 2025
-- ============================================

-- Usunięcie istniejących tabel (jeśli istnieją)
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- ============================================
-- Tabela użytkowników
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'INSTRUCTOR')),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100),
    reset_token VARCHAR(100),
    reset_token_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy dla users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- Tabela kursów
-- ============================================
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'PLN',
    level VARCHAR(20) DEFAULT 'BASIC' CHECK (level IN ('BASIC', 'INTERMEDIATE', 'ADVANCED')),
    duration_hours INTEGER DEFAULT 0,
    lessons_count INTEGER DEFAULT 0,
    thumbnail_url VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy dla courses
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_courses_level ON courses(level);

-- ============================================
-- Tabela lekcji
-- ============================================
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    video_url VARCHAR(500),
    duration_minutes INTEGER DEFAULT 0,
    order_number INTEGER NOT NULL DEFAULT 0,
    is_free_preview BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy dla lessons
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_number);

-- ============================================
-- Tabela zakupów
-- ============================================
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Indeksy dla purchases
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_course ON purchases(course_id);
CREATE INDEX idx_purchases_status ON purchases(payment_status);

-- ============================================
-- Tabela postępu lekcji
-- ============================================
CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_position_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Indeksy dla lesson_progress
CREATE INDEX idx_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_progress_lesson ON lesson_progress(lesson_id);

-- ============================================
-- Tabela ustawień
-- ============================================
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Funkcja aktualizacji timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggery dla aktualizacji updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Dane początkowe
-- ============================================

-- Admin user (hasło: admin123 - ZMIEŃ PO INSTALACJI!)
-- Hash wygenerowany przez password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO users (email, password_hash, name, role, is_active, email_verified) VALUES
('admin@thesharks.pl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'ADMIN', TRUE, TRUE);

-- Przykładowe kursy
INSERT INTO courses (slug, name, description, short_description, price, level, duration_hours, lessons_count, is_published, is_featured) VALUES
('trading-podstawy', 'Trading od podstaw', 'Kompleksowy kurs dla osób początkujących w tradingu. Nauczysz się podstaw analizy technicznej, zarządzania ryzykiem i korzystania z platform tradingowych.', 'Kurs dla osób początkujących. Nauczysz się podstaw analizy technicznej i zarządzania ryzykiem.', 299.00, 'BASIC', 6, 12, TRUE, TRUE),
('strategie-zaawansowane', 'Strategie i analiza', 'Dla osób znających podstawy. Zaawansowane formacje, strategie day tradingu, analiza wolumenu i budowanie systemu tradingowego.', 'Zaawansowane formacje, strategie day tradingu i budowanie systemu tradingowego.', 499.00, 'ADVANCED', 10, 20, TRUE, TRUE);

-- Przykładowe lekcje dla kursu podstawowego
INSERT INTO lessons (course_id, title, description, duration_minutes, order_number, is_free_preview, is_published) VALUES
(1, 'Wprowadzenie do tradingu', 'Czym jest trading i jak zacząć swoją przygodę z rynkami finansowymi.', 30, 1, TRUE, TRUE),
(1, 'Podstawy analizy technicznej', 'Nauka czytania wykresów i rozpoznawania podstawowych formacji.', 45, 2, FALSE, TRUE),
(1, 'Świece japońskie', 'Szczegółowe omówienie formacji świecowych i ich znaczenia.', 40, 3, FALSE, TRUE),
(1, 'Wskaźniki techniczne', 'Najpopularniejsze wskaźniki: RSI, MACD, średnie kroczące.', 50, 4, FALSE, TRUE),
(1, 'Zarządzanie ryzykiem', 'Jak ustawiać stop-loss i określać wielkość pozycji.', 35, 5, FALSE, TRUE),
(1, 'Psychologia tradingu', 'Kontrola emocji i budowanie dyscypliny.', 30, 6, FALSE, TRUE);

-- Przykładowe lekcje dla kursu zaawansowanego
INSERT INTO lessons (course_id, title, description, duration_minutes, order_number, is_free_preview, is_published) VALUES
(2, 'Zaawansowane formacje cenowe', 'Głowa i ramiona, podwójne szczyty, flagi i chorągiewki.', 60, 1, TRUE, TRUE),
(2, 'Analiza wolumenu', 'Jak wykorzystać wolumen w analizie technicznej.', 45, 2, FALSE, TRUE),
(2, 'Strategie day tradingu', 'Praktyczne strategie do handlu dziennego.', 55, 3, FALSE, TRUE),
(2, 'Budowanie systemu tradingowego', 'Jak stworzyć własny system i go testować.', 70, 4, FALSE, TRUE);

-- Ustawienia domyślne
INSERT INTO settings (key, value, description) VALUES
('site_name', 'The SHARKS', 'Nazwa strony'),
('site_description', 'Profesjonalne szkolenia tradingowe', 'Opis strony'),
('currency', 'PLN', 'Domyślna waluta'),
('maintenance_mode', 'false', 'Tryb konserwacji'),
('registration_enabled', 'true', 'Czy rejestracja jest włączona');
