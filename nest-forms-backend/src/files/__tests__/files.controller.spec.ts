import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import ClientsService from '../../clients/clients.service'
import FilesController from '../files.controller'
import FilesService from '../files.service'

describe('FilesController', () => {
  let controller: FilesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: ClientsService, useValue: createMock<ClientsService>() },
        { provide: FilesService, useValue: createMock<FilesService>() },
      ],
    }).compile()

    controller = module.get<FilesController>(FilesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
