import Client from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';

const sftp = new Client();

export async function uploadFileToRemote(localFilePath: string, remoteFileName: string): Promise<string> {
  const config = {
    host: '146.83.198.35',
    port: 1219,
    username: 'fmiranda',
    password: 'U@er7'
  };

  const remoteDir = '/var/www/html/uploads'; // Carpeta donde Apache servirá las imágenes
  const remotePath = path.posix.join(remoteDir, remoteFileName);

  try {
    await sftp.connect(config);
    await sftp.put(localFilePath, remotePath);
    await sftp.end();

    return `http://146.83.198.35/uploads/${remoteFileName}`;
  } catch (err) {
    console.error('Error al subir archivo al servidor remoto:', err);
    throw new Error('No se pudo subir el archivo al servidor remoto');
  }
}
