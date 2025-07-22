import SftpClient from "ssh2-sftp-client";

export class UpdateImageService {
  static async uploadImageToSFTP(localPath: string, fileName: string): Promise<string> {
    const sftp: any = new SftpClient();

    try {
      await sftp.connect({
        host: process.env.SFTP_HOST!,
        port: Number(process.env.SFTP_PORT || 22),
        username: process.env.SFTP_USER!,
        password: process.env.SFTP_PASSWORD!,
      });

      const remoteFilePath = `${process.env.SFTP_REMOTE_PATH}/${fileName}`;
      await sftp.put(localPath, remoteFilePath);

      return `${process.env.SFTP_PUBLIC_URL}/${fileName}`;
    } finally {
      await sftp.end();
    }
  }
}
