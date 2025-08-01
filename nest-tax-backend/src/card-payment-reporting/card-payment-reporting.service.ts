import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { parse } from 'csv-parse/sync'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { PrismaService } from '../prisma/prisma.service'
import DatabaseSubservice from '../utils/subservices/database.subservice'
import EmailSubservice from '../utils/subservices/email.subservice'
import SftpFileSubservice from '../utils/subservices/sftp-file.subservice'

dayjs.extend(utc)
dayjs.extend(timezone)

export const csvColumnNames = [
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

export interface OutputFile {
  filename: string
  content: string
  debet: number
  date: dayjs.Dayjs
}

@Injectable()
export class CardPaymentReportingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailSubservice: EmailSubservice,
    private readonly sftpFileSubservice: SftpFileSubservice,
    private readonly databaseSubservice: DatabaseSubservice,
  ) {}

  private generatePrice(price: number, fill: number): string {
    const adjustedFill = price >= 0 ? fill + 3 : fill + 2
    const paddedPrice = Math.abs(price)
      .toFixed(2)
      .padStart(adjustedFill, '0')
      .replace('.', '')
    return price >= 0 ? paddedPrice : '-'.concat(paddedPrice)
  }

  private extractFileDate(fileName: string): string | null {
    const fileDateMatches = fileName.split('_').pop()?.slice(0, 6)
    if (!fileDateMatches || Number.isNaN(Number(fileDateMatches))) {
      return null
    }
    return `20${fileDateMatches}` // Add century
  }

  private getDateInfo(fileDate: string) {
    const today = dayjs(fileDate).tz('Europe/Bratislava')
    const yesterday = today.subtract(1, 'day')
    return {
      today_DDMMYYYY: today.format('DDMMYYYY'),
      today_YYMMDD: today.format('YYMMDD'),
      yesterday_DDMMYYYY: yesterday.format('DDMMYYYY'),
      humanReadable: today.format('DD.MM.YYYY'),
      today,
    }
  }

  private enrichDataWithVariableSymbols(
    csvData: CsvRecord[],
    variableSymbols: { variableSymbol: string; orderIds: (string | null)[] }[],
  ): CsvColumnsWithVariableSymbol[] {
    return csvData.map((row) => {
      const vsMatch =
        variableSymbols.find((item) =>
          item.orderIds.includes(Number(row.orderId).toString()),
        )?.variableSymbol || ''
      return { ...row, variableSymbol: vsMatch }
    })
  }

  private processCsvData(csvContent: string): CsvRecord[] {
    const rows = parse(csvContent, {
      delimiter: ';',
      fromLine: 2, // Skip first line
      relaxColumnCountLess: true,
    })

    return rows.map((row: string[]) => {
      const rowData: CsvRecord = {} as CsvRecord
      csvColumnNames.forEach((col, index) => {
        rowData[col] = row[index] ?? ''
      })
      return rowData
    })
  }

  generateHeader(
    dateInfo: { today_DDMMYYYY: string },
    constants: {
      REPORTING_VARIABLE_SYMBOL: string
      REPORTING_SPECIFIC_SYMBOL: string
      REPORTING_CONSTANT_SYMBOL: string
    },
  ): string {
    return [
      '4',
      dateInfo.today_DDMMYYYY,
      dateInfo.today_DDMMYYYY,
      this.configService.getOrThrow<string>('REPORTING_FILE_NAME'),
      'Hlavné mesto Slovenskej republiky Bratislava',
      ' '.repeat(6),
      this.configService.getOrThrow<string>('REPORTING_ICO'),
      ' '.repeat(22),
      '\n',
      '1',
      dateInfo.today_DDMMYYYY,
      dateInfo.today_DDMMYYYY,
      this.configService.getOrThrow<string>('REPORTING_ACCOUNT_ID'),
      this.configService.getOrThrow<string>('REPORTING_BANK_ID'),
      constants.REPORTING_VARIABLE_SYMBOL,
      constants.REPORTING_SPECIFIC_SYMBOL,
      constants.REPORTING_CONSTANT_SYMBOL,
      '\n',
    ].join('')
  }

  private generateFileBody(
    finalData: CsvColumnsWithVariableSymbol[],
    yesterday_DDMMYYYY: string,
    constants: { REPORTING_USER_CONSTANT_SYMBOL: string },
  ): string {
    let body = ''
    finalData.forEach((row) => {
      if (row.orderId.length === 0) {
        return
      }

      const totalPrice = parseFloat(row.totalPrice.replace(',', '.'))

      const generatedRow = [
        '2390080180', // padding?
        Number(row.transactionId),
        ' ',
        yesterday_DDMMYYYY,
        this.generatePrice(totalPrice, 10),
        '000017S000000S', // padding?
        this.configService.getOrThrow<string>('REPORTING_ACCOUNT_ID'),
        this.configService.getOrThrow<string>('REPORTING_BANK_ID'),
        constants.REPORTING_USER_CONSTANT_SYMBOL,
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
    const formatedData = finalData.map((row) => {
      return {
        totalPrice: parseFloat(row.totalPrice.replace(',', '.')),
        provision: parseFloat(row.provision.replace(',', '.')),
        isRegular: row.orderId.length > 0,
      }
    })

    let countTransactions = 0
    let kredit = 0
    let debet = 0

    formatedData.forEach((row) => {
      if (!row.isRegular) {
        return
      }
      kredit += Math.max(row.totalPrice, 0)
      debet += row.provision - Math.min(row.totalPrice, 0)
      countTransactions++
    })

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
    const constants = await this.databaseSubservice.getConfigByKeys([
      'REPORTING_USER_CONSTANT_SYMBOL',
      'REPORTING_VARIABLE_SYMBOL',
      'REPORTING_SPECIFIC_SYMBOL',
      'REPORTING_CONSTANT_SYMBOL',
    ])
    const head = this.generateHeader(dateInfo, constants)
    const body = this.generateFileBody(
      finalData,
      dateInfo.yesterday_DDMMYYYY,
      constants,
    )
    const footer = this.generateFooter(finalData)

    return head + body + footer
  }

  async generateAndSendPaymentReport(emailRecipients: string[], from?: Date) {
    const sftpFiles = await this.sftpFileSubservice.getNewFiles(from)

    const hundredEightyDaysAgo = dayjs().subtract(180, 'day')

    // Processing new files
    const outputFiles: (OutputFile | null)[] = await Promise.all(
      sftpFiles.map(async (file) => {
        const fileDate = this.extractFileDate(file.name)
        if (!fileDate) {
          return null
        }

        const dateInfo = this.getDateInfo(fileDate)

        if (dateInfo.today.isBefore(hundredEightyDaysAgo)) {
          return null
        }

        const csvData = this.processCsvData(file.content)

        // Skip specifically files that return fee as the third row.
        // We do not have good info about column names in this case, so we just match this exact case
        if (
          csvData.length === 2 &&
          csvData[1] &&
          csvData[1].transactionType === 'POHL' &&
          csvData[1].transactionId === '0,15'
        ) {
          return null
        }

        // Extract variable symbols with all orderIds belonging to each VS
        const variableSymbols =
          await this.databaseSubservice.getVariableSymbolsByOrderIds(
            csvData.map((row) => Number(row.orderId).toString()),
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

        // Count debet
        const debet = finalData.reduce((sum, row) => {
          const value = parseFloat(row.totalPrice.replace(',', '.'))
          return value < 0 ? sum - value : sum
        }, 0)

        return {
          filename: processedFileFileName,
          content: processedFileResult,
          debet,
          date: dateInfo.today,
        }
      }),
    )
    // Filter out any `null` values caused by skipping files without a valid date
    const validOutputFiles = outputFiles.filter((file) => file !== null)

    const attachments = validOutputFiles.map((item) => {
      return {
        filename: item.filename,
        content: item.content,
        contentType: 'text/plain',
      }
    })

    const validOutputFilesSorted = [...validOutputFiles].sort(
      (a: OutputFile, b: OutputFile) => {
        if (a.date.isBefore(b.date)) {
          return a.date.isAfter(b.date) ? 1 : -1
        }
        return a.date.isAfter(b.date) ? 1 : 0
      },
    )

    const message =
      attachments.length === 0
        ? 'Dnes nie je čo reportovať.'
        : `Report z dní:\n  - ${validOutputFilesSorted.map((file: OutputFile) => [file.date.format('DD.MM.YYYY'), ' s nezarátaným poplatkom ', file.debet, '€'].join('')).join('\n  - ')}`

    await this.mailSubservice.send(
      emailRecipients,
      'Report platieb kartou',
      message,
      attachments,
    )

    // We do not want to update the database if custom range was used
    if (from) {
      return
    }

    // Write updated CSV names
    await this.prismaService.csvFile.createMany({
      data: sftpFiles.map((file) => ({
        name: file.name,
      })),
    })
  }
}
