import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de rutas - adaptable para diferentes entornos
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

// Crear directorios si no existen
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
  }
};

// Asegurar que el directorio base exista
ensureDirectoryExists(UPLOADS_DIR);

// Configuración de almacenamiento con estructura de carpetas organizada
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar la carpeta según el tipo de archivo
    let uploadDir = UPLOADS_DIR;
    
    if (req.baseUrl.includes('licencia-permiso')) {
      uploadDir = path.join(uploadDir, 'licencias');
    } else if (req.baseUrl.includes('ficha-empresa')) {
      uploadDir = path.join(uploadDir, 'contratos');
    } else if (req.baseUrl.includes('historial-laboral')) {
      uploadDir = path.join(uploadDir, 'historial');
    } else {
      uploadDir = path.join(uploadDir, 'general');
    }

    // Crear el directorio si no existe
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

// Filtro para solo permitir PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Validar tipo MIME y extensión
  const isValidMime = file.mimetype === 'application/pdf';
  const isValidExt = path.extname(file.originalname).toLowerCase() === '.pdf';
  
  if (!isValidMime || !isValidExt) {
    cb(new Error('Solo se permiten archivos PDF'));
    return;
  }
  cb(null, true);
};

// Configuración de multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 1
  }
});

// Función para verificar si un archivo es un PDF válido
export async function isPdfFile(filePath: string): Promise<boolean> {
  try {
    const buffer = await fs.promises.readFile(filePath);
    // Verificar la firma del archivo PDF
    return buffer.slice(0, 4).toString() === '%PDF';
  } catch (error) {
    return false;
  }
}

// Función para eliminar archivo
export const deleteFile = (filePath: string): void => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
  }
};

// Función para obtener ruta de archivo
export const getContratoPath = (filename: string): string => {
  return path.join(UPLOADS_DIR, 'contratos', filename);
};

// Función para eliminar archivo de contrato
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
  CONTRATOS_DIR: path.join(UPLOADS_DIR, 'contratos'),
  LICENCIAS_DIR: path.join(UPLOADS_DIR, 'licencias'),
  HISTORIAL_DIR: path.join(UPLOADS_DIR, 'historial'),
  GENERAL_DIR: path.join(UPLOADS_DIR, 'general')
}; 