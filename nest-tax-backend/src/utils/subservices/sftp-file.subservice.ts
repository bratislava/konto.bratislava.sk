import path from 'node:path'

import { ErrorEnum, ErrorFactoryService } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import SFTPClient, { FileInfo } from 'ssh2-sftp-client'

import BaConfigService from '../../config/ba-config.service'
import { TaxType } from '../../generated/prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { isBefore, toBratislavaDateTime } from '../functions/temporal'

const SFTP_FILE_NAME_CENTURY_START = 2000

const SFTP_FILE_NAME_DATE_PATTERN = /^(\d{2})(\d{2})(\d{2})$/

/**
 * Bank report files on the SFTP server end with `_YYMMDD` followed by a
 * sequence number, e.g. `..._15_25012434.csv` is from 2025-01-24.
 */
export const parseSftpFileNameDate = (
  fileName: string,
): Temporal.PlainDate | null => {
  const match = fileName
    .split('_')
    .pop()
    ?.slice(0, 6)
    .match(SFTP_FILE_NAME_DATE_PATTERN)
  if (!match) {
    return null
  }

  const [, year, month, day] = match
  try {
    return Temporal.PlainDate.from(
      {
        year: SFTP_FILE_NAME_CENTURY_START + Number(year),
        month: Number(month),
        day: Number(day),
      },
      { overflow: 'reject' },
    )
  } catch {
    return null
  }
}

@Injectable()
export default class SftpFileSubservice {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly baConfigService: BaConfigService,
    private readonly errorFactoryService: ErrorFactoryService,
  ) {}

  async getNewFiles(sftpPath: string, taxType: TaxType, from?: Date) {
    const sftp = new SFTPClient()
    const { sftp: sftpConfig } = this.baConfigService.cardPaymentReporting

    try {
      await sftp.connect(sftpConfig)

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
      throw this.errorFactoryService.InternalServerErrorException({
        errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
        message: 'Error during retrieval of files form SFTP server',
        console: { sftpPath, taxType, from },
        error: error instanceof Error ? error : undefined,
      })
    } finally {
      await sftp.end()
    }
  }

  private filterFilesBeforeDate(sftpFiles: FileInfo[], from: Date) {
    const fromDate = toBratislavaDateTime(from).toPlainDate()
    return sftpFiles
      .filter((file) => {
        const fileDate = parseSftpFileNameDate(file.name)
        return fileDate !== null && !isBefore(fileDate, fromDate)
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
