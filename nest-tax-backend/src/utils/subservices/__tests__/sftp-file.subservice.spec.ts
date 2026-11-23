import { ErrorFactoryService } from '@bratislava/log-nest'
import { Test, TestingModule } from '@nestjs/testing'
import { FileInfo } from 'ssh2-sftp-client'

import BaConfigService from '../../../config/ba-config.service'
import { PrismaService } from '../../../prisma/prisma.service'
import alertReporting from '../../constants/error.alerts'
import { formatYYMMDD } from '../../functions/temporal'
import SftpFileSubservice, {
  parseSftpFileNameDate,
} from '../sftp-file.subservice'

// Mock SFTPClient
vi.mock('ssh2-sftp-client')

// Mock dependencies
const mockPrismaService = {
  csvFile: {
    findMany: vi.fn(),
  },
}

const mockBaConfigService = {
  cardPaymentReporting: {
    sftp: {
      host: 'sftp-host',
      port: 22,
      username: 'sftp-user',
      privateKey: 'sftp-key',
    },
  },
}

describe('SftpFileSubservice', () => {
  let service: SftpFileSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SftpFileSubservice,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: BaConfigService, useValue: mockBaConfigService },
        {
          provide: ErrorFactoryService,
          useValue: new ErrorFactoryService({ alertReporting }),
        },
      ],
    }).compile()

    service = module.get<SftpFileSubservice>(SftpFileSubservice)
  })

  it('filterAlreadyReportedFiles should filter out already reported files', async () => {
    const mockFiles: FileInfo[] = [
      {
        name: 'file1.csv',
        type: '-',
        size: 200,
        modifyTime: 0,
        accessTime: 0,
        rights: {
          user: '',
          group: '',
          other: '',
        },
        owner: 0,
        group: 0,
      },
      {
        name: 'file2.csv',
        type: '-',
        size: 300,
        modifyTime: 0,
        accessTime: 0,
        rights: {
          user: '',
          group: '',
          other: '',
        },
        owner: 0,
        group: 0,
      },
    ]
    const mockReportedFiles = [{ name: 'file1.csv' }]

    mockPrismaService.csvFile.findMany.mockResolvedValue(mockReportedFiles)

    const result = await service['filterAlreadyReportedFiles']('DZN', mockFiles)

    expect(mockPrismaService.csvFile.findMany).toHaveBeenCalledWith({
      select: { name: true },
      where: {
        name: { in: mockFiles.map((file) => file.name) },
        taxType: 'DZN',
      },
    })
    expect(result).toEqual(['file2.csv'])
  })

  it('filterFilesBeforeDate should filter files based on date', () => {
    const mockFiles: FileInfo[] = [
      {
        name: 'AA_AAAA_0123456789_0123456789_15_25012434.csv',
        type: '-',
        size: 300,
        modifyTime: 0,
        accessTime: 0,
        rights: {
          user: '',
          group: '',
          other: '',
        },
        owner: 0,
        group: 0,
      },
      {
        name: 'AA_AAAA_0123456789_0123456789_15_25012576.csv',
        type: '-',
        size: 300,
        modifyTime: 0,
        accessTime: 0,
        rights: {
          user: '',
          group: '',
          other: '',
        },
        owner: 0,
        group: 0,
      },
      {
        name: 'AA_AAAA_0123456789_0123456789_15_25012618.csv',
        type: '-',
        size: 300,
        modifyTime: 0,
        accessTime: 0,
        rights: {
          user: '',
          group: '',
          other: '',
        },
        owner: 0,
        group: 0,
      },
      {
        name: 'invalid.csv',
        type: '-',
        size: 150,
        modifyTime: 0,
        accessTime: 0,
        rights: {
          user: '',
          group: '',
          other: '',
        },
        owner: 0,
        group: 0,
      },
    ]
    const fromDate = new Date('2025-01-25')

    const result = service['filterFilesBeforeDate'](mockFiles, fromDate)

    expect(result).toEqual([
      'AA_AAAA_0123456789_0123456789_15_25012576.csv',
      'AA_AAAA_0123456789_0123456789_15_25012618.csv',
    ])
  })
})

describe('parseSftpFileNameDate', () => {
  it.each([
    { fileName: 'AH_DATA_1_2_3_25012434.csv', expected: '2025-01-24' },
    {
      fileName: 'AH_DATA_99999999_9999999999_999_2411089999.csv',
      expected: '2024-11-08',
    },
    { fileName: 'st1pbr26_090305.txt', expected: '2009-03-05' },
    { fileName: 'AH_DATA_1_2_3_2402291.csv', expected: '2024-02-29' },
  ])(
    'should read the date of $fileName as $expected',
    ({ fileName, expected }) => {
      expect(parseSftpFileNameDate(fileName)?.toString()).toBe(expected)
    },
  )

  it.each([
    { reason: 'month 13', fileName: 'AH_DATA_1_2_3_25132434.csv' },
    { reason: 'February 30', fileName: 'AH_DATA_1_2_3_25023034.csv' },
    {
      reason: 'February 29 in a common year',
      fileName: 'AH_DATA_1_2_3_25022934.csv',
    },
    { reason: 'letters in the date', fileName: 'AH_DATA_1_2_3_25O12434.csv' },
    { reason: 'fewer than six digits', fileName: 'AH_DATA_1_2_3_2501.csv' },
    { reason: 'no underscore', fileName: 'report.csv' },
    {
      reason: 'no date after the last underscore',
      fileName: 'invalid_filename.csv',
    },
  ])('should return null for $reason', ({ fileName }) => {
    expect(parseSftpFileNameDate(fileName)).toBeNull()
  })

  it('should read back what formatYYMMDD writes', () => {
    const date = Temporal.PlainDate.from('2026-11-02')

    expect(
      parseSftpFileNameDate(`st1pbr26_${formatYYMMDD(date)}.txt`)?.toString(),
    ).toBe(date.toString())
  })
})
