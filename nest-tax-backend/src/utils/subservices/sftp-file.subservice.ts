import path from 'node:path'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import SFTPClient, { FileInfo } from 'ssh2-sftp-client'

import { PrismaService } from '../../prisma/prisma.service'
import { ErrorsEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'

@Injectable()
export default class SftpFileSubservice {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  async getNewFiles() {
    const sftp = new SFTPClient()

    const newFileContents: { name: string; content: string }[] = []

    try {
      await sftp.connect({
        host: this.configService.getOrThrow<string>('REPORTING_SFTP_HOST'),
        port: this.configService.getOrThrow<number>('REPORTING_SFTP_PORT'),
        username: this.configService.getOrThrow<string>('REPORTING_SFTP_USER'),
        privateKey: this.configService.getOrThrow<string>('REPORTING_SFTP_KEY'),
      })

      const sftpFiles: FileInfo[] = await sftp.list(
        this.configService.getOrThrow<string>('REPORTING_SFTP_FILES_PATH'),
      )

      const newFiles = await this.filterAlreadyReportedFiles(sftpFiles)

      // Get contents of all new files
      // eslint-disable-next-line no-restricted-syntax
      for (const fileName of newFiles) {
        const filePath = path.join(
          this.configService.getOrThrow<string>('REPORTING_SFTP_FILES_PATH'),
          fileName,
        )

        // eslint-disable-next-line no-await-in-loop
        const fileContent = await sftp.get(filePath)
        newFileContents.push({
          name: fileName,
          content: fileContent.toString('utf8'), // Assuming you want the content as a string
        })
      }
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Error during retrieval of files form SFTP server',
        undefined,
        undefined,
        error instanceof Error ? error : undefined,
      )
    } finally {
      await sftp.end()
    }
    return newFileContents
  }

  private async filterAlreadyReportedFiles(files: FileInfo[]) {
    const alreadyReportedFiles = await this.prisma.csvFile.findMany({
      select: { name: true },
      where: {name: { in: files.map((file) => file.name) }},
    })

    return files
      .map((file) => file.name)
      .filter(
        (fileName) => !alreadyReportedFiles.some((f) => f.name === fileName),
      )
  }
}
