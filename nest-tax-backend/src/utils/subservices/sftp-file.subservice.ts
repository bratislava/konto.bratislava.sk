import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import SFTPClient, { FileInfo } from 'ssh2-sftp-client'
import { ConfigService } from '@nestjs/config'
import path from 'node:path'
import ThrowerErrorGuard from '../guards/errors.guard'
import { ErrorsEnum } from '../guards/dtos/error.dto'


@Injectable()
export default class SftpFileSubservice {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  async getNewFiles() {
    const sftp = new SFTPClient()

    let newFileContents: { name: string; content: string }[] = []

    try {
      await sftp.connect({
        host: this.configService.getOrThrow<string>('REPORTING_SFTP_HOST'),
        port: this.configService.getOrThrow<number>('REPORTING_SFTP_PORT'),
        username: this.configService.getOrThrow<string>('REPORTING_SFTP_USER'),
        // privateKey: fs.readFileSync(sftpKeyPath),
        password: this.configService.getOrThrow<string>(
          'REPORTING_SFTP_PASSWORD',
        ),
      })

      const sftpFiles: FileInfo[] = await sftp.list(
        this.configService.getOrThrow<string>('REPORTING_SFTP_FILES_PATH'),
      )

      const newFiles = await this.filterAlreadyReportedFiles(sftpFiles)

      // Get contents of all new files

      for (const fileName of newFiles) {
        const filePath = path.join(
          this.configService.getOrThrow<string>('REPORTING_SFTP_FILES_PATH'),
          fileName,
        )

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
    const prisma = new PrismaService()
    const alreadyReportedFiles = await prisma.csvFile.findMany({
      select: { name: true },
    })

    const newFiles = files
      .map((file) => file.name)
      // .filter((name) => {
      //   name.startsWith('AH_DATA_') && name.endsWith('.csv')
      // })
      .filter(
        (fileName) => !alreadyReportedFiles.find((f) => f.name === fileName),
      )

    // Write updated CSV names
    await this.prisma.csvFile.createMany({
      data: newFiles.map((name) => ({
        name,
      })),
    })

    return newFiles
  }
}
