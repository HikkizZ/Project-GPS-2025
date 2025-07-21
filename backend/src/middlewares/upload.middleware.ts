import multer from "multer";
import path from "path";
import type { Express } from "express";

//  Almacenamiento en memoria (no en disco)
const storage = multer.memoryStorage();

//  Filtro para validar tipos de archivo (imágenes y PDF)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf"
  ];

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, GIF, WebP) y PDF"));
  }
};

//  Configuración de Multer
export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB máximo
    files: 1
  }
});

//  Middleware para un solo archivo
export const uploadPadron = uploadMiddleware.single("padron");

//  Función para determinar el tipo de archivo
export const getFileType = (mimetype: string): "image" | "pdf" => {
  if (mimetype.startsWith("image/")) {
    return "image";
  } else if (mimetype === "application/pdf") {
    return "pdf";
  }
  throw new Error("Tipo de archivo no soportado");
};

//  Función para obtener extensión
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};
//  Función para generar nombre único seguro
export const generateSafeFilename = (originalName: string, folder = "uploads"): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.round(Math.random() * 1e6);
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9]/g, "_") // Reemplazar caracteres especiales
    .substring(0, 20); // Limitar longitud

  return `${folder}_${baseName}_${timestamp}_${randomSuffix}${extension}`;
};