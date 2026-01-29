import multer from 'multer';
import path from 'path';
import fs from 'fs';

const root = process.cwd();
const uploadDir = path.join(root, 'uploads', 'cursos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ok = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'].includes(file.mimetype);
  cb(ok ? null : new Error('Solo imágenes (png,jpg,jpeg,webp)'), ok);
}

export const uploadCourseImage = multer({
  storage,
  fileFilter,
  // limits: { fileSize: 5 * 1024 * 1024 }, // opcional
});