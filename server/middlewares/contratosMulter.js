import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), 'contratos');
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      return cb(e);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    try {
      const ext = path.extname(file.originalname) || '.pdf';
      const base = path
        .basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50) || 'contrato';
      const unique = Date.now();
      cb(null, `${unique}-${base}${ext}`);
    } catch (e) {
      cb(null, `${Date.now()}-contrato.pdf`);
    }
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') return cb(null, true);
  return cb(new Error('Solo se permiten PDFs'));
};

export const uploadContrato = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });
