import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../test/singleton'
import BaConfigService from '../config/ba-config.service'
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
        { provide: TaxService, useValue: createMock<TaxService>() },
        ThrowerErrorGuard,
        {
          provide: BaConfigService,
          useValue: {
            featureToggles: { versioning: true, fileSizeLimits: false },
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
