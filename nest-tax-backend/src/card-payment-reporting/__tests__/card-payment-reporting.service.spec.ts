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
import { CardPaymentReportingService } from '../card-payment-reporting.service'

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

describe('CardPaymentReportingService', () => {
  let service: CardPaymentReportingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardPaymentReportingService,
        {
          provide: PrismaService,
          useValue: {
            tax: {
              findMany: jest.fn(),
            },
            config: {
              findMany: jest.fn(),
            },
            csvFile: {
              createMany: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
        {
          provide: ThrowerErrorGuard,
          useValue: {
            InternalServerErrorException: jest.fn(),
          },
        },
        {
          provide: EmailSubservice,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: SftpFileSubservice,
          useValue: {
            getNewFiles: jest.fn(),
          },
        },
        {
          provide: DatabaseSubservice,
          useValue: {
            getVariableSymbolsByOrderIds: jest.fn(),
          },
        },
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
        { orderId: 'order1', totalPrice: '123' } as CsvRecord,
        { orderId: 'order3', totalPrice: '456' } as CsvRecord,
      ]
      const variableSymbols = [
        { variableSymbol: 'VS123', orderIds: ['order1', 'order2'] },
        { variableSymbol: 'VS456', orderIds: ['order3', 'order4'] },
      ]

      const result = service['enrichDataWithVariableSymbols'](
        csvData,
        variableSymbols,
      )
      expect(result).toStrictEqual([
        { orderId: 'order1', totalPrice: '123', variableSymbol: 'VS123' },
        { orderId: 'order3', totalPrice: '456', variableSymbol: 'VS456' },
      ])
    })

    it('should assign an empty string as variable symbol if no match is found', () => {
      const csvData = [
        {
          orderId: 'order3',
          totalPrice: '123',
          transactionType: 'type1',
        } as CsvRecord,
      ]
      const variableSymbols = [
        { variableSymbol: 'VS123', orderIds: ['order1', 'order2'] },
      ]

      const result = service['enrichDataWithVariableSymbols'](
        csvData,
        variableSymbols,
      )
      expect(result[0].variableSymbol).toBe('')
    })
  })
})
