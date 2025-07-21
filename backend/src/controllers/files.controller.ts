import { Request, Response } from 'express';
import Client from 'ssh2-sftp-client';
import path from 'path';

const sftp = new Client();

export const uploadFileController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ningún archivo' });
    }

    // Configuración del servidor remoto
    const config = {
      host: '146.83.198.35',
      port: 1219, // Puerto SSH
      username: 'fmiranda',
      password: 'U@er7'
    };

    // Determinar subcarpeta según el tipo de archivo
    let subfolder = 'others';
    if (req.file.mimetype.startsWith('image/')) {
      subfolder = 'images';
    } else if (req.file.mimetype === 'application/pdf') {
      subfolder = 'pdf';
    }

    // Nombre único para el archivo
    const remoteFileName = `${Date.now()}-${req.file.originalname}`;
    const remoteDir = `/var/www/html/uploads/${subfolder}`;
    const remotePath = path.posix.join(remoteDir, remoteFileName);

    // Conexión al servidor remoto
    await sftp.connect(config);

    // Crear directorio si no existe
    try {
      await sftp.mkdir(remoteDir, true); // true = crea recursivamente
    } catch (err) {
      console.warn(`El directorio ya existe o no se pudo crear: ${remoteDir}`);
    }

    // Subir archivo desde memoria directamente al servidor remoto
    await sftp.put(req.file.buffer, remotePath);

    // Cerrar conexión
    await sftp.end();

    // Construir URL pública
    const fileUrl = `http://146.83.198.35/uploads/${subfolder}/${remoteFileName}`;

    return res.status(200).json({
      message: 'Archivo subido con éxito',
      url: fileUrl
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return res.status(500).json({
      message: 'Error al subir archivo al servidor remoto',
      error: (error as Error).message
    });
  }
};
