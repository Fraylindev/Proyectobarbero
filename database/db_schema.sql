-- ============================================
-- BARBERSHOP APP - DATABASE SCHEMA
-- PostgreSQL 12+
-- Timezone: America/Santo_Domingo
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: PROFESSIONALS (Profesionales/Barberos)
-- ============================================
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    description TEXT,
    photo_url VARCHAR(500),
    phone VARCHAR(20) NOT NULL, -- WhatsApp
    email VARCHAR(150) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_professionals_username ON professionals(username);
CREATE INDEX idx_professionals_email ON professionals(email);

-- ============================================
-- ACTUALIZACIÓN DE SCHEMA - FASE 1
-- Agregar campos para mejorar UX de profesionales
-- ============================================

-- Agregar campos de métricas y rating
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_bookings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_clients INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'PROFESSIONAL' 
    CHECK (role IN ('PROFESSIONAL', 'PROFESSIONAL_ADMIN'));

-- Crear índice para filtrar por rol
CREATE INDEX IF NOT EXISTS idx_professionals_role ON professionals(role);

-- ============================================
-- FUNCIÓN: Actualizar métricas del profesional
-- Se ejecuta automáticamente cuando se completa una cita
-- ============================================
CREATE OR REPLACE FUNCTION update_professional_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actualizar si la cita cambió a COMPLETED
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        UPDATE professionals
        SET 
            completed_bookings = completed_bookings + 1,
            -- Contar clientes únicos
            total_clients = (
                SELECT COUNT(DISTINCT client_email) 
                FROM bookings 
                WHERE professional_id = NEW.professional_id 
                AND status = 'COMPLETED'
            )
        WHERE id = NEW.professional_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar métricas automáticamente
DROP TRIGGER IF EXISTS trigger_update_professional_metrics ON bookings;
CREATE TRIGGER trigger_update_professional_metrics
    AFTER UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.status = 'COMPLETED' AND OLD.status IS DISTINCT FROM 'COMPLETED')
    EXECUTE FUNCTION update_professional_metrics();

-- ============================================
-- TABLA: REVIEWS (Para sistema de calificaciones - FUTURO)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    client_name VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_professional ON reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);

-- ============================================
-- FUNCIÓN: Actualizar rating promedio del profesional
-- Se ejecuta cuando se agrega/modifica una reseña
-- ============================================
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE professionals
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM reviews 
            WHERE professional_id = COALESCE(NEW.professional_id, OLD.professional_id)
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE professional_id = COALESCE(NEW.professional_id, OLD.professional_id)
        )
    WHERE id = COALESCE(NEW.professional_id, OLD.professional_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar rating
DROP TRIGGER IF EXISTS trigger_update_rating_on_insert ON reviews;
CREATE TRIGGER trigger_update_rating_on_insert
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_professional_rating();

DROP TRIGGER IF EXISTS trigger_update_rating_on_update ON reviews;
CREATE TRIGGER trigger_update_rating_on_update
    AFTER UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_professional_rating();

DROP TRIGGER IF EXISTS trigger_update_rating_on_delete ON reviews;
CREATE TRIGGER trigger_update_rating_on_delete
    AFTER DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_professional_rating();

-- ============================================
-- ACTUALIZAR DATOS EXISTENTES
-- ============================================

-- Calcular métricas para profesionales existentes
UPDATE professionals p
SET 
    completed_bookings = (
        SELECT COUNT(*) 
        FROM bookings 
        WHERE professional_id = p.id 
        AND status = 'COMPLETED'
    ),
    total_clients = (
        SELECT COUNT(DISTINCT client_email) 
        FROM bookings 
        WHERE professional_id = p.id 
        AND status = 'COMPLETED'
    );

-- Establecer rol de admin para el profesional principal (ajustar email según tu DB)
UPDATE professionals 
SET role = 'PROFESSIONAL_ADMIN'
WHERE email = 'michael@michaelbarbershop.com';

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- SELECT id, name, rating, total_reviews, completed_bookings, total_clients, role 
-- FROM professionals;

COMMENT ON COLUMN professionals.rating IS 'Rating promedio del profesional (1-5 estrellas)';
COMMENT ON COLUMN professionals.total_reviews IS 'Número total de reseñas recibidas';
COMMENT ON COLUMN professionals.completed_bookings IS 'Total de citas completadas';
COMMENT ON COLUMN professionals.total_clients IS 'Número de clientes únicos atendidos';
COMMENT ON COLUMN professionals.role IS 'Rol del profesional: PROFESSIONAL o PROFESSIONAL_ADMIN';




-- ============================================
-- TABLA: SERVICES (Servicios disponibles)
-- ============================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_estimate DECIMAL(10, 2), -- Precio orientativo
    duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: BOOKINGS (Reservas)
-- ============================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    service_custom VARCHAR(200), -- Si el cliente elige "Otro"
    
    -- Datos del cliente
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(150) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    
    -- Fecha y hora de la cita
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    
    -- Estado de la reserva
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    
    -- Comentarios del cliente
    comments TEXT,
    
    -- Token único para confirmar/rechazar desde email (seguro, de un solo uso)
    confirmation_token VARCHAR(100) UNIQUE,
    token_used BOOLEAN DEFAULT false,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_bookings_professional ON bookings(professional_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_confirmation_token ON bookings(confirmation_token);

-- ============================================
-- TABLA: PAYMENTS (Pagos - SEPARADA)
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_time TIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para reportes de pagos
CREATE INDEX idx_payments_professional ON payments(professional_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_booking ON payments(booking_id);

-- ============================================
-- TABLA: GALLERY (Galería de trabajos)
-- ============================================
CREATE TABLE gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para filtrar galería por profesional
CREATE INDEX idx_gallery_professional ON gallery(professional_id);

-- ============================================
-- TABLA: AVAILABILITY_SCHEDULE (Horarios base semanales)
-- ============================================
CREATE TABLE availability_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para consultas de disponibilidad
CREATE INDEX idx_availability_professional ON availability_schedule(professional_id);

-- ============================================
-- TABLA: BLOCKED_TIMES (Bloqueos específicos/excepciones)
-- ============================================
CREATE TABLE blocked_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    blocked_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para validar disponibilidad rápidamente
CREATE INDEX idx_blocked_times_professional_date ON blocked_times(professional_id, blocked_date);

-- ============================================
-- TABLA: REFRESH_TOKENS (Para invalidar sesiones)
-- ============================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para validación de tokens
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_professional ON refresh_tokens(professional_id);

CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotions_active ON promotions(is_active, valid_until);

-- ============================================
-- TABLA DE CLIENTES
-- Para clientes que se registran opcionalmente
-- ============================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_clients_username ON clients(username);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Trigger para updated_at
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Agregar columna client_id a bookings (si no existe)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);

-- Comentarios
COMMENT ON TABLE clients IS 'Clientes registrados opcionalmente al hacer reservas';
COMMENT ON COLUMN clients.client_id IS 'ID del cliente si se registró, NULL si fue reserva sin registro';

-- Verificar
-- SELECT * FROM clients;

-- ============================================
-- TRIGGERS: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES DE EJEMPLO (OPCIONAL - Para testing)
-- ============================================

-- Servicios base
INSERT INTO services (name, description, price_estimate, duration_minutes) VALUES
    ('Corte clásico', 'Corte de cabello tradicional con tijera y máquina', 300.00, 30),
    ('Corte + Barba', 'Corte de cabello + arreglo de barba completo', 500.00, 45),
    ('Degradado moderno', 'Fade profesional con diseño', 400.00, 40),
    ('Afeitado completo', 'Afeitado con navaja y toallas calientes', 250.00, 25),
    ('Diseño de barba', 'Perfilado y diseño de barba', 200.00, 20),
    ('Otro', 'Especificar en comentarios', NULL, 30);

-- Profesional de prueba (password: "barbero123")
-- Hash generado con bcrypt, 10 rounds
INSERT INTO professionals (name, specialty, description, phone, email, username, password_hash, role) VALUES
    ('Michael García', 
     'Especialista en degradados', 
     'Más de 7 años de experiencia en cortes modernos y clásicos',
     '18091234567',
     'michael@michaelbarbershop.com',
     'michael',
     '$2b$10$bIPk7Cn1TuQRUtgx1zrY0.M6YQzisnogEIaPaMDKhGeJtRzpeStU2', -- Reemplazar con hash real
     'PROFESSIONAL_ADMIN');

     INSERT INTO professionals (name, specialty, description, phone, email, username, password_hash) VALUES
    ('Dandiel lopez', 
     'Especialista en cortes modernos', 
     'Más de 7 años de experiencia en cortes modernos y clásicos',
     '18092659874',
     'dandiel@michaelbarbershop.com',
     'dandiel',
     '$2b$10$0QI4j966RcH/6gG41ZLSVe1V6YMM9v55aTeC2k8sosg6lnOhvEX.K',
     'PROFESSIONAL');

-- ============================================
     --\i 'C:/Users/Fraylin/Desktop/Barberia Michael/database/db_schema.sql'
-- ============================================


-- ============================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================

-- Vista: Ingresos diarios por profesional
CREATE VIEW daily_earnings AS
SELECT 
    p.id as professional_id,
    p.name as professional_name,
    pay.payment_date,
    SUM(pay.amount) as total_earnings,
    COUNT(pay.id) as completed_services
FROM payments pay
JOIN professionals p ON pay.professional_id = p.id
GROUP BY p.id, p.name, pay.payment_date
ORDER BY pay.payment_date DESC;

-- Vista: Próximas citas confirmadas
CREATE VIEW upcoming_bookings AS
SELECT 
    b.id,
    b.booking_date,
    b.booking_time,
    b.client_name,
    b.client_phone,
    p.name as professional_name,
    p.phone as professional_phone,
    s.name as service_name,
    b.service_custom
FROM bookings b
JOIN professionals p ON b.professional_id = p.id
LEFT JOIN services s ON b.service_id = s.id
WHERE b.status = 'CONFIRMED' 
  AND b.booking_date >= CURRENT_DATE
ORDER BY b.booking_date, b.booking_time;

-- ============================================
-- COMENTARIOS Y REGLAS DE NEGOCIO
-- ============================================

-- REGLA 1: Un profesional solo puede tener una reserva CONFIRMADA por horario
-- (implementar validación en backend)

-- REGLA 2: Solo las reservas COMPLETED generan pagos
-- (trigger o lógica en backend al cambiar estado)

-- REGLA 3: Los tokens de confirmación expiran en 7 días
-- (validar en backend antes de usar)

-- REGLA 4: Al marcar profesional como "no disponible" (is_available=false),
-- no mostrar sus horarios en el sistema de reservas públicas

-- REGLA 5: Prioridad de disponibilidad:
--   1. Bloqueos manuales (blocked_times)
--   2. Reservas CONFIRMED
--   3. Estado general (is_available)

-- ============================================
-- FUNCIÓN: Limpiar tokens expirados (ejecutar periódicamente)
-- ============================================
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Limpiar tokens de confirmación expirados
    UPDATE bookings 
    SET confirmation_token = NULL 
    WHERE token_expires_at < CURRENT_TIMESTAMP 
      AND token_used = false;
    
    -- Limpiar refresh tokens expirados
    DELETE FROM refresh_tokens 
    WHERE expires_at < CURRENT_TIMESTAMP OR is_revoked = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANTS (ajustar según tu usuario de DB)
-- ============================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO barbershop_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO barbershop_user;