import { createMock } from '@golevelup/ts-jest'
import { getQueueToken } from '@nestjs/bull'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../test/singleton'
import FormsService from '../forms/forms.service'
import PrismaService from '../prisma/prisma.service'
import TaxService from '../tax/tax.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import ConvertService from './convert.service'
import JsonXmlConvertService from './utils-services/json-xml.convert.service'

jest.mock('./utils-services/json-xml.convert.service')

describe('ConvertService', () => {
  let service: ConvertService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        ConvertService,
        TaxService,
        JsonXmlConvertService,
        ThrowerErrorGuard,
        {
          provide: getQueueToken('tax'),
          useValue: {},
        },
        ConfigService,
        {
          provide: FormsService,
          useValue: createMock<FormsService>(),
        },
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: MinioClientSubservice,
          useValue: createMock<MinioClientSubservice>(),
        },
      ],
    }).compile()
    service = module.get<ConvertService>(ConvertService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
