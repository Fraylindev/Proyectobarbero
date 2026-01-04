const { query } = require('../config/database');

const getActivePromotions = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM promotions 
       WHERE is_active = true 
       AND valid_until >= CURRENT_DATE 
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo promociones' });
  }
};

const getAllPromotions = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM promotions ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const createPromotion = async (req, res) => {
  try {
    const { title, description, valid_from, valid_until } = req.body;
    
    const result = await query(
      `INSERT INTO promotions (title, description, valid_from, valid_until)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, valid_from, valid_until]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creando promoción' });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, valid_from, valid_until, is_active } = req.body;
    
    const result = await query(
      `UPDATE promotions 
       SET title = $1, description = $2, valid_from = $3, 
           valid_until = $4, is_active = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [title, description, valid_from, valid_until, is_active, id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM promotions WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

module.exports = {
  getActivePromotions,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion
};