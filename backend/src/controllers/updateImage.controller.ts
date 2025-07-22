import type { Request, Response } from "express";

export async function updateImageController(req: Request, res: Response) {
  try {
    const imageUrl = req.body.imageUrl || `Imagen guardada localmente en ${req.file?.path}`;
    res.json({
      status: "success",
      message: "Imagen subida correctamente",
      url: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error en el controlador" });
  }
}
