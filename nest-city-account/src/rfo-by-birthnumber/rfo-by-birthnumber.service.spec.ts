import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import prismaMock from '../../test/singleton'
import { MagproxyService } from '../magproxy/magproxy.service'
import { PrismaService } from '../prisma/prisma.service'
import { RfoByBirthnumberService } from './rfo-by-birthnumber.service'

describe('RfoByBirthnumberService', () => {
  let service: RfoByBirthnumberService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RfoByBirthnumberService,
        {
          provide: MagproxyService,
          useValue: createMock<MagproxyService>()
        },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<RfoByBirthnumberService>(RfoByBirthnumberService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
