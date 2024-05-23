/* eslint-disable import/first */
const form1 = {
  schema: { name: 'form1Schema' },
  uiSchema: { name: 'form1UiSchema' },
  something: { something: 'other' },
} as unknown as FormDefinition
const form2 = {
  schema: { name: 'form2Schema' },
  uiSchema: { name: 'form2UiSchema' },
  something: { something: 'other' },
} as unknown as FormDefinition

jest.mock(
  '../utils/global-forms',
  () =>
    ({
      form1,
      form2,
    }) as unknown as Record<string, FormDefinition>,
)

import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../test/singleton'
import PrismaService from '../prisma/prisma.service'
import FormDefinition from '../utils/global-dtos/form.dto'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import SchemasService from './schemas.service'

describe('SchemasService', () => {
  let service: SchemasService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchemasService,
        ThrowerErrorGuard,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()
    service = module.get<SchemasService>(SchemasService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
/* eslint-enable import/first */
