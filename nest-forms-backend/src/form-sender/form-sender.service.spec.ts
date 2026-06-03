import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'
import {
  FormDefinition,
  FormDefinitionEmail,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionSlovenskoSkTax,
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
import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
import BaConfigService from '../config/ba-config.service'
import ConvertPdfService from '../convert-pdf/convert-pdf.service'
import { FilesErrorsResponseEnum } from '../files/files.errors.enum'
import FilesService from '../files/files.service'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import { FormUpdateBodyDto } from '../forms/dtos/requests.dto'
import { FormsErrorsResponseEnum } from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../nases/nases.errors.enum'
import NasesSenderService from '../nases/services/nases.sender.service'
import { JwtNasesPayload } from '../nases/types/jwt-nases.types'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { FormSenderService } from './form-sender.service'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug')
jest.mock('forms-shared/form-utils/validators')
jest.mock('forms-shared/summary/summary')
jest.mock('forms-shared/send-policy/sendPolicy')

describe('FormSenderService', () => {
  let service: FormSenderService
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
        FormSenderService,
        {
          provide: FormsService,
          useValue: createMock<FormsService>(),
        },
        {
          provide: FilesService,
          useValue: createMock<FilesService>(),
        },
        {
          provide: RabbitmqClientService,
          useValue: createMock<RabbitmqClientService>(),
        },
        ThrowerErrorGuard,
        {
          provide: NasesSenderService,
          useValue: createMock<NasesSenderService>(),
        },
        {
          provide: ApiJwtTokensService,
          useValue: createMock<ApiJwtTokensService>(),
        },
        {
          provide: FormValidatorRegistryService,
          useValue: createMock<FormValidatorRegistryService>(),
        },
        {
          provide: BaConfigService,
          useValue: {
            featureToggles: {
              versioning: false,
              fileSizeLimits: false,
            },
            slovenskoSk: {
              subNasesTechnicalAccount: 'test-sub',
              apiTokenPrivate: 'test-private-key',
            },
          },
        },
        {
          provide: ConvertPdfService,
          useValue: createMock<ConvertPdfService>(),
        },
      ],
    }).compile()

    service = app.get<FormSenderService>(FormSenderService)

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

  describe('sendFormEid', () => {
    it('should throw an error if send throws', async () => {
      const mockForm = {
        id: '1',
        formDefinitionSlug: 'test-slug',
        formDataJson: {},
      } as Forms
      const mockUser = {
        sub: 'user-sub',
        actor: { sub: 'actor-sub' },
      } as JwtNasesPayload
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
        ginisDocumentTypeId: '',
        ginisAssignment: {
          ginisNodeId: '',
        },
        files: {
          slots: [],
        },
      }

      service['formsService'].checkFormBeforeSending = jest
        .fn()
        .mockResolvedValue(mockForm)
      service['apiJwtTokensService'].createUserJwtToken = jest
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

      jest
        .spyOn(service['nasesSenderService'], 'send')
        .mockResolvedValue({ status: 404, data: {} })

      const updateFormSpy = jest.spyOn(service['formsService'], 'updateForm')

      await expect(
        service.sendFormEid('1', 'mock-obo-token', mockUser, authUser.user),
      ).rejects.toThrow(NasesErrorsResponseEnum.SEND_TO_NASES_ERROR)
      expect(updateFormSpy).toHaveBeenCalledWith('1', {
        state: FormState.DRAFT,
        error: FormError.NASES_SEND_ERROR,
      })
    })

    it('should throw an error if eID send is not possible', async () => {
      const mockForm = {
        id: '1',
        formDefinitionSlug: 'test-slug',
        formDataJson: {},
      } as Forms
      const mockUser = {
        sub: 'user-sub',
        actor: { sub: 'actor-sub' },
      } as JwtNasesPayload
      const mockFormDefinition = {
        slug: 'test-slug',
        sendPolicy: FormSendPolicy.AuthenticatedVerified,
      } as FormDefinition

      service['formsService'].checkFormBeforeSending = jest
        .fn()
        .mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        eidSendPossible: false,
      })

      await expect(
        service.sendFormEid('1', 'mock-obo-token', mockUser, authUser.user),
      ).rejects.toThrow(NasesErrorsResponseEnum.SEND_POLICY_NOT_POSSIBLE)
    })

    it('should log and throw error if creating pdf fails, and the last update should be with state: DRAFT', async () => {
      jest
        .spyOn(service['formsService'], 'checkFormBeforeSending')
        .mockResolvedValue({
          id: '1',
          formDefinitionSlug: 'test-slug',
          formDataJson: {},
        } as Forms)
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        eidSendPossible: true,
      })
      const updateSpy = jest.spyOn(service['formsService'], 'updateForm')
      const mockFormDefinition = {
        slug: 'test-slug',
        type: FormDefinitionType.SlovenskoSkGeneric,
        sendPolicy: FormSendPolicy.EidOrAuthenticatedVerified,
      } as FormDefinitionSlovenskoSkGeneric
      const mockUser = {
        sub: 'user-sub',
        actor: { sub: 'actor-sub' },
      } as JwtNasesPayload
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest
        .spyOn(service['convertPdfService'], 'createPdfImageInFormFiles')
        .mockRejectedValue(new Error('PDF creation failed'))
      const sendToNasesSpy = jest.spyOn(service, 'sendToNasesAndUpdateState')

      await expect(
        service.sendFormEid('1', 'mock-obo-token', mockUser, authUser.user),
      ).rejects.toThrow(NasesErrorsResponseEnum.CREATE_PDF_IMAGE_ERROR)
      expect(sendToNasesSpy).not.toHaveBeenCalled()
      expect(updateSpy).toHaveBeenLastCalledWith(
        '1',
        expect.objectContaining({
          state: FormState.DRAFT,
          error: FormError.NASES_SEND_ERROR,
        }),
      )
    })

    it('should end in NASES_SEND_ERROR error state, if sending to NASES fails', async () => {
      jest
        .spyOn(service['formsService'], 'checkFormBeforeSending')
        .mockResolvedValue({
          id: '1',
          formDefinitionSlug: 'test-slug',
          formDataJson: {},
        } as Forms)
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        eidSendPossible: true,
      })
      const updateSpy = jest.spyOn(service['formsService'], 'updateForm')
      const mockFormDefinition = {
        slug: 'test-slug',
        type: FormDefinitionType.SlovenskoSkGeneric,
        sendPolicy: FormSendPolicy.EidOrAuthenticatedVerified,
      } as FormDefinitionSlovenskoSkGeneric
      const mockUser = {
        sub: 'user-sub',
        actor: { sub: 'actor-sub' },
      } as JwtNasesPayload
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest
        .spyOn(service['nasesSenderService'], 'send')
        .mockResolvedValue({ status: 404, data: {} })
      const sendToNasesSpy = jest.spyOn(service, 'sendToNasesAndUpdateState')

      await expect(
        service.sendFormEid('1', 'mock-obo-token', mockUser, authUser.user),
      ).rejects.toThrow()
      expect(sendToNasesSpy).toHaveBeenCalled()
      expect(service['logger'].error).toHaveBeenCalled()
      expect(updateSpy).toHaveBeenLastCalledWith(
        '1',
        expect.objectContaining({
          state: FormState.DRAFT,
          error: FormError.NASES_SEND_ERROR,
        }),
      )
    })

    it('should just log if sending to GINIS throws', async () => {
      jest
        .spyOn(service['formsService'], 'checkFormBeforeSending')
        .mockResolvedValue({
          id: '1',
          formDefinitionSlug: 'test-slug',
          formDataJson: {},
        } as Forms)
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        eidSendPossible: true,
      })
      const updateSpy = jest.spyOn(service['formsService'], 'updateForm')
      const mockFormDefinition = {
        slug: 'test-slug',
        type: FormDefinitionType.SlovenskoSkGeneric,
        sendPolicy: FormSendPolicy.EidOrAuthenticatedVerified,
      } as FormDefinitionSlovenskoSkGeneric
      const mockUser = {
        sub: 'user-sub',
        actor: { sub: 'actor-sub' },
      } as JwtNasesPayload
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest
        .spyOn(service['nasesSenderService'], 'send')
        .mockResolvedValue({ status: 200, data: {} })
      const sendToNasesSpy = jest.spyOn(service, 'sendToNasesAndUpdateState')
      const publishToGinisSpy = jest
        .spyOn(service['rabbitmqClientService'], 'publishToGinis')
        .mockRejectedValue(new Error('Ginis error'))

      await service.sendFormEid('1', 'mock-obo-token', mockUser, authUser.user)

      expect(sendToNasesSpy).toHaveBeenCalled()
      expect(publishToGinisSpy).toHaveBeenCalled()
      expect(service['logger'].error).toHaveBeenCalled()
      expect(updateSpy).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          state: FormState.DELIVERED_NASES,
        }),
      )
    })

    it('should skip GINIS if not generic slovensko.sk form', async () => {
      jest
        .spyOn(service['formsService'], 'checkFormBeforeSending')
        .mockResolvedValue({
          id: '1',
          formDefinitionSlug: 'test-slug',
          formDataJson: {},
        } as Forms)
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        eidSendPossible: true,
      })
      const updateSpy = jest.spyOn(service['formsService'], 'updateForm')
      const mockFormDefinition = {
        slug: 'test-slug',
        type: FormDefinitionType.SlovenskoSkTax,
        sendPolicy: FormSendPolicy.EidOrAuthenticatedVerified,
      } as FormDefinitionSlovenskoSkTax
      const mockUser = {
        sub: 'user-sub',
        actor: { sub: 'actor-sub' },
      } as JwtNasesPayload
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest
        .spyOn(service['nasesSenderService'], 'send')
        .mockResolvedValue({ status: 200, data: {} })
      const sendToNasesSpy = jest.spyOn(service, 'sendToNasesAndUpdateState')
      const publishToGinisSpy = jest.spyOn(
        service['rabbitmqClientService'],
        'publishToGinis',
      )

      const result = await service.sendFormEid(
        '1',
        'mock-obo-token',
        mockUser,
        authUser.user,
      )
      expect(sendToNasesSpy).toHaveBeenCalled()
      expect(publishToGinisSpy).not.toHaveBeenCalled()
      expect(service['logger'].error).not.toHaveBeenCalled()
      expect(updateSpy).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          state: FormState.DELIVERED_NASES,
        }),
      )

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          state: FormState.DELIVERED_NASES,
        }),
      )
    })

    it('should return DELIVERED_NASES if everything went okay', async () => {
      jest
        .spyOn(service['formsService'], 'checkFormBeforeSending')
        .mockResolvedValue({
          id: '1',
          formDefinitionSlug: 'test-slug',
          formDataJson: {},
        } as Forms)
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        eidSendPossible: true,
      })
      const updateSpy = jest.spyOn(service['formsService'], 'updateForm')
      const mockFormDefinition = {
        slug: 'test-slug',
        type: FormDefinitionType.SlovenskoSkGeneric,
        sendPolicy: FormSendPolicy.EidOrAuthenticatedVerified,
      } as FormDefinitionSlovenskoSkGeneric
      const mockUser = {
        sub: 'user-sub',
        actor: { sub: 'actor-sub' },
      } as JwtNasesPayload
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest
        .spyOn(service['nasesSenderService'], 'send')
        .mockResolvedValue({ status: 200, data: {} })
      const sendToNasesSpy = jest.spyOn(service, 'sendToNasesAndUpdateState')
      const publishToGinisSpy = jest.spyOn(
        service['rabbitmqClientService'],
        'publishToGinis',
      )

      const result = await service.sendFormEid(
        '1',
        'mock-obo-token',
        mockUser,
        authUser.user,
      )
      expect(sendToNasesSpy).toHaveBeenCalled()
      expect(publishToGinisSpy).toHaveBeenCalled()
      expect(service['logger'].error).not.toHaveBeenCalled()
      expect(updateSpy).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          state: FormState.DELIVERED_NASES,
        }),
      )

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          state: FormState.DELIVERED_NASES,
        }),
      )
    })
  })

  describe('updateAndSendForm', () => {
    const mockForm = {
      id: '1',
      formDefinitionSlug: 'test-slug',
      formDataJson: { test: 'data' },
    } as unknown as Forms

    const mockFormDefinition = {
      slug: 'test-slug',
      title: 'Test Form',
      schema: {},
      jsonVersion: '1.0.0',
      type: FormDefinitionType.SlovenskoSkGeneric,
      sendPolicy: FormSendPolicy.EidOrAuthenticatedVerified,
      termsAndConditions: 'Test Terms and Conditions',
      pospID: 'test-posp-id',
      pospVersion: '1.0',
      publisher: 'Test Publisher',
      isSigned: false,
      ginisDocumentTypeId: '',
      ginisAssignment: {
        ginisNodeId: '',
      },
      files: {
        maxFileSize: 500_000_000,
        maxTotalFileSize: 500_000_000,
        slots: [],
      },
    } as FormDefinitionSlovenskoSkGeneric

    const mockFormDefinitionEmail = {
      ...mockFormDefinition,
      type: FormDefinitionType.Email,
    } as unknown as FormDefinitionEmail

    beforeEach(() => {
      jest
        .spyOn(service['formsService'], 'updateFormWithUser')
        .mockResolvedValue(undefined as any)
      jest
        .spyOn(service['formsService'], 'checkFormBeforeSending')
        .mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
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

      await expect(
        service.updateAndSendForm('1', {} as FormUpdateBodyDto, authUser.user),
      ).rejects.toThrow(FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND)
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

      await expect(
        service.updateAndSendForm('1', {} as FormUpdateBodyDto, authUser.user),
      ).rejects.toThrow(FormsErrorsResponseEnum.FORM_DATA_INVALID)
    })

    it('should throw an error if sending is not possible according to policy', async () => {
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        sendPossible: false,
        sendAllowedForUser: false,
      })

      await expect(
        service.updateAndSendForm('1', {} as FormUpdateBodyDto, authUser.user),
      ).rejects.toThrow(NasesErrorsResponseEnum.SEND_POLICY_NOT_POSSIBLE)
    })

    it('should throw an error if sending is not allowed for the user according to policy', async () => {
      ;(evaluateFormSendPolicy as jest.Mock).mockReturnValue({
        sendPossible: true,
        sendAllowedForUser: false,
      })

      await expect(
        service.updateAndSendForm('1', {} as FormUpdateBodyDto, authUser.user),
      ).rejects.toThrow(
        NasesErrorsResponseEnum.SEND_POLICY_NOT_ALLOWED_FOR_USER,
      )
    })

    it('should throw an error if publishing to RabbitMQ fails', async () => {
      jest
        .spyOn(service['rabbitmqClientService'], 'publishDelay')
        .mockRejectedValue(new Error('RabbitMQ error'))

      await expect(
        service.updateAndSendForm('1', {} as FormUpdateBodyDto, authUser.user),
      ).rejects.toThrow(NasesErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT)
    })

    it('should queue the form', async () => {
      const result = await service.updateAndSendForm(
        '1',
        {} as FormUpdateBodyDto,
        authUser.user,
      )

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

      const result = await service.updateAndSendForm(
        '1',
        {} as FormUpdateBodyDto,
        authUser.user,
      )

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

      await service.updateAndSendForm(
        '1',
        {} as FormUpdateBodyDto,
        authUser.user,
      )

      expect(service['formsService'].updateForm).toHaveBeenCalledWith('1', {
        state: FormState.QUEUED,
        formSummary: mockSummary,
        formSentAt: expect.any(Date),
        jsonVersion: mockFormDefinition.jsonVersion,
      })
    })

    it('should throw error if form summary generation fails', async () => {
      jest
        .spyOn(service as any, 'getFormSummaryOrThrow')
        .mockImplementation(() => {
          throw new Error('Summary generation failed')
        })

      await expect(
        service.updateAndSendForm('1', {} as FormUpdateBodyDto, authUser.user),
      ).rejects.toThrow()
    })

    describe('cumulative file size limits', () => {
      beforeEach(() => {
        Object.defineProperty(service['baConfigService'], 'featureToggles', {
          get: () => ({
            versioning: false,
            fileSizeLimits: true,
          }),
          configurable: true,
        })
        Object.defineProperty(service['baConfigService'], 'fileLimits', {
          get: () => ({
            maxSingleSizeGlobal: 500_000_000,
            maxCumulativeSizeGlobal: 1_000_000_000,
          }),
          configurable: true,
        })
      })

      it('should throw if total file size exceeds form definition limit', async () => {
        ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
          ...mockFormDefinition,
          files: {
            ...mockFormDefinition.files,
            maxTotalFileSize: 100_000,
          },
        })
        jest
          .spyOn(service['filesService'], 'getActiveFileSizes')
          .mockResolvedValue([
            { id: 'test-id-1', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
            { id: 'test-id-2', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
            { id: 'test-id-3', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
          ])

        await expect(
          service.updateAndSendForm(
            '1',
            {} as FormUpdateBodyDto,
            authUser.user,
          ),
        ).rejects.toThrow(
          FilesErrorsResponseEnum.TOTAL_FILE_SIZE_EXCEEDED_ERROR,
        )
      })

      it('should throw if total file size exceeds global cumulative limit', async () => {
        Object.defineProperty(service['baConfigService'], 'fileLimits', {
          get: () => ({
            maxSingleSizeGlobal: 500_000_000,
            maxCumulativeSizeGlobal: 200_000_000,
          }),
          configurable: true,
        })
        ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
          ...mockFormDefinition,
          files: {
            slots: [],
          },
        })
        jest
          .spyOn(service['filesService'], 'getActiveFileSizes')
          .mockResolvedValue([
            { id: 'test-id-1', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
            { id: 'test-id-2', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
            { id: 'test-id-3', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
            { id: 'test-id-4', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
            { id: 'test-id-5', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
          ])

        await expect(
          service.updateAndSendForm(
            '1',
            {} as FormUpdateBodyDto,
            authUser.user,
          ),
        ).rejects.toThrow(
          FilesErrorsResponseEnum.TOTAL_FILE_SIZE_EXCEEDED_ERROR,
        )
      })

      it('should not throw if total file size is within limit', async () => {
        ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
          ...mockFormDefinition,
          files: {
            ...mockFormDefinition.files,
            maxTotalFileSize: 250_000_000,
          },
        })
        jest
          .spyOn(service['filesService'], 'getActiveFileSizes')
          .mockResolvedValue([
            { id: 'test-id-1', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
            { id: 'test-id-2', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
            { id: 'test-id-3', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
            { id: 'test-id-4', slotId: 'test-slot-id-1', fileSize: 50_000_000 },
          ])

        const result = await service.updateAndSendForm(
          '1',
          {} as FormUpdateBodyDto,
          authUser.user,
        )

        expect(result).toEqual({
          id: '1',
          message: 'Form was successfully queued to rabbitmq.',
          state: FormState.QUEUED,
        })
      })

      it('should skip cumulative check when feature flag is off', async () => {
        Object.defineProperty(service['baConfigService'], 'featureToggles', {
          get: () => ({
            versioning: false,
            fileSizeLimits: false,
          }),
          configurable: true,
        })
        ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
          ...mockFormDefinition,
          files: {
            ...mockFormDefinition.files,
            maxTotalFileSize: 100,
          },
        })
        jest
          .spyOn(service['filesService'], 'getActiveFileSizes')
          .mockResolvedValue([
            { id: 'test-id-1', slotId: 'test-slot-id-1', fileSize: 100 },
            { id: 'test-id-2', slotId: 'test-slot-id-1', fileSize: 100 },
            { id: 'test-id-3', slotId: 'test-slot-id-1', fileSize: 100 },
            { id: 'test-id-4', slotId: 'test-slot-id-1', fileSize: 100 },
          ])

        const result = await service.updateAndSendForm(
          '1',
          {} as FormUpdateBodyDto,
          authUser.user,
        )

        expect(result).toEqual({
          id: '1',
          message: 'Form was successfully queued to rabbitmq.',
          state: FormState.QUEUED,
        })
        expect(
          service['filesService'].getActiveFileSizes,
        ).not.toHaveBeenCalled()
      })
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

  describe('sendToNasesAndUpdateState', () => {
    it('should throw if status is not 200', async () => {
      service['nasesSenderService'].send = jest
        .fn()
        .mockResolvedValue({ status: 401 })

      await expect(
        service.sendToNasesAndUpdateState(
          '',
          {} as Forms,
          {
            formId: '',
            tries: 1,
            userData: {
              email: 'test.inovacie_at_bratislava.sk',
              firstName: 'Tester',
            },
          },
          'test-uri',
        ),
      ).rejects.toThrow()
    })

    it('should start checking for nases delivery and not trigger any errors', async () => {
      service['nasesSenderService'].send = jest
        .fn()
        .mockResolvedValue({ status: 200 })

      const spyLog = jest.spyOn(service['logger'], 'error')
      await service.sendToNasesAndUpdateState(
        '',
        {} as Forms,
        {
          formId: 'formIdVal',
          tries: 1,
          userData: {
            email: 'test.inovacie_at_bratislava.sk',
            firstName: 'Tester',
          },
        },
        'test-uri',
      )

      expect(spyLog).not.toHaveBeenCalled()
    })

    it('should pass additionalFormUpdates to formsService.updateForm', async () => {
      service['nasesSenderService'].send = jest
        .fn()
        .mockResolvedValue({ status: 200 })

      const updateFormSpy = jest.spyOn(service['formsService'], 'updateForm')
      const additionalFormUpdates = {
        formSummary: {} as PrismaJson.FormSummary,
      }

      await service.sendToNasesAndUpdateState(
        '',
        {} as Forms,
        {
          formId: 'formIdVal',
          tries: 1,
          userData: {
            email: 'test.inovacie_at_bratislava.sk',
            firstName: 'Tester',
          },
        },
        'test-uri',
        additionalFormUpdates,
      )

      expect(updateFormSpy).toHaveBeenCalledWith('formIdVal', {
        state: FormState.DELIVERED_NASES,
        error: FormError.NONE,
        ...additionalFormUpdates,
      })
    })

    it('should update to ERROR and throw error if sending to NASES fails', async () => {
      service['nasesSenderService'].send = jest
        .fn()
        .mockResolvedValue({ status: 500 })

      const updateFormSpy = jest.spyOn(service['formsService'], 'updateForm')

      await expect(
        service.sendToNasesAndUpdateState(
          'jwt',
          {} as Forms,
          {
            formId: 'formIdVal',
            tries: 1,
            userData: {
              email: 'test.inovacie_at_bratislava.sk',
              firstName: 'Tester',
            },
          },
          'test-uri',
        ),
      ).rejects.toThrow()

      expect(updateFormSpy).toHaveBeenCalledWith('formIdVal', {
        state: FormState.DRAFT,
        error: FormError.NASES_SEND_ERROR,
      })
    })

    it('should update to DELIVERED_NASES if sending to NASES is successful', async () => {
      service['nasesSenderService'].send = jest
        .fn()
        .mockResolvedValue({ status: 200 })

      const updateFormSpy = jest.spyOn(service['formsService'], 'updateForm')

      await service.sendToNasesAndUpdateState(
        'jwt',
        {} as Forms,
        {
          formId: 'formIdVal',
          tries: 1,
          userData: {
            email: 'test.inovacie_at_bratislava.sk',
            firstName: 'Tester',
          },
        },
        'test-uri',
      )

      expect(updateFormSpy).toHaveBeenCalledWith(
        'formIdVal',
        expect.objectContaining({
          state: FormState.DELIVERED_NASES,
          error: FormError.NONE,
        }),
      )
      expect(updateFormSpy).not.toHaveBeenCalledWith(
        'formIdVal',
        expect.objectContaining({
          state: FormState.DRAFT,
          error: FormError.NASES_SEND_ERROR,
        }),
      )
    })
  })
})
