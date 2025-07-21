import { Request, Response } from 'express';
import { uploadToRemoteServer } from '../services/updateFileServer.service.js';

export const uploadFileController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se envió ningún archivo' });
    }

    const result = await uploadToRemoteServer(req.file.path, req.file.originalname);

    return res.status(200).json({
      success: true,
      message: 'Archivo subido correctamente al servidor remoto',
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
