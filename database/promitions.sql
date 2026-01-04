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