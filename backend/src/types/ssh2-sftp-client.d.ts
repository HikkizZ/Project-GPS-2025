declare module "ssh2-sftp-client" {
  export interface ConnectOptions {
    host: string
    port?: number
    username: string
    password?: string
    privateKey?: string | Buffer
    passphrase?: string
    readyTimeout?: number
    retries?: number
  }

  export interface FileInfo {
    type: string
    name: string
    size: number
    modifyTime: number
    accessTime: number
    rights: {
      user: string
      group: string
      other: string
    }
    owner: number
    group: number
  }

  export default class Client {
    sftp: any

    constructor()

    connect(options: ConnectOptions): Promise<void>

    end(): Promise<void>

    exists(remotePath: string): Promise<boolean | string>

    mkdir(remotePath: string, recursive?: boolean): Promise<void>

    fastPut(localPath: string, remotePath: string): Promise<void>

    delete(remotePath: string): Promise<void>

    chmod(remotePath: string, mode: string): Promise<void>

    list(remotePath: string): Promise<FileInfo[]>
  }
}
