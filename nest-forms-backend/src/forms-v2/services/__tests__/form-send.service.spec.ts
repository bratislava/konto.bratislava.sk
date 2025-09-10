import { Test } from '@nestjs/testing'
import { FormRegistrationStatus } from '@prisma/client'
import {
  FormDefinition,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'

import prismaMock from '../../../../test/singleton'
import PrismaService from '../../../prisma/prisma.service'
import { FormSendService } from '../form-send.service'

describe('FormSendService', () => {
  let service: FormSendService

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [],
      providers: [
        FormSendService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = app.get<FormSendService>(FormSendService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('isFormRegisteredInSlovenskoSk', () => {
    it('should return true if form is not Slovensko.sk form', async () => {
      const formDefinition = {
        type: FormDefinitionType.Email,
      } as Partial<FormDefinition> as FormDefinition

      const result = await service.isFormRegisteredInSlovenskoSk(formDefinition)
      expect(result).toBe(true)
    })

    it('should return false if form is marked in DB as not registered', async () => {
      const formDefinition = {
        type: FormDefinitionType.SlovenskoSkGeneric,
      } as Partial<FormDefinition> as FormDefinition
      prismaMock.formRegistrationStatus.findUnique.mockResolvedValue({
        isRegistered: false,
      } as Partial<FormRegistrationStatus> as FormRegistrationStatus)

      const result = await service.isFormRegisteredInSlovenskoSk(formDefinition)
      expect(result).toBe(false)
    })

    it('should return true if form is marked in DB as registered', async () => {
      const formDefinition = {
        type: FormDefinitionType.SlovenskoSkGeneric,
      } as Partial<FormDefinition> as FormDefinition
      prismaMock.formRegistrationStatus.findUnique.mockResolvedValue({
        isRegistered: true,
      } as Partial<FormRegistrationStatus> as FormRegistrationStatus)

      const result = await service.isFormRegisteredInSlovenskoSk(formDefinition)
      expect(result).toBe(true)
    })

    it('should return true if form is missing from the table with registration states', async () => {
      const formDefinition = {
        type: FormDefinitionType.SlovenskoSkGeneric,
      } as Partial<FormDefinition> as FormDefinition
      prismaMock.formRegistrationStatus.findUnique.mockResolvedValue(null)

      const result = await service.isFormRegisteredInSlovenskoSk(formDefinition)
      expect(result).toBe(true)
    })
  })
})
