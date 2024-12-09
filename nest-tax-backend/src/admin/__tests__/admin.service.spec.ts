/* eslint-disable @typescript-eslint/dot-notation */
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { NorisService } from '../../noris/noris.service'
import { PrismaService } from '../../prisma/prisma.service'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
import { AdminService } from '../admin.service'

describe('TasksService', () => {
  let service: AdminService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: createMock<PrismaService>() },
        { provide: QrCodeSubservice, useValue: createMock<QrCodeSubservice>() },
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        { provide: NorisService, useValue: createMock<NorisService>() },
      ],
    }).compile()

    service = module.get<AdminService>(AdminService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createTaxPayers', () => {
    it('should correctly check in database and add new', async () => {
      service['prismaService'].taxPayer.findMany = jest
        .fn()
        .mockResolvedValue([
          { birthNumber: '000000/0001' },
          { birthNumber: '000000/0002' },
        ])

      const spy = jest
        .spyOn(service, 'loadDataFromNoris')
        .mockResolvedValue({ birthNumbers: ['000000/0003', '000000/0004'] })

      const result = await service.createTaxPayers([
        '000000/0001',
        '000000/0002',
        '000000/0003',
        '000000/0004',
        '000000/0005',
      ])

      expect(result).toEqual({
        birthNumbers: [
          '000000/0001',
          '000000/0002',
          '000000/0003',
          '000000/0004',
        ],
      })
      expect(spy).toHaveBeenCalledWith({
        birthNumbers: ['000000/0003', '000000/0004', '000000/0005'],
        year: new Date().getFullYear(),
      })
    })
  })
})
/* eslint-enable @typescript-eslint/dot-notation */
