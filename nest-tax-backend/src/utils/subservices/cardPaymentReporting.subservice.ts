import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { PrismaService } from '../../prisma/prisma.service'
import { LineLoggerSubservice } from './line-logger.subservice'
import SFTPClient, { FileInfo } from 'ssh2-sftp-client'
import nodemailer from 'nodemailer'

import { parse } from 'csv-parse/sync'
import { ConfigService } from '@nestjs/config'
import path from 'node:path'
import ThrowerErrorGuard from '../guards/errors.guard'
import { ErrorsEnum, ErrorsResponseEnum } from '../guards/dtos/error.dto'

const csvColumnNames = [
  'transactionType',
  'terminalId',
  'transactionId',
  'transactionType_',
  'date',
  'totalPrice',
  'provision',
  'priceWithoutProvision',
  'cashBack',
  'authCode',
  'cardNumber',
  'cardType',
  'closureId',
  'orderId',
] as const

type CsvColumns = (typeof csvColumnNames)[number]

type CsvRecord = Record<CsvColumns, string>
export type CsvColumnsWithVariableSymbol = CsvRecord & {
  variableSymbol: string
}

export type OutputFile = {
  filename: string
  content: string
}

@Injectable()
export default class CardPaymentReportingSubservice {
  private readonly logger = new LineLoggerSubservice(
    CardPaymentReportingSubservice.name,
  )

  private transporter: nodemailer.Transporter

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.transporter = nodemailer.createTransport({
      host: `email-smtp.${process.env.COGNITO_REGION}.amazonaws.com`,
      port: 465,
      secure: true,
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USERNAME'),
        pass: this.configService.getOrThrow<string>('SMTP_PASSWORD'),
      },
    })
  }

  /**
   * Send an email with or without attachments.
   *
   * @param to List of email recipients
   * @param subject Email subject
   * @param message Email body/text content
   * @param attachments Optional list of attachments as base64-encoded strings
   */
  async sendEmailWithAttachments(
    to: string[],
    subject: string,
    message: string,
    attachments?: { filename: string; content: string; contentType: string }[],
  ): Promise<void> {
    try {
      const emailOptions = {
        from: this.configService.getOrThrow<string>('SENDER_EMAIL'),
        to: to.join(', '),
        subject,
        text: message,
        attachments,
      }
      // console.log(JSON.stringify(emailOptions, undefined, 2))

      const info = await this.transporter.sendMail(emailOptions)

      this.logger.log(
        `Report email sent successfully to ${to.join(', ')}: ${info.messageId}`,
      )
    } catch (error) {
      if (error instanceof Error) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to send daily payment email report.',
          undefined,
          undefined,
          error,
        )
      }
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to send daily payment email report.',
        undefined,
        <string>error,
      )
    }
  }

  generatePrice = (price: number, fill: number): string => {
    const adjustedFill = price >= 0 ? fill + 3 : fill + 2
    const paddedPrice = Math.abs(price)
      .toFixed(2)
      .padStart(adjustedFill + 3, '0')
      .replace('.', '')
    return price >= 0 ? paddedPrice : '-'.concat(paddedPrice)
  }

  async getVsByOrderId(
    orderIds: string[],
  ): Promise<{ variableSymbol: string; orderIds: (string | null)[] }[]> {
    const result = await this.prisma.tax.findMany({
      where: {
        taxPayments: {
          some: {
            orderId: {
              in: orderIds,
            },
          },
        },
      },
      select: {
        variableSymbol: true,
        taxPayments: {
          select: {
            orderId: true,
          },
        },
      },
    })
    return result.map((item) => ({
      variableSymbol: item.variableSymbol,
      orderIds: item.taxPayments
        .map((payment) => payment.orderId)
        .filter((orderId) => orderId !== null),
    }))
  }

  async getFilesFromSftp() {
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

  async filterAlreadyReportedFiles(files: FileInfo[]) {
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

  extractFileDate(fileName: string): string | null {
    const fileDateMatches = fileName.split('_').pop()?.slice(0, 6)
    if (!fileDateMatches || isNaN(Number(fileDateMatches))) return null
    return `20${fileDateMatches}` // Add century
  }

  getDateInfo(fileDate: string) {
    const today = dayjs(fileDate).tz('Europe/Bratislava')
    const yesterday = today.subtract(1, 'day')
    return {
      today_DDMMYYYY: today.format('DDMMYYYY'),
      today_YYMMDD: today.format('YYMMDD'),
      yesterday_DDMMYYYY: yesterday.format('DDMMYYYY'),
    }
  }

  enrichDataWithVariableSymbols(
    csvData: CsvRecord[],
    variableSymbols: { variableSymbol: string; orderIds: (string | null)[] }[],
  ): CsvColumnsWithVariableSymbol[] {
    return csvData
      .filter((row) => row.cardNumber !== 'GP analytics')
      .map((row) => {
        const vsMatch =
          variableSymbols.find((item) => item.orderIds.includes(row.orderId))
            ?.variableSymbol || ''
        return { ...row, variableSymbol: vsMatch }
      })
  }

  processCsvData(csvContent: string): CsvRecord[] {
    const rows = parse(csvContent, {
      delimiter: ';',
      fromLine: 2, // Skip first line
    }) as string[][]

    return rows.map((row: string[]) => {
      const rowData: CsvRecord = {} as CsvRecord
      csvColumnNames.forEach((col, index) => {
        rowData[col] = row[index]
      })
      return rowData
    })
  }

  private async getConstantsFromDatabase() {
    const requiredKeys = [
      'VARIABLE_SYMBOL',
      'SPECIFIC_SYMBOL',
      'CONSTANT_SYMBOL',
      'USER_CONSTAT_SYMBOL',
    ]
    let constants: Record<string, string>
    try {
      const result = await this.prisma.systemSettings.findMany({
        where: {
          key: {
            in: requiredKeys,
          },
        },
        select: {
          key: true,
          value: true,
        },
      })

      constants = Object.fromEntries(
        result.map((item) => [item.key, item.value]),
      )

      requiredKeys.forEach((key) => {
        if (!constants[key]) {
        }
      })
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.DATABASE_ERROR,
        ErrorsResponseEnum.DATABASE_ERROR,
        undefined,
        "Error while getting 'VARIABLE_SYMBOL', 'SPECIFIC_SYMBOL', 'CONSTANT_SYMBOL', 'USER_CONSTAT_SYMBOL'.",
        error instanceof Error ? error : undefined,
      )
    }

    requiredKeys.forEach((key) => {
      if (!constants[key]) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.DATABASE_ERROR,
          ErrorsResponseEnum.DATABASE_ERROR,
          undefined,
          "Could not find 'VARIABLE_SYMBOL', 'SPECIFIC_SYMBOL', 'CONSTANT_SYMBOL', 'USER_CONSTAT_SYMBOL' settings in database.",
        )
      }
    })

    return constants
  }

  async generateHeader(dateInfo: { today_DDMMYYYY: string }): Promise<string> {
    const constants = await this.getConstantsFromDatabase()
    return [
      '4',
      dateInfo.today_DDMMYYYY,
      dateInfo.today_DDMMYYYY,
      this.configService.getOrThrow<string>('REPORTING_FILE_NAME'),
      'Hlavné mesto Slovenskej republiky Bratislava',
      ' '.repeat(6),
      this.configService.getOrThrow<string>('REPORTING_ICO'),
      ' '.repeat(22),
      '<\n',
      '1',
      dateInfo.today_DDMMYYYY,
      dateInfo.today_DDMMYYYY,
      this.configService.getOrThrow<string>('REPORTING_ACCOUNT_ID'),
      this.configService.getOrThrow<string>('REPORTING_BANK_ID'),
      constants.VARIABLE_SYMBOL,
      constants.SPECIFIC_SYMBOL,
      constants.CONSTANT_SYMBOL,
      '\n',
    ].join('')
  }

  private async generateFileBody(
    finalData: CsvColumnsWithVariableSymbol[],
    yesterday_DDMMYYYY: string,
  ) {
    let kredit = 0
    let debet = 0
    let body = ''

    const constants = await this.getConstantsFromDatabase()

    finalData.forEach((row) => {
      const totalPrice = parseFloat(row.totalPrice.replace(',', '.'))
      const provision = parseFloat(row.provision.replace(',', '.'))
      const generatedRow = [
        '2390080180',
        Number(row.transactionId),
        ' ',
        yesterday_DDMMYYYY,
        this.generatePrice(totalPrice, 10),
        '000017S000000S',
        this.configService.getOrThrow<string>('REPORTING_ACCOUNT_ID'),
        this.configService.getOrThrow<string>('REPORTING_BANK_ID'),
        constants.USER_CONSTAT_SYMBOL,
        row.variableSymbol.padStart(10, '0'),
        '00000000003',
        ' '.repeat(14),
        '$\n',
      ].join('')

      body += generatedRow
      kredit += totalPrice
      debet += provision
    })

    return body
  }

  private generateFooter(finalData: CsvColumnsWithVariableSymbol[]) {
    const countTransactions = finalData.length
    const kredit = finalData.reduce(
      (sum, row) => sum + parseFloat(row.totalPrice.replace(',', '.')),
      0,
    )
    const debet = finalData.reduce(
      (sum, row) => sum + parseFloat(row.provision.replace(',', '.')),
      0,
    )
    return [
      '3',
      String(countTransactions).padStart(6, '0'),
      this.generatePrice(kredit, 12),
      this.generatePrice(debet, 6),
      '0'.repeat(8),
      '\n',
      '500000100',
      String(countTransactions).padStart(6, '0'),
      this.generatePrice(kredit, 12),
      this.generatePrice(debet, 6),
      '0'.repeat(8),
      '\n',
    ].join('')
  }

  private createFileName(today_YYMMDD: string): string {
    return `st1${this.configService.getOrThrow<string>('REPORTING_FILE_NAME')}_${today_YYMMDD}.txt`
  }

  private async generateResult(
    finalData: CsvColumnsWithVariableSymbol[],
    dateInfo: {
      today_DDMMYYYY: string
      today_YYMMDD: string
      yesterday_DDMMYYYY: string
    },
  ) {
    const head = await this.generateHeader(dateInfo)
    const body = await this.generateFileBody(
      finalData,
      dateInfo.yesterday_DDMMYYYY,
    )
    const footer = this.generateFooter(finalData)

    return head + body + footer
  }

  async generateAndSendPaymentReport() {
    const sftpFiles = await this.getFilesFromSftp()

    dayjs.extend(utc)
    dayjs.extend(timezone)

    const outputFiles: OutputFile[] = []

    // Processing new files
    for (const file of sftpFiles) {
      const fileDate = this.extractFileDate(file.name)
      if (!fileDate) continue

      const dateInfo = this.getDateInfo(fileDate)

      // Parse csv and add columns
      const csvData = this.processCsvData(file.content)

      // Extract variable symbols with all orderIds belonging to each VS
      const variableSymbols = await this.getVsByOrderId(
        csvData.map((row) => row.orderId),
      )

      // Find a matching a variable symbol to each row
      const finalData: CsvColumnsWithVariableSymbol[] =
        this.enrichDataWithVariableSymbols(csvData, variableSymbols)

      // Generate file content
      const processedFileResult = await this.generateResult(finalData, dateInfo)

      // Generate file name
      const processedFileFileName = this.createFileName(dateInfo.today_YYMMDD)

      outputFiles.push({
        filename: processedFileFileName,
        content: processedFileResult,
      })
    }

    const attachments = outputFiles.map((item) => {
      return { ...item, contentType: 'text/plain' }
    })

    const message =
      attachments.length == 0
        ? 'Dnes nie je čo reportovať'
        : 'Chceme niečo ako text sem?' // TODO better message

    await this.sendEmailWithAttachments(
      [this.configService.getOrThrow<string>('RECIPIENT_EMAIL')],
      'Report platieb kartou',
      message,
      attachments,
    )
  }
}
