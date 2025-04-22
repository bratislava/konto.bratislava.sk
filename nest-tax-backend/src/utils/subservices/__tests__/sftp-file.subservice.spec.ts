import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { FileInfo } from 'ssh2-sftp-client'

import { PrismaService } from '../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../guards/errors.guard'
import SftpFileSubservice from '../sftp-file.subservice'

// Mock SFTPClient
jest.mock('ssh2-sftp-client')

// Mock dependencies
const mockPrismaService = {
  csvFile: {
    findMany: jest.fn(),
  },
}

const mockConfigService = {
  getOrThrow: jest.fn(),
}

const mockThrowerErrorGuard = {
  InternalServerErrorException: jest.fn(),
}

describe('SftpFileSubservice', () => {
  let service: SftpFileSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SftpFileSubservice,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ThrowerErrorGuard, useValue: mockThrowerErrorGuard },
      ],
    }).compile()

    service = module.get<SftpFileSubservice>(SftpFileSubservice)
  })

  afterEach(() => {
    jest.clearAllMocks()
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

    const result = await service['filterAlreadyReportedFiles'](mockFiles)

    expect(mockPrismaService.csvFile.findMany).toHaveBeenCalledWith({
      select: { name: true },
      where: { name: { in: mockFiles.map((file) => file.name) } },
    })
    expect(result).toEqual(['file2.csv'])
  })
})
