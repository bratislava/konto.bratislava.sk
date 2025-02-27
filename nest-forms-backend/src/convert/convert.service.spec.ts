import { createMock } from '@golevelup/ts-jest'
import { getQueueToken } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../test/singleton'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import FormsService from '../forms/forms.service'
import PrismaService from '../prisma/prisma.service'
import TaxService from '../tax/tax.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import ConvertService from './convert.service'

describe('ConvertService', () => {
  let service: ConvertService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConvertService,
        TaxService,
        ThrowerErrorGuard,
        {
          provide: getQueueToken('tax'),
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === 'FEATURE_TOGGLE_VERSIONING') return 'true'
              throw new Error(`Unexpected config key: ${key}`)
            }),
          },
        },
        {
          provide: FormsService,
          useValue: createMock<FormsService>(),
        },
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: FormValidatorRegistryService,
          useValue: createMock<FormValidatorRegistryService>(),
        },
      ],
    }).compile()
    service = module.get<ConvertService>(ConvertService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
