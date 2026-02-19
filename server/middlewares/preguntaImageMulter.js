import multer from 'multer';
import path from 'path';
import fs from 'fs';

const dir = path.join(process.cwd(), 'uploads', 'preguntas');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      return cb(e);
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase() || '.jpg';
    const safe = (path.basename(file.originalname, path.extname(file.originalname)) || 'img')
      .replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${Date.now()}-${safe.slice(0, 40)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.mimetype);
  cb(ok ? null : new Error('Solo imágenes (png, jpg, jpeg, webp, gif)'), ok);
};

export const uploadPreguntaImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
