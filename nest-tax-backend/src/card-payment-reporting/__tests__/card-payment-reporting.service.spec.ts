import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import EmailSubservice from '../../utils/subservices/email.subservice'
import SftpFileSubservice from '../../utils/subservices/sftp-file.subservice'
import {
  CardPaymentReportingService,
  type CsvRecord,
} from '../card-payment-reporting.service'

const makeCsvFileContent = (rows: string[]) =>
  [`TU;1234567890`, ...rows].join('\n')

const makePosRow = (overrides: Partial<Record<CsvColumns, string>> = {}) => {
  const defaults: Record<CsvColumns, string> = {
    transactionType: 'POS',
    terminalId: '11111111',
    transactionId: '222222222222',
    transactionType_: 'S',
    date: '09.11.24',
    totalPrice: '100,00',
    provision: '1,50',
    priceWithoutProvision: '98,50',
    cashBack: '0,00',
    authCode: '777777',
    cardNumber: '888888******9999',
    cardType: 'V',
    closureId: '111111',
    orderId: '2222222222222222',
  }
  const merged = { ...defaults, ...overrides }
  return csvColumnNames.map((col) => merged[col]).join(';')
}

describe('CardPaymentReportingService', () => {
  let service: CardPaymentReportingService
  let mockConfigService: { getOrThrow: jest.Mock }
  let mockSftpFileSubservice: { getNewFiles: jest.Mock }
  let mockDatabaseSubservice: {
    getVariableSymbolsByOrderIds: jest.Mock
    getConfigByKeys: jest.Mock
  }
  let mockEmailSubservice: { send: jest.Mock }
  let mockPrismaService: {
    tax: { findMany: jest.Mock }
    config: { findMany: jest.Mock }
    csvFile: { createMany: jest.Mock }
  }

  beforeEach(async () => {
    mockPrismaService = {
      tax: { findMany: jest.fn() },
      config: { findMany: jest.fn() },
      csvFile: { createMany: jest.fn() },
    }
    mockConfigService = {
      getOrThrow: jest.fn(),
    }
    mockSftpFileSubservice = {
      getNewFiles: jest.fn().mockResolvedValue([]),
    }
    mockDatabaseSubservice = {
      getVariableSymbolsByOrderIds: jest.fn().mockResolvedValue([]),
      getConfigByKeys: jest.fn().mockResolvedValue({
        REPORTING_USER_CONSTANT_SYMBOL: '0000000001',
        REPORTING_VARIABLE_SYMBOL: '0000000002',
        REPORTING_SPECIFIC_SYMBOL: '0000000003',
        REPORTING_CONSTANT_SYMBOL: '0000000004',
      }),
    }
    mockEmailSubservice = { send: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardPaymentReportingService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: ThrowerErrorGuard,
          useValue: { InternalServerErrorException: jest.fn() },
        },
        { provide: EmailSubservice, useValue: mockEmailSubservice },
        { provide: SftpFileSubservice, useValue: mockSftpFileSubservice },
        { provide: DatabaseSubservice, useValue: mockDatabaseSubservice },
      ],
    }).compile()

    service = module.get<CardPaymentReportingService>(
      CardPaymentReportingService,
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('extractFileDate', () => {
    it('should extract and return file date when valid', () => {
      const fileName = 'AH_DATA_99999999_9999999999_999_2411089999.csv'
      const result = service['extractFileDate'](fileName)
      expect(result).toBe('20241108')
    })

    it('should return null for invalid file name format', () => {
      const fileName = 'invalid_filename.csv'
      const result = service['extractFileDate'](fileName)
      expect(result).toBeNull()
    })
  })

  describe('getDateInfo', () => {
    it('should return date information based on the input date string', () => {
      dayjs.extend(utc)
      dayjs.extend(timezone)
      const fileDate = '20231001'
      const result = service['getDateInfo'](fileDate)
      expect(result.today_DDMMYYYY).toBe('01102023')
      expect(result.today_YYMMDD).toBe('231001')
      expect(result.humanReadable).toBe('01.10.2023')
    })
  })

  describe('processCsvData', () => {
    it('should parse and map CSV content to CSV record format', () => {
      const csvContent = `TU;1234567890
POS;11111111;222222222222;S;09.11.24;333,33;4,44;555,55;6,66;777777;888888******9999;V;111111;2222222222222222
POS;55555555;666666666666;S;09.11.24;77,77;8,88;99,99;1,11;222222;333333******4444;V;555555;6666666666666666
POS;;0000001;D;05.11.24;-9,99;-0,00;-9,99;0,00;;Popl. za settlement; ;0;`

      const result = service['processCsvData'](csvContent)
      expect(result).toHaveLength(3)
      expect(result).toStrictEqual([
        {
          authCode: '777777',
          cardNumber: '888888******9999',
          cardType: 'V',
          cashBack: '6,66',
          closureId: '111111',
          date: '09.11.24',
          orderId: '2222222222222222',
          priceWithoutProvision: '555,55',
          provision: '4,44',
          terminalId: '11111111',
          totalPrice: '333,33',
          transactionId: '222222222222',
          transactionType: 'POS',
          transactionType_: 'S',
        },
        {
          authCode: '222222',
          cardNumber: '333333******4444',
          cardType: 'V',
          cashBack: '1,11',
          closureId: '555555',
          date: '09.11.24',
          orderId: '6666666666666666',
          priceWithoutProvision: '99,99',
          provision: '8,88',
          terminalId: '55555555',
          totalPrice: '77,77',
          transactionId: '666666666666',
          transactionType: 'POS',
          transactionType_: 'S',
        },
        {
          authCode: '',
          cardNumber: 'Popl. za settlement',
          cardType: ' ',
          cashBack: '0,00',
          closureId: '0',
          date: '05.11.24',
          orderId: '',
          priceWithoutProvision: '-9,99',
          provision: '-0,00',
          terminalId: '',
          totalPrice: '-9,99',
          transactionId: '0000001',
          transactionType: 'POS',
          transactionType_: 'D',
        },
      ])
    })
  })

  describe('generatePrice', () => {
    it('should generate a proper price string when price is positive', () => {
      const result = service['generatePrice'](123.45, 10)
      expect(result).toBe('000000012345')
    })

    it('should generate a proper price string when price is negative', () => {
      const result = service['generatePrice'](-123.45, 10)
      expect(result).toBe('-00000012345')
    })
  })

  describe('enrichDataWithVariableSymbols', () => {
    it('should enrich CSV data with variable symbols', () => {
      const csvData = [
        { orderId: '0001234', totalPrice: '123' } as CsvRecord,
        { orderId: '0005678', totalPrice: '567' } as CsvRecord,
      ]

      // orderIds have trimmed zeros when pairing variable symbols
      const variableSymbols = [
        { variableSymbol: 'VS123', orderIds: ['1234', '2222'] },
        { variableSymbol: 'VS567', orderIds: ['5678', '4444'] },
      ]

      const result = service['enrichDataWithVariableSymbols'](
        csvData,
        variableSymbols,
      )
      expect(result).toStrictEqual([
        { orderId: '0001234', totalPrice: '123', variableSymbol: 'VS123' },
        { orderId: '0005678', totalPrice: '567', variableSymbol: 'VS567' },
      ])
    })

    it('should assign an empty string as variable symbol if no match is found', () => {
      const csvData = [
        {
          orderId: '0005678',
          totalPrice: '123',
          transactionType: 'type1',
        } as CsvRecord,
      ]
      const variableSymbols = [
        { variableSymbol: 'VS123', orderIds: ['1234', '2222'] },
      ]

      const result = service['enrichDataWithVariableSymbols'](
        csvData,
        variableSymbols,
      )
      expect(result[0].variableSymbol).toBe('')
    })
  })

  describe('generateAndSendPaymentReport', () => {
    const envValues: Record<string, string> = {
      REPORTING_SFTP_FILES_PATH: '7322226495/oms/cz',
      REPORTING_FILE_NAME: 'pbr24',
      REPORTING_PKO_SFTP_FILES_PATH: '7322257895/oms/cz',
      REPORTING_PKO_FILE_NAME: 'pbr26',
      REPORTING_ICO: '00603481',
      REPORTING_ACCOUNT_ID: '1234567890123456',
      REPORTING_BANK_ID: '1100',
    }

    beforeEach(() => {
      mockConfigService.getOrThrow.mockImplementation((key: string) => {
        const value = envValues[key]
        if (!value) throw new Error(`Missing config key: ${key}`)
        return value
      })
    })

    it('should process files from both DzN and PKO SFTP paths', async () => {
      const dznCsv = makeCsvFileContent([
        makePosRow({ orderId: '1111111111111111' }),
      ])
      const pkoCsv = makeCsvFileContent([
        makePosRow({ orderId: '2222222222222222' }),
      ])

      mockSftpFileSubservice.getNewFiles.mockImplementation(
        async (sftpPath: string) => {
          if (sftpPath === '7322226495/oms/cz') {
            return Promise.resolve([
              { name: 'AH_DATA_1_2_3_2604101234.csv', content: dznCsv },
            ])
          }
          if (sftpPath === '7322257895/oms/cz') {
            return Promise.resolve([
              { name: 'AH_DATA_1_2_3_2604101234.csv', content: pkoCsv },
            ])
          }
          return Promise.resolve([])
        },
      )

      await service.generateAndSendPaymentReport(['test@example.com'])

      expect(mockSftpFileSubservice.getNewFiles).toHaveBeenCalledTimes(2)
      expect(mockSftpFileSubservice.getNewFiles).toHaveBeenCalledWith(
        '7322226495/oms/cz',
        'DZN',
        undefined,
      )
      expect(mockSftpFileSubservice.getNewFiles).toHaveBeenCalledWith(
        '7322257895/oms/cz',
        'KO',
        undefined,
      )

      expect(mockEmailSubservice.send).toHaveBeenCalledTimes(2)

      const dznCall = mockEmailSubservice.send.mock.calls.find(
        (call: unknown[]) => call[1] === 'Report platieb kartou - DZN',
      )
      const pkoCall = mockEmailSubservice.send.mock.calls.find(
        (call: unknown[]) => call[1] === 'Report platieb kartou - KO',
      )

      expect(dznCall).toBeDefined()
      expect(pkoCall).toBeDefined()
      expect(dznCall[3]).toHaveLength(1)
      expect(dznCall[3][0].filename).toBe('st1pbr24_260410.txt')
      expect(pkoCall[3]).toHaveLength(1)
      expect(pkoCall[3][0].filename).toBe('st1pbr26_260410.txt')
    })

    it('should generate correct file content with proper header for each report type', async () => {
      const csv = makeCsvFileContent([
        makePosRow({ orderId: '1111111111111111' }),
      ])

      mockSftpFileSubservice.getNewFiles.mockImplementation(
        async (sftpPath: string) => {
          if (sftpPath === '7322226495/oms/cz') {
            return Promise.resolve([
              { name: 'AH_DATA_1_2_3_2604101234.csv', content: csv },
            ])
          }
          if (sftpPath === '7322257895/oms/cz') {
            return Promise.resolve([
              { name: 'AH_DATA_1_2_3_2604101234.csv', content: csv },
            ])
          }
          return Promise.resolve([])
        },
      )

      await service.generateAndSendPaymentReport(['test@example.com'])

      const dznCall = mockEmailSubservice.send.mock.calls.find(
        (call: unknown[]) => call[1] === 'Report platieb kartou - DZN',
      )
      const pkoCall = mockEmailSubservice.send.mock.calls.find(
        (call: unknown[]) => call[1] === 'Report platieb kartou - KO',
      )

      expect(dznCall[3][0].content).toContain('pbr24')
      expect(dznCall[3][0].content).not.toContain('pbr26')
      expect(pkoCall[3][0].content).toContain('pbr26')
      expect(pkoCall[3][0].content).not.toContain('pbr24')
    })

    it('should store CSV file names with their tax type', async () => {
      const csv = makeCsvFileContent([
        makePosRow({ orderId: '1111111111111111' }),
      ])

      mockSftpFileSubservice.getNewFiles.mockImplementation(
        async (sftpPath: string) => {
          if (sftpPath === '7322226495/oms/cz') {
            return Promise.resolve([
              { name: 'dzn_file_2604101234.csv', content: csv },
            ])
          }
          if (sftpPath === '7322257895/oms/cz') {
            return Promise.resolve([
              { name: 'pko_file_2604101234.csv', content: csv },
            ])
          }
          return Promise.resolve([])
        },
      )

      await service.generateAndSendPaymentReport(['test@example.com'])

      expect(mockPrismaService.csvFile.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          { name: 'dzn_file_2604101234.csv', taxType: 'DZN' },
          { name: 'pko_file_2604101234.csv', taxType: 'KO' },
        ]),
      })
    })

    it('should not store CSV file names when custom date range is used', async () => {
      mockSftpFileSubservice.getNewFiles.mockResolvedValue([])

      await service.generateAndSendPaymentReport(
        ['test@example.com'],
        new Date('2026-04-01'),
      )

      expect(mockPrismaService.csvFile.createMany).not.toHaveBeenCalled()
    })

    it('should send separate no-report emails when both paths return no files', async () => {
      mockSftpFileSubservice.getNewFiles.mockResolvedValue([])

      await service.generateAndSendPaymentReport(['test@example.com'])

      expect(mockEmailSubservice.send).toHaveBeenCalledTimes(2)
      expect(mockEmailSubservice.send).toHaveBeenCalledWith(
        ['test@example.com'],
        'Report platieb kartou - DZN',
        'Dnes nie je čo reportovať.',
        [],
      )
      expect(mockEmailSubservice.send).toHaveBeenCalledWith(
        ['test@example.com'],
        'Report platieb kartou - KO',
        'Dnes nie je čo reportovať.',
        [],
      )
    })

    it('should handle one report type having files and the other empty', async () => {
      const csv = makeCsvFileContent([
        makePosRow({ orderId: '1111111111111111' }),
      ])

      mockSftpFileSubservice.getNewFiles.mockImplementation(
        async (sftpPath: string) => {
          if (sftpPath === '7322257895/oms/cz') {
            return Promise.resolve([
              { name: 'AH_DATA_1_2_3_2604101234.csv', content: csv },
            ])
          }
          return Promise.resolve([])
        },
      )

      await service.generateAndSendPaymentReport(['test@example.com'])

      const dznCall = mockEmailSubservice.send.mock.calls.find(
        (call: unknown[]) => call[1] === 'Report platieb kartou - DZN',
      )
      const pkoCall = mockEmailSubservice.send.mock.calls.find(
        (call: unknown[]) => call[1] === 'Report platieb kartou - KO',
      )

      expect(dznCall[3]).toHaveLength(0)
      expect(pkoCall[3]).toHaveLength(1)
      expect(pkoCall[3][0].filename).toBe('st1pbr26_260410.txt')
    })
  })
})
