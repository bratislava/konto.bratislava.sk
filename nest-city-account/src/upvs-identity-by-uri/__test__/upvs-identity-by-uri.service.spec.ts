import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import prismaMock from '../../../test/singleton'
import { NasesService } from '../../nases/nases.service'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { UpvsIdentityByUriService } from '../upvs-identity-by-uri.service'
import { UpvsIdentitySchema } from '../dtos/upvsSchema'
import { mockUpvsIdentityByUriResponse } from '../dtos/__test__/upvsSchema.test'

describe('UpvsIdentityByUriService', () => {
  let service: UpvsIdentityByUriService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpvsIdentityByUriService,
        ThrowerErrorGuard,
        {
          provide: NasesService,
          useValue: createMock<NasesService>(),
        },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<UpvsIdentityByUriService>(UpvsIdentityByUriService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('UpvsIdentitySchema', () => {
    mockUpvsIdentityByUriResponse.forEach((upvsIdentity) => {
      it(`should validate UpvsIdentitySchema for ${upvsIdentity.uri}`, () => {
        const result = UpvsIdentitySchema.safeParse(upvsIdentity)
        expect(result.success).toBeTruthy()
      })
    })
  })
})
