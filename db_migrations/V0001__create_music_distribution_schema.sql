-- Users table with role-based access
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('artist', 'label', 'admin')),
    avatar_url TEXT,
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Releases table for music tracks and albums
CREATE TABLE releases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    release_type VARCHAR(50) NOT NULL CHECK (release_type IN ('single', 'ep', 'album')),
    cover_url TEXT,
    release_date DATE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'pending', 'published', 'rejected')) DEFAULT 'draft',
    upc VARCHAR(50),
    genre VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracks table for individual songs in releases
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    release_id INTEGER REFERENCES releases(id),
    title VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    isrc VARCHAR(50),
    track_number INTEGER,
    explicit BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table for streaming data
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    release_id INTEGER REFERENCES releases(id),
    platform VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    streams INTEGER DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financials table for royalty tracking
CREATE TABLE financials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    release_id INTEGER REFERENCES releases(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    platform VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'paid')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo data for artists
INSERT INTO users (email, name, role, country) VALUES
('artist@example.com', 'Андрей Волков', 'artist', 'Russia'),
('label@example.com', 'Independent Records', 'label', 'USA'),
('admin@example.com', 'Администратор', 'admin', 'Russia');

-- Insert demo releases
INSERT INTO releases (user_id, title, artist_name, release_type, release_date, status, genre) VALUES
(1, 'Летний вечер', 'Андрей Волков', 'single', '2025-01-15', 'published', 'Pop'),
(1, 'Ночной город', 'Андрей Волков', 'single', '2024-11-20', 'published', 'Electronic'),
(1, 'Первый альбом', 'Андрей Волков', 'album', '2025-02-01', 'pending', 'Pop'),
(2, 'Summer Vibes', 'Various Artists', 'ep', '2024-12-10', 'published', 'House');

-- Insert demo tracks
INSERT INTO tracks (release_id, title, duration, track_number) VALUES
(1, 'Летний вечер', 215, 1),
(2, 'Ночной город', 198, 1),
(3, 'Вступление', 180, 1),
(3, 'Главная тема', 240, 2),
(3, 'Финал', 200, 3);

-- Insert demo analytics
INSERT INTO analytics (release_id, platform, country, streams, date) VALUES
(1, 'Spotify', 'Russia', 15420, '2025-11-01'),
(1, 'Spotify', 'Russia', 18650, '2025-11-02'),
(1, 'Spotify', 'Russia', 22100, '2025-11-03'),
(1, 'Apple Music', 'Russia', 8900, '2025-11-01'),
(1, 'Apple Music', 'Russia', 9200, '2025-11-02'),
(1, 'Yandex Music', 'Russia', 12400, '2025-11-01'),
(2, 'Spotify', 'USA', 5200, '2025-11-01'),
(2, 'Spotify', 'Russia', 8900, '2025-11-01');

-- Insert demo financials
INSERT INTO financials (user_id, release_id, amount, platform, period_start, period_end, status) VALUES
(1, 1, 1245.50, 'Spotify', '2025-10-01', '2025-10-31', 'paid'),
(1, 1, 1580.20, 'Spotify', '2025-11-01', '2025-11-08', 'processing'),
(1, 2, 420.80, 'Apple Music', '2025-10-01', '2025-10-31', 'paid'),
(2, 4, 890.00, 'Spotify', '2025-10-01', '2025-10-31', 'pending');