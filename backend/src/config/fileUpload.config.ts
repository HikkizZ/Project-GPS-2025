import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de rutas - adaptable para diferentes entornos
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
const CONTRATOS_DIR = path.join(UPLOADS_DIR, 'contratos');

// Crear directorios si no existen
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
  }
};

// Asegurar que los directorios existan
ensureDirectoryExists(UPLOADS_DIR);
ensureDirectoryExists(CONTRATOS_DIR);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirectoryExists(CONTRATOS_DIR); // Asegurar que el directorio exista antes de cada upload
    cb(null, CONTRATOS_DIR);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: fichaId_timestamp_original.pdf
    const fichaId = req.params.id;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `ficha_${fichaId}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// Filtro para solo permitir PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'));
  }
};

// Configuración de multer
export const uploadContrato = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  }
});

// Función para obtener ruta de archivo
export const getContratoPath = (filename: string): string => {
  return path.join(CONTRATOS_DIR, filename);
};

// Función para eliminar archivo
export const deleteContratoFile = (filename: string): boolean => {
  try {
    const filePath = getContratoPath(filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return false;
  }
};

// Exportar rutas para uso en otras partes
export const PATHS = {
  UPLOADS_DIR,
  CONTRATOS_DIR
}; 