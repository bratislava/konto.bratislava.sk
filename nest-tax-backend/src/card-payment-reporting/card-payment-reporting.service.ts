import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { parse } from 'csv-parse/sync'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { PrismaService } from '../prisma/prisma.service'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import EmailSubservice from '../utils/subservices/email.subservice'
import SftpFileSubservice from '../utils/subservices/sftp-file.subservice'

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
export class CardPaymentReportingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly mailSubservice: EmailSubservice,
    private readonly sftpFileSubservice: SftpFileSubservice,
  ) {}

  private readonly generatePrice = (price: number, fill: number): string => {
    const adjustedFill = price >= 0 ? fill + 3 : fill + 2
    const paddedPrice = Math.abs(price)
      .toFixed(2)
      .padStart(adjustedFill + 3, '0')
      .replace('.', '')
    return price >= 0 ? paddedPrice : '-'.concat(paddedPrice)
  }

  private async getVsByOrderId(
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

  private extractFileDate(fileName: string): string | null {
    const fileDateMatches = fileName.split('_').pop()?.slice(0, 6)
    if (!fileDateMatches || Number.isNaN(Number(fileDateMatches))) return null
    return `20${fileDateMatches}` // Add century
  }

  private getDateInfo(fileDate: string) {
    const today = dayjs(fileDate).tz('Europe/Bratislava')
    const yesterday = today.subtract(1, 'day')
    return {
      today_DDMMYYYY: today.format('DDMMYYYY'),
      today_YYMMDD: today.format('YYMMDD'),
      yesterday_DDMMYYYY: yesterday.format('DDMMYYYY'),
    }
  }

  private enrichDataWithVariableSymbols(
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

  private processCsvData(csvContent: string): CsvRecord[] {
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

  private async getConfigFromDatabase() {
    const requiredKeys = [
      'VARIABLE_SYMBOL',
      'SPECIFIC_SYMBOL',
      'CONSTANT_SYMBOL',
      'USER_CONSTAT_SYMBOL',
      'REPORTING_SEND_EMAIL',
    ]
    let constants: Record<string, string>
    try {
      const result = await this.prisma.config.findMany({
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
    const constants = await this.getConfigFromDatabase()
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
    let body = ''

    const constants = await this.getConfigFromDatabase()

    finalData.forEach((row) => {
      const totalPrice = parseFloat(row.totalPrice.replace(',', '.'))
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
    const sftpFiles = await this.sftpFileSubservice.getNewFiles()

    const configs = await this.getConfigFromDatabase()

    if (configs.REPORTING_SEND_EMAIL !== 'true') {
      return
    }

    dayjs.extend(utc)
    dayjs.extend(timezone)

    // Processing new files
    const outputFiles: (OutputFile | null)[] = await Promise.all(
      sftpFiles.map(async (file) => {
        const fileDate = this.extractFileDate(file.name)
        if (!fileDate) return null

        const dateInfo = this.getDateInfo(fileDate)

        // Parse CSV and add columns
        const csvData = this.processCsvData(file.content)

        // Extract variable symbols with all orderIds belonging to each VS
        const variableSymbols = await this.getVsByOrderId(
          csvData.map((row) => row.orderId),
        )

        // Find a matching variable symbol for each row
        const finalData: CsvColumnsWithVariableSymbol[] =
          this.enrichDataWithVariableSymbols(csvData, variableSymbols)

        // Generate file content
        const processedFileResult = await this.generateResult(
          finalData,
          dateInfo,
        )

        // Generate file name
        const processedFileFileName = this.createFileName(dateInfo.today_YYMMDD)

        return {
          filename: processedFileFileName,
          content: processedFileResult,
        }
      }),
    )
    // Filter out any `null` values caused by skipping files without a valid date
    const validOutputFiles = outputFiles.filter((file) => file !== null)

    const attachments = validOutputFiles.map((item) => {
      return { ...item, contentType: 'text/plain' }
    })

    const message =
      attachments.length === 0
        ? 'Dnes nie je čo reportovať'
        : 'Chceme niečo ako text sem?' // TODO better message

    await this.mailSubservice.send(
      [this.configService.getOrThrow<string>('RECIPIENT_EMAIL')],
      'Report platieb kartou',
      message,
      attachments,
    )
  }
}
