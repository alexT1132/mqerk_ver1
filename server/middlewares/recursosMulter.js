import multer from 'multer';
import path from 'path';
import fs from 'fs';

const baseDir = path.resolve('uploads/recursos-educativos');
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, baseDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .slice(0, 100);
    const unique = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    cb(null, `${unique}-${rand}-${safeName}`);
  }
});

// Tipos de archivo permitidos
const allowedMimes = [
  // Documentos
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Archivos comprimidos
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  // Videos
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  // Imágenes
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // Texto
  'text/plain',
  'text/csv'
];

const allowedExt = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.7z', 
                    '.mp4', '.mpeg', '.mov', '.avi', '.webm', '.jpg', '.jpeg', '.png', '.gif', '.webp', 
                    '.txt', '.csv'];

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExt.includes(ext) || !allowedMimes.includes(file.mimetype)) {
    return cb(new Error(`Tipo de archivo no permitido. Extensiones permitidas: ${allowedExt.join(', ')}`));
  }
  cb(null, true);
}

export const uploadRecurso = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB máximo
  },
});

