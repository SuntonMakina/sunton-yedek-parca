-- ==============================================================================
-- SUNTON & HSG TEDARİK ZİNCİRİ VE YEDEK PARÇA TAKİP SİSTEMİ
-- SUPABASE POSTGRESQL VERİTABANI ŞEMASI (schema.sql - v1.1)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TEDARİKÇİLER TABLOSU
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('turkey', 'china', 'global')),
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
    location VARCHAR(150) NOT NULL,
    api_protocol VARCHAR(50) DEFAULT 'REST v2.1',
    api_status VARCHAR(50) DEFAULT 'Senkronize' CHECK (api_status IN ('Senkronize', 'API Hatası', 'Beklemede', 'Pasif')),
    active_demands_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENVANTER / YEDEK PARÇA STOKLARI TABLOSU
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Genel',
    description TEXT,
    depot VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_alert_qty INT NOT NULL DEFAULT 10,
    unit VARCHAR(20) DEFAULT 'Adet',
    status VARCHAR(50) GENERATED ALWAYS AS (
        CASE 
            WHEN quantity <= min_alert_qty THEN 'Kritik'
            WHEN quantity > (min_alert_qty * 4) THEN 'Fazla'
            ELSE 'Normal'
        END
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TALEPLER TABLOSU
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_no VARCHAR(50) UNIQUE NOT NULL,
    company VARCHAR(150) NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255),
    part_sku VARCHAR(100) NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Acil', 'Kritik')),
    supply_channel VARCHAR(50) NOT NULL CHECK (supply_channel IN ('HSG Çin', 'Yerel Depo')),
    notes TEXT,
    chat_image TEXT,
    status VARCHAR(100) DEFAULT 'Talep Açıldı / Mesaj Bekleniyor',
    stage_step INT DEFAULT 1 CHECK (stage_step BETWEEN 1 AND 6),
    stage_label VARCHAR(100) DEFAULT 'Talep Açıldı / Mesaj Bekleniyor',
    hsg_status VARCHAR(255) DEFAULT 'Tedarikçiye Soruldu',
    tracking_code VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SEVKİYATLAR TABLOSU (Tedarikçi ve Tahmini Süre Alanları Dahil)
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_code VARCHAR(100) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255) NOT NULL, -- İlgili Tedarikçi / Firma
    carrier VARCHAR(100) NOT NULL,
    transport_mode VARCHAR(50) NOT NULL CHECK (transport_mode IN ('Denizyolu', 'Havayolu', 'Karayolu')),
    container_or_flight_no VARCHAR(100),
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    cargo_summary VARCHAR(255) NOT NULL,
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    eta_date VARCHAR(100) NOT NULL, -- örn: '7 Gün' veya '28 Ekim 2024'
    status VARCHAR(50) DEFAULT 'Yolda' CHECK (status IN ('Hazırlanıyor', 'Yolda', 'Gümrükte', 'Teslim Edildi', 'Gecikmede')),
    customs_status VARCHAR(150) DEFAULT 'Gümrük İncelemesinde',
    associated_request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HATIRLATICILAR TABLOSU (Tedarikçi Bağlantılı)
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255),
    target_type VARCHAR(50) NOT NULL, -- 'HSG Çin', 'Müşteri Onayı', 'Lojistik & Gümrük'
    reference_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline_days INT NOT NULL DEFAULT 5,
    priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Acil', 'Kritik')),
    status VARCHAR(50) DEFAULT 'Bekliyor' CHECK (status IN ('Bekliyor', 'Yanıtlandı', 'Tamamlandı')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access on suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on requests" ON requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on shipments" ON shipments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on reminders" ON reminders FOR ALL USING (true) WITH CHECK (true);

-- Örnek Başlangıç Tedarikçileri
INSERT INTO suppliers (name, code, category, contact_person, location, api_protocol, api_status, active_demands_count) VALUES
('Anadolu Hidrolik Makina', 'TR-IST-042', 'turkey', 'Kerem Yılmaz', 'İstanbul, TR', 'REST v2.1', 'Senkronize', 14),
('HSG Shanghai Precision Parts', 'CN-SH-109', 'china', 'Li Wei', 'Şanghay, Çin', 'GraphQL', 'Senkronize', 32),
('Marmara Yedek Parça Ltd.', 'TR-BUR-019', 'turkey', 'Ayşe Demir', 'Bursa, TR', 'REST v2.1', 'API Hatası', 5),
('HSG Guangzhou Logistics', 'CN-GZ-088', 'china', 'Chen Hu', 'Guangzhou, Çin', 'Webhook v1', 'Senkronize', 19),
('Çukurova Motorlu Araçlar', 'TR-ADN-011', 'turkey', 'Hakan Çelik', 'Adana, TR', 'REST v2.1', 'Senkronize', 8),
('HSG Ningbo Foundry', 'CN-NGB-055', 'china', 'Zhang Ming', 'Ningbo, Çin', 'REST v3.0', 'Senkronize', 27)
ON CONFLICT (code) DO NOTHING;
