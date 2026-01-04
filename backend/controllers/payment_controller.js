/**
 * CONTROLADOR DE PAGOS
 * Reportes financieros y estadísticas
 */

const { query } = require('../config/database');

/**
 * INGRESOS DEL DÍA (requiere auth)
 * GET /api/payments/today
 */
const getTodayEarnings = async (req, res) => {
  try {
    const professionalId = req.professional.id;

    const result = await query(
      `SELECT 
        COUNT(*) as services_count,
        COALESCE(SUM(amount), 0) as total_earnings
       FROM payments
       WHERE professional_id = $1 
       AND payment_date = CURRENT_DATE`,
      [professionalId]
    );

    res.json({
      success: true,
      data: {
        date: new Date().toISOString().split('T')[0],
        servicesCount: parseInt(result.rows[0].services_count),
        totalEarnings: parseFloat(result.rows[0].total_earnings)
      }
    });

  } catch (error) {
    console.error('Error obteniendo ingresos del día:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ingresos'
    });
  }
};

/**
 * INGRESOS DEL MES (requiere auth)
 * GET /api/payments/month
 */
const getMonthEarnings = async (req, res) => {
  try {
    const professionalId = req.professional.id;
    const { year, month } = req.query;

    // Si no se especifican, usar mes actual
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || (currentDate.getMonth() + 1);

    const result = await query(
      `SELECT 
        COUNT(*) as services_count,
        COALESCE(SUM(amount), 0) as total_earnings
       FROM payments
       WHERE professional_id = $1 
       AND EXTRACT(YEAR FROM payment_date) = $2
       AND EXTRACT(MONTH FROM payment_date) = $3`,
      [professionalId, targetYear, targetMonth]
    );

    res.json({
      success: true,
      data: {
        year: parseInt(targetYear),
        month: parseInt(targetMonth),
        servicesCount: parseInt(result.rows[0].services_count),
        totalEarnings: parseFloat(result.rows[0].total_earnings)
      }
    });

  } catch (error) {
    console.error('Error obteniendo ingresos del mes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ingresos'
    });
  }
};

/**
 * HISTORIAL DE PAGOS (requiere auth)
 * GET /api/payments/history
 */
const getPaymentHistory = async (req, res) => {
  try {
    const professionalId = req.professional.id;
    const { startDate, endDate, limit = 100 } = req.query;

    let queryText = `
      SELECT 
        p.id,
        p.amount,
        p.payment_date,
        p.payment_time,
        p.notes,
        b.client_name,
        b.booking_date,
        b.booking_time,
        s.name as service_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE p.professional_id = $1
    `;

    const params = [professionalId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      queryText += ` AND p.payment_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      queryText += ` AND p.payment_date <= $${paramCount}`;
      params.push(endDate);
    }

    queryText += ` ORDER BY p.payment_date DESC, p.payment_time DESC LIMIT $${paramCount + 1}`;
    params.push(limit);

    const result = await query(queryText, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo historial de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial'
    });
  }
};

/**
 * ESTADÍSTICAS MENSUALES (requiere auth)
 * GET /api/payments/monthly-stats
 */
const getMonthlyStats = async (req, res) => {
  try {
    const professionalId = req.professional.id;
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();

    const result = await query(
      `SELECT 
        EXTRACT(MONTH FROM payment_date) as month,
        COUNT(*) as services_count,
        SUM(amount) as total_earnings
       FROM payments
       WHERE professional_id = $1 
       AND EXTRACT(YEAR FROM payment_date) = $2
       GROUP BY EXTRACT(MONTH FROM payment_date)
       ORDER BY month ASC`,
      [professionalId, targetYear]
    );

    // Crear array de 12 meses con datos o ceros
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthData = result.rows.find(r => parseInt(r.month) === i + 1);
      return {
        month: i + 1,
        servicesCount: monthData ? parseInt(monthData.services_count) : 0,
        totalEarnings: monthData ? parseFloat(monthData.total_earnings) : 0
      };
    });

    res.json({
      success: true,
      data: {
        year: parseInt(targetYear),
        months: monthlyData
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas mensuales:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
};

/**
 * SERVICIOS MÁS SOLICITADOS (requiere auth)
 * GET /api/payments/top-services
 */
const getTopServices = async (req, res) => {
  try {
    const professionalId = req.professional.id;
    const limit = parseInt(req.query.limit?.limit || req.query.limit || 10, 10);
    //const { limit = 10 } = req.query;

    const result = await query(
      `SELECT 
        COALESCE(s.name, b.service_custom) as service_name,
        COUNT(*) as count,
        SUM(p.amount) as total_revenue
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       LEFT JOIN services s ON b.service_id = s.id
       WHERE p.professional_id = $1
       GROUP BY COALESCE(s.name, b.service_custom)
       ORDER BY count DESC
       LIMIT $2`,
      [professionalId, limit]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo servicios top:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
};

module.exports = {
  getTodayEarnings,
  getMonthEarnings,
  getPaymentHistory,
  getMonthlyStats,
  getTopServices
};