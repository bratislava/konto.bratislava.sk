import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../test/singleton'
import PrismaService from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import SchemasController from './schemas.controller'
import SchemasService from './schemas.service'

describe('SchemasController', () => {
  let controller: SchemasController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchemasController],
      providers: [
        SchemasService,
        ThrowerErrorGuard,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    controller = module.get<SchemasController>(SchemasController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
