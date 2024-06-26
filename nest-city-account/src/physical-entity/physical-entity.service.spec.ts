import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import prismaMock from '../../test/singleton'
import { PrismaService } from '../prisma/prisma.service'
import { RfoByBirthnumberService } from '../rfo-by-birthnumber/rfo-by-birthnumber.service'
import { UpvsIdentityByUriService } from '../upvs-identity-by-uri/upvs-identity-by-uri.service'
import { ErrorThrowerGuard } from '../utils/guards/errors.guard'
import { PhysicalEntityService } from './physical-entity.service'

describe('PhysicalEntityService', () => {
  let service: PhysicalEntityService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhysicalEntityService, 
        ErrorThrowerGuard,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RfoByBirthnumberService, useValue: createMock<RfoByBirthnumberService>() },
        { provide: UpvsIdentityByUriService, useValue: createMock<UpvsIdentityByUriService>() }
      ],
    }).compile()

    service = module.get<PhysicalEntityService>(PhysicalEntityService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
