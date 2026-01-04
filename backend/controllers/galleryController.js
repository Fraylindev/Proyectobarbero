const { query } = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configurar Multer para subir imágenes
const storage = multer.diskStorage({
  destination: './uploads/gallery/',
  filename: (req, file, cb) => {
    cb(null, `gallery-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Error: Solo imágenes');
  }
});

const getAllGallery = async (req, res) => {
  try {
    const result = await query(
      `SELECT g.*, p.name as professional_name 
       FROM gallery g
       LEFT JOIN professionals p ON g.professional_id = p.id
       ORDER BY g.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const uploadImage = async (req, res) => {
  try {
    const { professional_id, description } = req.body;
    const image_url = `/uploads/gallery/${req.file.filename}`;
    
    const result = await query(
      `INSERT INTO gallery (professional_id, image_url, description, uploaded_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [professional_id, image_url, description, req.professional.id]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error subiendo imagen' });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener ruta del archivo
    const result = await query('SELECT image_url FROM gallery WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      const fs = require('fs');
      const filePath = `.${result.rows[0].image_url}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await query('DELETE FROM gallery WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error eliminando imagen' });
  }
};

module.exports = {
  upload,
  getAllGallery,
  uploadImage,
  deleteImage
};