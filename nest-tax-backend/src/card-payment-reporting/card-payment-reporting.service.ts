import { LineLoggerService } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import { parse } from 'csv-parse/sync'

import BaConfigService from '../config/ba-config.service'
import { TaxType } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import {
  formatDDMMYYYY,
  formatSlovakDate,
  formatYYMMDD,
  isBefore,
  nowInBratislava,
} from '../utils/functions/temporal'
import DatabaseSubservice from '../utils/subservices/database.subservice'
import EmailSubservice from '../utils/subservices/email.subservice'
import SftpFileSubservice, {
  parseSftpFileNameDate,
} from '../utils/subservices/sftp-file.subservice'

const REPORT_FILE_MAX_AGE_DAYS = 180

interface ReportTypeConfig {
  taxType: TaxType
  sftpPath: string
  fileName: string
  accountId: string
  bankId: string
}

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

export type CsvColumns = (typeof csvColumnNames)[number]

export type CsvRecord = Record<CsvColumns, string>
export type CsvColumnsWithVariableSymbol = CsvRecord & {
  variableSymbol: string
}

export interface OutputFile {
  filename: string
  content: string
  debet: number
  date: Temporal.PlainDate
}

@Injectable()
export class CardPaymentReportingService {
  private readonly logger = new LineLoggerService(
    CardPaymentReportingService.name,
  )

  constructor(
    private readonly prismaService: PrismaService,
    private readonly baConfigService: BaConfigService,
    private readonly mailSubservice: EmailSubservice,
    private readonly sftpFileSubservice: SftpFileSubservice,
    private readonly databaseSubservice: DatabaseSubservice,
  ) {}

  private getReportTypes(): ReportTypeConfig[] {
    const { [TaxType.DZN]: dzn, [TaxType.KO]: ko } =
      this.baConfigService.cardPaymentReporting
    return [
      {
        taxType: TaxType.DZN,
        sftpPath: dzn.sftpFilesPath,
        fileName: dzn.fileName,
        accountId: dzn.accountId,
        bankId: dzn.bankId,
      },
      {
        taxType: TaxType.KO,
        sftpPath: ko.sftpFilesPath,
        fileName: ko.fileName,
        accountId: ko.accountId,
        bankId: ko.bankId,
      },
    ]
  }

  private generatePrice(price: number, fill: number): string {
    const adjustedFill = price >= 0 ? fill + 3 : fill + 2
    const paddedPrice = Math.abs(price)
      .toFixed(2)
      .padStart(adjustedFill, '0')
      .replace('.', '')
    return price >= 0 ? paddedPrice : '-'.concat(paddedPrice)
  }

  private getDateInfo(fileDate: Temporal.PlainDate) {
    const today = fileDate
    const yesterday = today.subtract({ days: 1 })
    return {
      today_DDMMYYYY: formatDDMMYYYY(today),
      today_YYMMDD: formatYYMMDD(today),
      yesterday_DDMMYYYY: formatDDMMYYYY(yesterday),
      humanReadable: formatSlovakDate(today),
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
        rowData[col] = row[index]
      })
      return rowData
    })
  }

  private generateHeader(
    dateInfo: { today_DDMMYYYY: string },
    reportFileName: string,
    accountId: string,
    bankId: string,
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
      reportFileName,
      'Hlavné mesto Slovenskej republiky Bratislava',
      ' '.repeat(6),
      this.baConfigService.cardPaymentReporting.ico,
      ' '.repeat(22),
      '\n',
      '1',
      dateInfo.today_DDMMYYYY,
      dateInfo.today_DDMMYYYY,
      accountId,
      bankId,
      constants.REPORTING_VARIABLE_SYMBOL,
      constants.REPORTING_SPECIFIC_SYMBOL,
      constants.REPORTING_CONSTANT_SYMBOL,
      '\n',
    ].join('')
  }

  private generateFileBody(
    finalData: CsvColumnsWithVariableSymbol[],
    yesterday_DDMMYYYY: string,
    accountId: string,
    bankId: string,
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
        accountId,
        bankId,
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
      countTransactions += 1
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

  private createFileName(reportFileName: string, today_YYMMDD: string): string {
    return `st1${reportFileName}_${today_YYMMDD}.txt`
  }

  private async generateResult(
    finalData: CsvColumnsWithVariableSymbol[],
    reportFileName: string,
    accountId: string,
    bankId: string,
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
    const head = this.generateHeader(
      dateInfo,
      reportFileName,
      accountId,
      bankId,
      constants,
    )
    const body = this.generateFileBody(
      finalData,
      dateInfo.yesterday_DDMMYYYY,
      accountId,
      bankId,
      constants,
    )
    const footer = this.generateFooter(finalData)

    return head + body + footer
  }

  private async processReportType(
    reportType: ReportTypeConfig,
    from?: Date,
  ): Promise<{
    outputFiles: OutputFile[]
    sftpFileNames: { taxType: TaxType; name: string }[]
  }> {
    const { sftpPath, fileName: reportFileName, accountId, bankId } = reportType
    const sftpFiles = await this.sftpFileSubservice.getNewFiles(
      sftpPath,
      reportType.taxType,
      from,
    )

    const maxAgeCutoff = nowInBratislava()
      .toPlainDate()
      .subtract({ days: REPORT_FILE_MAX_AGE_DAYS })

    const outputFiles: (OutputFile | null)[] = await Promise.all(
      sftpFiles.map(async (file) => {
        const fileDate = parseSftpFileNameDate(file.name)
        if (!fileDate) {
          this.logger.warn({
            message:
              'Skipping card payment report file without a date in its name.',
            taxType: reportType.taxType,
            fileName: file.name,
          })
          return null
        }

        if (isBefore(fileDate, maxAgeCutoff)) {
          return null
        }

        const dateInfo = this.getDateInfo(fileDate)

        const csvData = this.processCsvData(file.content)

        // Skip specifically files that return fee as the third row.
        // We do not have good info about column names in this case, so we just match this exact case
        if (
          csvData.length === 2 &&
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
          reportFileName,
          accountId,
          bankId,
          dateInfo,
        )

        // Generate file name
        const processedFileFileName = this.createFileName(
          reportFileName,
          dateInfo.today_YYMMDD,
        )

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

    return {
      outputFiles: outputFiles.filter((file) => file !== null),
      sftpFileNames: sftpFiles.map((file) => ({
        taxType: reportType.taxType,
        name: file.name,
      })),
    }
  }

  private async sendReportEmail(
    emailRecipients: string[],
    taxType: TaxType,
    outputFiles: OutputFile[],
  ) {
    const attachments = outputFiles.map((item) => ({
      filename: item.filename,
      content: item.content,
      contentType: 'text/plain',
    }))

    outputFiles.sort((a, b) => Temporal.PlainDate.compare(a.date, b.date))

    const message =
      attachments.length === 0
        ? 'Dnes nie je čo reportovať.'
        : `Report z dní:\n  - ${outputFiles.map((file) => [formatSlovakDate(file.date), ' s nezarátaným poplatkom ', file.debet, '€'].join('')).join('\n  - ')}`

    await this.mailSubservice.send(
      emailRecipients,
      `Report platieb kartou - ${taxType}`,
      message,
      attachments,
    )
  }

  private async processAndSendReport(
    reportType: ReportTypeConfig,
    emailRecipients: string[],
    from?: Date,
  ) {
    const result = await this.processReportType(reportType, from)
    await this.sendReportEmail(
      emailRecipients,
      reportType.taxType,
      result.outputFiles,
    )
    return result
  }

  async generateAndSendPaymentReport(emailRecipients: string[], from?: Date) {
    const results = await Promise.all(
      this.getReportTypes().map(async (reportType) =>
        this.processAndSendReport(reportType, emailRecipients, from),
      ),
    )

    // We do not want to update the database if custom range was used
    if (from) {
      return
    }

    const allProcessedFiles = results.flatMap((r) => r.sftpFileNames)

    // Write updated CSV names with their tax type
    await this.prismaService.csvFile.createMany({
      data: allProcessedFiles.map((file) => ({
        name: file.name,
        taxType: file.taxType,
      })),
    })
  }
}
