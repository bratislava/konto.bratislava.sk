import path from 'node:path'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TaxType } from '@prisma/client'
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

  async getNewFiles(sftpPath: string, taxType: TaxType, from?: Date) {
    const sftp = new SFTPClient()

    try {
      await sftp.connect({
        host: this.configService.getOrThrow<string>('REPORTING_SFTP_HOST'),
        port: this.configService.getOrThrow<number>('REPORTING_SFTP_PORT'),
        username: this.configService.getOrThrow<string>('REPORTING_SFTP_USER'),
        privateKey: this.configService.getOrThrow<string>('REPORTING_SFTP_KEY'),
      })

      const sftpFiles: FileInfo[] = await sftp.list(sftpPath)

      const newFiles: string[] = from
        ? this.filterFilesBeforeDate(sftpFiles, from)
        : await this.filterAlreadyReportedFiles(taxType, sftpFiles)

      return await Promise.all(
        newFiles.map(async (fileName) => {
          const filePath = path.join(sftpPath, fileName)
          const fileContent = await sftp.get(filePath)
          if (!Buffer.isBuffer(fileContent)) {
            throw new Error(`Expected Buffer for file ${fileName}`)
          }
          return { name: fileName, content: fileContent.toString('utf8') }
        }),
      )
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

  private async filterAlreadyReportedFiles(
    taxType: TaxType,
    files: FileInfo[],
  ) {
    const alreadyReportedFiles = await this.prismaService.csvFile.findMany({
      select: { name: true },
      where: {
        name: { in: files.map((file) => file.name) },
        taxType,
      },
    })

    return files
      .map((file) => file.name)
      .filter(
        (fileName) => !alreadyReportedFiles.some((f) => f.name === fileName),
      )
  }
}
