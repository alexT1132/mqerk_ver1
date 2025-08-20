import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'public';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    try {
      const original = file?.originalname || 'image';
      const ext = (path.extname(original) || '').toLowerCase();
      const base = path
        .basename(original, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'img';
      const unique = Date.now().toString();
      const rand = Math.random().toString(36).slice(2, 8);
      const safeName = `${unique}-${base}-${rand}${ext || ''}`;
      cb(null, safeName);
    } catch (e) {
      // Fallback muy corto si algo falla
      cb(null, `${Date.now()}.upload`);
    }
  },
});

export const upload = multer({
  storage,
  limits: {
    // 10MB por imagen para evitar cargas accidentales enormes
    fileSize: 10 * 1024 * 1024,
  },
});
