/* eslint-disable pii/no-email */
import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'
import {
  FormDefinition,
  FormDefinitionEmail,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import {
  evaluateFormSendPolicy,
  FormSendPolicy,
} from 'forms-shared/send-policy/sendPolicy'
import { getFormSummary } from 'forms-shared/summary/summary'

import {
  AuthFixtureUser,
  UserFixtureFactory,
} from '../../test/fixtures/auth/user-fixture-factory'
import prismaMock from '../../test/singleton'
import ClientsService from '../clients/clients.service'
import FilesService from '../files/files.service'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import { FormsErrorsResponseEnum } from '../forms/forms.errors.enum'
import FormsHelper from '../forms/forms.helper'
import FormsService from '../forms/forms.service'
import {
  FormAccessService,
  FormAccessType,
} from '../forms-v2/services/form-access.service'
import NasesConsumerService from '../nases-consumer/nases-consumer.service'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { JwtNasesPayloadDto, UpdateFormRequestDto } from './dtos/requests.dto'
import { NasesErrorsEnum, NasesErrorsResponseEnum } from './nases.errors.enum'
import NasesService from './nases.service'
import NasesUtilsService from './utils-services/tokens.nases.service'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug')
jest.mock('forms-shared/form-utils/validators')
jest.mock('forms-shared/summary/summary')
jest.mock('forms-shared/send-policy/sendPolicy')

describe('NasesService', () => {
  let service: NasesService
  let userFixtureFactory: UserFixtureFactory
  let authUser: AuthFixtureUser

  beforeAll(() => {
    userFixtureFactory = new UserFixtureFactory()
    authUser = userFixtureFactory.createFoAuthUser()
  })

  beforeEach(async () => {
    jest.resetAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        NasesService,
        {
          provide: FormsService,
          useValue: createMock<FormsService>(),
        },
        {
          provide: FilesService,
          useValue: createMock<FilesService>(),
        },
        {
          provide: FormsHelper,
          useValue: createMock<FormsHelper>(),
        },
        {
          provide: NasesConsumerService,
          useValue: createMock<NasesConsumerService>(),
        },
        {
          provide: RabbitmqClientService,
          useValue: createMock<RabbitmqClientService>(),
        },
        ThrowerErrorGuard,
        {
          provide: NasesUtilsService,
          useValue: createMock<NasesUtilsService>(),
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: FormValidatorRegistryService,
          useValue: createMock<FormValidatorRegistryService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: ClientsService,
          useValue: createMock<ClientsService>(),
        },
        {
          provide: FormAccessService,
          useValue: createMock<FormAccessService>(),
        },
      ],
    }).compile()

    service = app.get<NasesService>(NasesService)

    Object.defineProperty(
      app.get<ThrowerErrorGuard>(ThrowerErrorGuard),
      'logger',
      {
        value: { error: jest.fn(), debug: jest.fn(), log: jest.fn() },
      },
    )
    Object.defineProperty(service, 'logger', {
      value: { error: jest.fn(), debug: jest.fn(), log: jest.fn() },
    })
  })

  describe('should be defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })
  })

  describe('updateForm', () => {
    it('should throw not found', async () => {
      prismaMock.forms.findFirst.mockResolvedValue(null)

      await expect(
        service.updateForm(
          '1',
          { email: 'email' } as UpdateFormRequestDto,
          authUser.user,
        ),
      ).rejects.toThrow()
    })

    it('should throw unauthorized', async () => {
      service['formAccessService'].checkAccessByInstance = jest
        .fn()
        .mockReturnValue({ hasAccess: false })
      prismaMock.forms.findFirst.mockResolvedValue({} as Forms)

      await expect(
        service.updateForm(
          '1',
          { email: 'email' } as UpdateFormRequestDto,
          authUser.user,
        ),
      ).rejects.toThrow()
    })

    it('should correctly update', async () => {
      prismaMock.forms.findFirst.mockResolvedValue({} as Forms)
      service['formAccessService'].checkAccessByInstance = jest
        .fn()
        .mockReturnValue(
          Promise.resolve({
            hasAccess: true,
            accessType: FormAccessType.UserAccess,
          }),
        )
      const spy = jest.spyOn(service['formsService'], 'updateForm')

      await service.updateForm(
        '1',
        { email: 'emailOverride', formDataXml: 'xml' } as UpdateFormRequestDto,
        authUser.user,
      )
      expect(spy).toHaveBeenCalledWith('1', {
        userExternalId: authUser.sub,
        cognitoGuestIdentityId: null,
        ico: null,
        ownerType: 'FO',
        email: 'emailOverride',
        formDataXml: 'xml',
      })
    })
  })

  describe('sendFormEid', () => {
    it('should throw an error if sendMessageNases returns a status different than 200', async () => {
      // Mock dependencies
      const mockForm = {
        id: '1',
        formDefinitionSlug: 'test-slug',
        formDataJson: {},
      } as Forms
      const mockUser = {
        sub: 'user-sub',
        actor: { sub: 'actor-sub' },
      } as JwtNasesPayloadDto
      const mockFormDefinition: FormDefinition = {
        jsonVersion: '1.0.0',
        schema: {},
        slug: 'test-slug',
        type: FormDefinitionType.SlovenskoSkGeneric,
        title: 'Test Form',
        termsAndConditions: 'Test Terms and Conditions',
        pospID: 'test-posp-id',
        pospVersion: '1.0',
        publisher: 'Test Publisher',
        isSigned: false,
        sendPolicy: FormSendPolicy.EidOrAuthenticatedVerified,
        ginisAssignment: {
          ginisNodeId: '',
        },
      }

      // Setup mocks
      service['formsService'].checkFormBeforeSending = jest
        .fn()
        .mockResolvedValue(mockForm)
      service['formAccessService'].checkAccessByInstance = jest
        .fn()
        .mockReturnValue(
          Promise.resolve({
            hasAccess: true,
            accessType: FormAccessType.UserAccess,
          }),
        )
      service['nasesUtilsService'].createUserJwtToken = jest
        .fn()
        .mockReturnValue('mock-jwt')
      service['filesService'].areFormAttachmentsReady = jest
        .fn()
        .mockResolvedValue({ filesReady: true, requeue: false })
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        eidSendPossible: true,
      })

      // this is the important mock we're testing against
      service['nasesConsumerService'].sendToNasesAndUpdateState = jest
        .fn()
        .mockReturnValue(false)

      const updateFormSpy = jest.spyOn(service['formsService'], 'updateForm')

      // Execute and assert
      await expect(
        service.sendFormEid('1', 'mock-obo-token', mockUser, authUser.user),
      ).rejects.toThrow(NasesErrorsResponseEnum.SEND_TO_NASES_ERROR)
      expect(updateFormSpy).toHaveBeenCalledWith('1', {
        state: FormState.DRAFT,
        error: FormError.NASES_SEND_ERROR,
      })
    })

    it('should throw an error if eID send is not possible', async () => {
      // Mock dependencies
      const mockForm = {
        id: '1',
        formDefinitionSlug: 'test-slug',
        formDataJson: {},
      } as Forms
      const mockUser = {
        sub: 'user-sub',
        actor: { sub: 'actor-sub' },
      } as JwtNasesPayloadDto
      const mockFormDefinition = {
        slug: 'test-slug',
        sendPolicy: FormSendPolicy.AuthenticatedVerified,
      } as FormDefinition

      // Setup mocks
      service['formsService'].checkFormBeforeSending = jest
        .fn()
        .mockResolvedValue(mockForm)
      service['formAccessService'].checkAccessByInstance = jest
        .fn()
        .mockReturnValue(
          Promise.resolve({
            hasAccess: true,
            accessType: FormAccessType.UserAccess,
          }),
        )
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        eidSendPossible: false,
      })

      // Execute and assert
      await expect(
        service.sendFormEid('1', 'mock-obo-token', mockUser, authUser.user),
      ).rejects.toThrow(NasesErrorsResponseEnum.SEND_POLICY_NOT_POSSIBLE)
    })
  })

  describe('sendForm', () => {
    const mockForm = {
      id: '1',
      formDefinitionSlug: 'test-slug',
      formDataJson: { test: 'data' },
    } as unknown as Forms

    const mockFormDefinition = {
      schema: {},
      type: FormDefinitionType.SlovenskoSkGeneric,
      sendPolicy: FormSendPolicy.EidOrAuthenticatedVerified,
    } as FormDefinitionSlovenskoSkGeneric

    const mockFormDefinitionEmail = {
      ...mockFormDefinition,
      type: FormDefinitionType.Email,
    } as unknown as FormDefinitionEmail

    beforeEach(() => {
      jest
        .spyOn(service['formsService'], 'checkFormBeforeSending')
        .mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest
        .spyOn(service['formAccessService'], 'checkAccessByInstance')
        .mockReturnValue(
          Promise.resolve({
            hasAccess: true,
            accessType: FormAccessType.UserAccess,
          }),
        )
      jest
        .spyOn(service['formsService'], 'updateForm')
        .mockResolvedValue(mockForm)
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        sendPossible: true,
        sendAllowedForUser: true,
      })
    })

    it('should throw an error if form definition is not found', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(null)

      await expect(service.sendForm('1', authUser.user)).rejects.toThrow(
        FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND,
      )
    })

    it('should throw an error if form data is invalid', async () => {
      service['formValidatorRegistryService'].getRegistry = jest
        .fn()
        .mockReturnValue({
          getValidator: () => ({
            validateFormData: () => ({
              errors: ['Invalid data'],
            }),
          }),
        })

      await expect(service.sendForm('1', authUser.user)).rejects.toThrow(
        FormsErrorsResponseEnum.FORM_DATA_INVALID,
      )
    })

    it('should throw an error if user cannot send the form', async () => {
      service['formAccessService'].checkAccessByInstance = jest
        .fn()
        .mockReturnValue(
          Promise.resolve({
            hasAccess: false,
          }),
        )

      await expect(service.sendForm('1', authUser.user)).rejects.toThrow(
        NasesErrorsResponseEnum.FORBIDDEN_SEND,
      )
    })

    it('should throw an error if sending is not possible according to policy', async () => {
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        sendPossible: false,
        sendAllowedForUser: false,
      })

      await expect(service.sendForm('1', authUser.user)).rejects.toThrow(
        NasesErrorsResponseEnum.SEND_POLICY_NOT_POSSIBLE,
      )
    })

    it('should throw an error if sending is not allowed for the user according to policy', async () => {
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        sendPossible: true,
        sendAllowedForUser: false,
      })

      await expect(service.sendForm('1', authUser.user)).rejects.toThrow(
        NasesErrorsResponseEnum.SEND_POLICY_NOT_ALLOWED_FOR_USER,
      )
    })

    it('should throw an error if publishing to RabbitMQ fails', async () => {
      jest
        .spyOn(service['rabbitmqClientService'], 'publishDelay')
        .mockRejectedValue(new Error('RabbitMQ error'))

      await expect(service.sendForm('1', authUser.user)).rejects.toThrow(
        NasesErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT,
      )
    })

    it('should queue the form', async () => {
      const result = await service.sendForm('1', authUser.user)

      expect(result).toEqual({
        id: '1',
        message: 'Form was successfully queued to rabbitmq.',
        state: FormState.QUEUED,
      })
    })

    it('should queue the email form when the user is authenticated and needs to be authenticated', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        ...mockFormDefinitionEmail,
      })

      const result = await service.sendForm('1', authUser.user)

      expect(result).toEqual({
        id: '1',
        message: 'Form was successfully queued to rabbitmq.',
        state: FormState.QUEUED,
      })
    })

    it('should include form summary in form update', async () => {
      const mockSummary = { summary: 'test' }
      jest
        .spyOn(service as any, 'getFormSummaryOrThrow')
        .mockReturnValue(mockSummary)

      await service.sendForm('1', authUser.user)

      expect(service['formsService'].updateForm).toHaveBeenCalledWith('1', {
        state: FormState.QUEUED,
        formSummary: mockSummary,
      })
    })

    it('should throw error if form summary generation fails', async () => {
      jest
        .spyOn(service as any, 'getFormSummaryOrThrow')
        .mockImplementation(() => {
          throw new Error('Summary generation failed')
        })

      await expect(service.sendForm('1', authUser.user)).rejects.toThrow()
    })
  })

  describe('getFormSummaryOrThrow', () => {
    const mockForm = {
      id: '1',
      formDataJson: { test: 'data' },
    } as unknown as Forms

    const mockFormDefinition = {
      slug: 'test-slug',
      schema: {},
    } as FormDefinition

    it('should return form summary when successful', () => {
      const mockSummary = { summary: 'test' }
      ;(getFormSummary as jest.Mock).mockReturnValue(mockSummary)

      const result = service['getFormSummaryOrThrow'](
        mockForm,
        mockFormDefinition,
      )

      expect(result).toEqual(mockSummary)
      expect(getFormSummary).toHaveBeenCalledWith({
        formDefinition: mockFormDefinition,
        formDataJson: mockForm.formDataJson,
        validatorRegistry:
          service['formValidatorRegistryService'].getRegistry(),
      })
    })

    it('should throw InternalServerError when getFormSummary fails', () => {
      ;(getFormSummary as jest.Mock).mockImplementation(() => {
        throw new Error('Summary generation failed')
      })

      expect(() =>
        service['getFormSummaryOrThrow'](mockForm, mockFormDefinition),
      ).toThrow(NasesErrorsResponseEnum.FORM_SUMMARY_GENERATION_ERROR)
    })
  })
})
/* eslint-enable pii/no-email */
