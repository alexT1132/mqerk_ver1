import multer from 'multer';
import path from 'path';
import fs from 'fs';

const baseDir = path.resolve('uploads/asesores');
if(!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive:true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, baseDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = file.fieldname.replace(/[^a-z0-9_\-]/gi,'_');
    cb(null, `${Date.now()}-${safe}${ext}`);
  }
});

const allowedExt = ['.pdf','.png','.jpg','.jpeg'];

function fileFilter(_req, file, cb){
  const ext = path.extname(file.originalname).toLowerCase();
  if(!allowedExt.includes(ext)) return cb(new Error('Extensión no permitida'));
  cb(null, true);
}

export const uploadPerfilDocs = multer({ storage, fileFilter, limits:{ fileSize: 5 * 1024 * 1024 }});
