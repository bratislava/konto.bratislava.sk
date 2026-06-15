import { Test } from '@nestjs/testing'
import { FormRegistrationStatus } from '@prisma/client'
import {
  FormDefinitionSlovenskoSk,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'

import prismaMock from '../../../../test/singleton'
import PrismaService from '../../../prisma/prisma.service'
import FormRegistrationStatusRepository from '../form-registration-status.repository'

describe('FormRegistrationStatusRepository', () => {
  let repository: FormRegistrationStatusRepository

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [],
      providers: [
        FormRegistrationStatusRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    repository = app.get<FormRegistrationStatusRepository>(
      FormRegistrationStatusRepository,
    )
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  describe('isFormRegisteredInSlovenskoSk', () => {
    it('should return false if form is marked in DB as not registered', async () => {
      const formDefinition = {
        type: FormDefinitionType.SlovenskoSkGeneric,
      } as Partial<FormDefinitionSlovenskoSk> as FormDefinitionSlovenskoSk
      prismaMock.formRegistrationStatus.findUnique.mockResolvedValue({
        isRegistered: false,
      } as Partial<FormRegistrationStatus> as FormRegistrationStatus)

      const result =
        await repository.isFormRegisteredInSlovenskoSk(formDefinition)
      expect(result).toBe(false)
    })

    it('should return true if form is marked in DB as registered', async () => {
      const formDefinition = {
        type: FormDefinitionType.SlovenskoSkGeneric,
      } as Partial<FormDefinitionSlovenskoSk> as FormDefinitionSlovenskoSk
      prismaMock.formRegistrationStatus.findUnique.mockResolvedValue({
        isRegistered: true,
      } as Partial<FormRegistrationStatus> as FormRegistrationStatus)

      const result =
        await repository.isFormRegisteredInSlovenskoSk(formDefinition)
      expect(result).toBe(true)
    })

    it('should return false if form is missing from the table with registration states', async () => {
      const formDefinition = {
        type: FormDefinitionType.SlovenskoSkGeneric,
      } as Partial<FormDefinitionSlovenskoSk> as FormDefinitionSlovenskoSk
      prismaMock.formRegistrationStatus.findUnique.mockResolvedValue(null)

      const result =
        await repository.isFormRegisteredInSlovenskoSk(formDefinition)
      expect(result).toBe(false)
    })
  })
})
