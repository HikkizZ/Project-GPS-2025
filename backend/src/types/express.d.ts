import type { RemoteFileUploadResult } from "../services/updateFileServer.service.ts"

declare global {
  namespace Express {
    interface Request {
      remoteFile?: RemoteFileUploadResult
    }
  }
}
