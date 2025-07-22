import { Router } from "express";
import { uploadFileController } from "../controllers/files.controller.js";
import { uploadMiddleware } from "../middlewares/upload.middleware.js";

const router = Router();

// Endpoint para subir un archivo (imagen o PDF)
router.post("/upload", uploadMiddleware.single("file"), uploadFileController);

export default router;
