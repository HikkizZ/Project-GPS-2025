import multer from "multer";
import fs from "fs";
import path from "path";
import type { Request, Response, NextFunction } from "express";
import { UpdateImageService } from "../services/updateImage.service.js";

const tempDir = path.join(process.cwd(), "temp-images");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Configuración de almacenamiento temporal
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// Validación de tipo de archivo
function imageFileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Formato no permitido. Solo se aceptan imágenes."));
  }
  cb(null, true);
}

export const updateImageMiddleware = multer({ storage, fileFilter: imageFileFilter }).single("image");

/**
 * Sube la imagen al servidor remoto si UPLOAD_MODE=remote
 */
export async function handleUpdateImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No se encontró ninguna imagen" });
    }

    const localPath = req.file.path;
    const fileName = req.file.filename;

    if (process.env.UPLOAD_MODE === "remote") {
      const publicUrl = await UpdateImageService.uploadImageToSFTP(localPath, fileName);
      fs.unlinkSync(localPath); // Elimina archivo temporal
      req.body.imageUrl = publicUrl;
    }

    next();
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    res.status(500).json({ status: "error", message: "Error al subir la imagen" });
  }
}
