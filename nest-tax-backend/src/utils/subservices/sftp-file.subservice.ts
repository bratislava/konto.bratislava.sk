import path from 'node:path'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import SFTPClient, { FileInfo } from 'ssh2-sftp-client'

import { PrismaService } from '../../prisma/prisma.service'
import { ErrorsEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'

dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export default class SftpFileSubservice {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  async getNewFiles(from?: Date) {
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

      const newFiles: string[] = from
        ? this.filterFilesBeforeDate(sftpFiles, from)
        : await this.filterAlreadyReportedFiles(sftpFiles)

      // Get contents of all new files
      const filePromises = newFiles.map(async (fileName) => {
        const filePath = path.join(
          this.configService.getOrThrow<string>('REPORTING_SFTP_FILES_PATH'),
          fileName,
        )

        const fileContent = await sftp.get(filePath)
        if (Buffer.isBuffer(fileContent)) {
          return {
            name: fileName,
            content: fileContent.toString('utf8'),
          }
        }
        // eslint-disable-next-line no-console
        console.warn(`File content is not a buffer for file: ${fileName}`)
        return null
      })

      const fileResults = await Promise.all(filePromises)
      newFileContents.push(...fileResults.filter((result) => result !== null))
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

  private filterFilesBeforeDate(sftpFiles: FileInfo[], from: Date) {
    return sftpFiles
      .filter((file) => {
        const fileDateMatches = file.name.split('_').pop()?.slice(0, 6)
        if (!fileDateMatches || Number.isNaN(Number(fileDateMatches)))
          return false
        const fileDate = dayjs(`20${fileDateMatches}`).tz('Europe/Bratislava')
        return fileDate.add(1, 'day').isAfter(from, 'day')
      })
      .map((file) => file.name)
  }

  private async filterAlreadyReportedFiles(files: FileInfo[]) {
    const alreadyReportedFiles = await this.prismaService.csvFile.findMany({
      select: { name: true },
      where: { name: { in: files.map((file) => file.name) } },
    })

    return files
      .map((file) => file.name)
      .filter(
        (fileName) => !alreadyReportedFiles.some((f) => f.name === fileName),
      )
  }
}
