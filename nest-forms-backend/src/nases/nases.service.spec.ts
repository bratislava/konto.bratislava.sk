/* eslint-disable pii/no-email */
import { createMock } from '@golevelup/ts-jest'
import { getQueueToken } from '@nestjs/bull'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'
import { RJSFValidationError, ValidationData } from '@rjsf/utils'
import {
  FormDefinition,
  FormDefinitionEmail,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import * as formDefinitionModule from 'forms-shared/definitions/getFormDefinitionBySlug'
import * as baRjsfValidatorModule from 'forms-shared/form-utils/validators'

import prismaMock from '../../test/singleton'
import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import * as isUserVerified from '../common/utils/helpers'
import FilesService from '../files/files.service'
import { FormsErrorsResponseEnum } from '../forms/forms.errors.enum'
import FormsHelper from '../forms/forms.helper'
import FormsService from '../forms/forms.service'
import NasesConsumerService from '../nases-consumer/nases-consumer.service'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { JwtNasesPayloadDto, UpdateFormRequestDto } from './dtos/requests.dto'
import { ResponseGdprDataDto } from './dtos/responses.dto'
import { NasesErrorsResponseEnum } from './nases.errors.enum'
import NasesService from './nases.service'
import NasesUtilsService from './utils-services/tokens.nases.service'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug')
jest.mock('forms-shared/form-utils/validators')
jest.mock('../common/utils/helpers')

describe('NasesService', () => {
  let service: NasesService
  let formsService: FormsService
  let formsHelper: FormsHelper
  let rabbitmqClientService: RabbitmqClientService

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
          provide: getQueueToken('email-forms.send'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile()

    service = app.get<NasesService>(NasesService)
    formsService = app.get<FormsService>(FormsService)
    formsHelper = app.get<FormsHelper>(FormsHelper)
    rabbitmqClientService = app.get<RabbitmqClientService>(
      RabbitmqClientService,
    )

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

    jest
      .spyOn(baRjsfValidatorModule.baRjsfValidator, 'validateFormData')
      .mockReturnValue({
        errors: [],
        errorSchema: {},
      } as unknown as ValidationData<any>)
  })

  describe('should be defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })
  })

  describe('migrateForm', () => {
    it('should throw error', async () => {
      prismaMock.forms.findFirst.mockResolvedValue(null)

      await expect(
        service.migrateForm('1', { sub: 'sub' } as CognitoGetUserData, 'ico1'),
      ).rejects.toThrow()
    })

    it('should throw error if the form is already assigned to another user', async () => {
      prismaMock.forms.findFirst
        .mockResolvedValueOnce({
          mainUri: null,
          actorUri: null,
          userExternalId: 'external',
        } as Forms)
        .mockResolvedValueOnce({
          mainUri: 'uri',
          actorUri: 'uri',
          userExternalId: null,
        } as Forms)
      prismaMock.forms.update.mockResolvedValue({} as Forms)

      await expect(
        service.migrateForm('1', { sub: 'sub' } as CognitoGetUserData, 'ico1'),
      ).rejects.toThrow()
      await expect(
        service.migrateForm('1', { sub: 'sub' } as CognitoGetUserData, 'ico1'),
      ).rejects.toThrow()
    })

    it('should correctly update', async () => {
      prismaMock.forms.findFirst.mockResolvedValue({
        mainUri: null,
        actorUri: null,
        userExternalId: null,
      } as Forms)
      const spy = jest
        .spyOn(prismaMock.forms, 'update')
        .mockResolvedValue({} as Forms)

      await service.migrateForm(
        '1',
        { sub: 'sub' } as CognitoGetUserData,
        'ico1',
      )
      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        data: {
          userExternalId: 'sub',
          ico: 'ico1',
        },
      })
    })
  })

  describe('updateForm', () => {
    it('should throw not found', async () => {
      prismaMock.forms.findFirst.mockResolvedValue(null)

      await expect(
        service.updateForm(
          '1',
          { email: 'email' } as UpdateFormRequestDto,
          'ico1',
          { sub: 'subUser', email: 'emailUser' } as CognitoGetUserData,
        ),
      ).rejects.toThrow()
    })

    it('should throw unauthorized', async () => {
      service['formsHelper'].isFormAccessGranted = jest
        .fn()
        .mockReturnValue(false)
      prismaMock.forms.findFirst.mockResolvedValue({} as Forms)

      await expect(
        service.updateForm(
          '1',
          { email: 'email' } as UpdateFormRequestDto,
          'ico1',
          { sub: 'subUser', email: 'emailUser' } as CognitoGetUserData,
        ),
      ).rejects.toThrow()
    })

    it('should correctly update', async () => {
      prismaMock.forms.findFirst.mockResolvedValue({} as Forms)
      service['formsHelper'].isFormAccessGranted = jest
        .fn()
        .mockReturnValue(true)
      const spy = jest.spyOn(service['formsService'], 'updateForm')

      await service.updateForm(
        '1',
        { email: 'emailOverride', formDataXml: 'xml' } as UpdateFormRequestDto,
        'ico1',
        { email: 'emailUser', sub: 'subUser' } as CognitoGetUserData,
      )
      expect(spy).toHaveBeenCalledWith('1', {
        userExternalId: 'subUser',
        email: 'emailOverride',
        formDataXml: 'xml',
        ico: 'ico1',
      })
    })
  })

  describe('canSendForm', () => {
    it('should throw error if check form throws', async () => {
      service['formsService'].checkFormBeforeSending = jest
        .fn()
        .mockRejectedValue(new HttpException('Error', 404))
      await expect(
        service.canSendForm('1', {
          sub: 'uri',
          actor: {
            sub: 'uri',
          },
        } as JwtNasesPayloadDto),
      ).rejects.toThrow()
    })

    it('should throw error if form send is not granted', async () => {
      service['formsService'].checkFormBeforeSending = jest
        .fn()
        .mockResolvedValue({} as Forms)
      service['formsHelper'].userCanSendFormEid = jest
        .fn()
        .mockReturnValue(false)

      await expect(
        service.canSendForm('1', {
          sub: 'uri',
          actor: {
            sub: 'uri',
          },
        } as JwtNasesPayloadDto),
      ).rejects.toThrow()
    })

    it('should return the result of areFormAttachmentsReady otherwise', async () => {
      service['formsService'].checkFormBeforeSending = jest
        .fn()
        .mockResolvedValue({} as Forms)
      service['formsHelper'].userCanSendFormEid = jest
        .fn()
        .mockReturnValue(true)

      service['filesService'].areFormAttachmentsReady = jest
        .fn()
        .mockResolvedValue({ filesReady: false })
      expect(
        await service.canSendForm('1', {
          sub: 'uri',
          actor: {
            sub: 'uri',
          },
        } as JwtNasesPayloadDto),
      ).toBeFalsy()
      service['filesService'].areFormAttachmentsReady = jest
        .fn()
        .mockResolvedValue({ filesReady: true })
      expect(
        await service.canSendForm('1', {
          sub: 'uri',
          actor: {
            sub: 'uri',
          },
        } as JwtNasesPayloadDto),
      ).toBeTruthy()
    })
  })

  describe('sendFormEid', () => {
    it('should throw an error if sendMessageNases returns a status different than 200', async () => {
      // Mock dependencies
      const mockForm = { id: '1', formDefinitionSlug: 'test-slug' } as Forms
      const mockUser = {
        sub: 'user-sub',
        actor: { sub: 'actor-sub' },
      } as JwtNasesPayloadDto
      const mockCognitoUser = { sub: 'cognito-sub' } as CognitoGetUserData
      const mockFormDefinition: FormDefinition = {
        schemas: {
          schema: {},
          uiSchema: { 'ui:options': {} },
        },
        slug: 'test-slug',
        type: FormDefinitionType.SlovenskoSkTax,
        title: 'Test Form',
        termsAndConditions: 'Test Terms and Conditions',
        messageSubjectDefault: 'Test Subject',
        pospID: 'test-posp-id',
        pospVersion: '1.0',
        publisher: 'Test Publisher',
        gestor: 'Test Gestor',
        isSigned: false,
      }

      // Setup mocks
      service['formsService'].checkFormBeforeSending = jest
        .fn()
        .mockResolvedValue(mockForm)
      service['formsHelper'].userCanSendFormEid = jest
        .fn()
        .mockReturnValue(true)
      service['nasesUtilsService'].createUserJwtToken = jest
        .fn()
        .mockReturnValue('mock-jwt')
      service['filesService'].areFormAttachmentsReady = jest
        .fn()
        .mockResolvedValue({ filesReady: true, requeue: false })
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )

      // this is the important mock we're testing against
      service['nasesConsumerService'].sendToNasesAndUpdateState = jest
        .fn()
        .mockReturnValue(false)

      const updateFormSpy = jest.spyOn(service['formsService'], 'updateForm')

      // Execute and assert
      await expect(
        service.sendFormEid('1', 'mock-obo-token', mockUser, mockCognitoUser),
      ).rejects.toThrow(NasesErrorsResponseEnum.SEND_TO_NASES_ERROR)
      expect(updateFormSpy).toHaveBeenCalledWith('1', {
        state: FormState.DRAFT,
        error: FormError.NASES_SEND_ERROR,
      })
    })
  })

  describe('sendForm', () => {
    const mockForm = {
      id: 'form-id',
      formDefinitionSlug: 'test-slug',
      formDataJson: {},
    }
    const mockUser = {
      sub: 'user-sub',
      email: 'user@example.com',
      given_name: 'John',
    } as CognitoGetUserData
    const mockUserInfo = {} as ResponseGdprDataDto

    beforeEach(() => {
      formsService.checkFormBeforeSending = jest
        .fn()
        .mockResolvedValue(mockForm as Forms)
      jest
        .spyOn(formDefinitionModule, 'getFormDefinitionBySlug')
        .mockReturnValue({
          type: FormDefinitionType.SlovenskoSkGeneric,
          schemas: { schema: {}, uiSchema: {} },
        } as FormDefinitionSlovenskoSkGeneric)
      jest.spyOn(formsHelper, 'userCanSendForm').mockReturnValue(true)
      jest.spyOn(isUserVerified, 'isUserVerified').mockReturnValue(true)
    })

    it('should send a form successfully', async () => {
      const result = await service.sendForm(
        'form-id',
        mockUserInfo as ResponseGdprDataDto,
        mockUser as CognitoGetUserData,
      )

      expect(formsService.checkFormBeforeSending).toHaveBeenCalledWith(
        'form-id',
      )
      expect(formDefinitionModule.getFormDefinitionBySlug).toHaveBeenCalledWith(
        'test-slug',
      )
      expect(
        baRjsfValidatorModule.baRjsfValidator.validateFormData,
      ).toHaveBeenCalled()
      expect(formsHelper.userCanSendForm).toHaveBeenCalledWith(
        mockForm,
        mockUserInfo,
        'user-sub',
      )
      expect(rabbitmqClientService.publishDelay).toHaveBeenCalled()
      expect(formsService.updateForm).toHaveBeenCalledWith('form-id', {
        state: FormState.QUEUED,
      })
      expect(result).toEqual({
        id: 'form-id',
        message: 'Form was successfully queued to rabbitmq.',
        state: FormState.QUEUED,
      })
    })

    it('should throw an error if form definition is not found', async () => {
      jest
        .spyOn(formDefinitionModule, 'getFormDefinitionBySlug')
        .mockReturnValue(null)

      await expect(
        service.sendForm('form-id', mockUserInfo, mockUser),
      ).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.NOT_FOUND,
        }),
      )
    })

    it('should throw an error if form data is invalid', async () => {
      jest
        .spyOn(baRjsfValidatorModule.baRjsfValidator, 'validateFormData')
        .mockReturnValue({
          errors: [{ message: 'some error' } as RJSFValidationError],
        } as ValidationData<any>)

      await expect(
        service.sendForm('form-id', mockUserInfo, mockUser),
      ).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.NOT_ACCEPTABLE,
          message: FormsErrorsResponseEnum.FORM_DATA_INVALID,
        }),
      )
    })

    it('should throw an error if user is not verified for an email form that requires verification', async () => {
      jest
        .spyOn(formDefinitionModule, 'getFormDefinitionBySlug')
        .mockReturnValue({
          type: FormDefinitionType.Email,
          schemas: { schema: {} },
          onlyForVerifiedUsers: true,
        } as FormDefinitionEmail)

      jest.spyOn(isUserVerified, 'isUserVerified').mockReturnValue(false)

      await expect(
        service.sendForm('form-id', mockUserInfo, mockUser),
      ).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.FORBIDDEN,
        }),
      )
    })

    it('should be okay if user is not verified but the email form does not require verification', async () => {
      jest
        .spyOn(formDefinitionModule, 'getFormDefinitionBySlug')
        .mockReturnValue({
          type: FormDefinitionType.Email,
          schemas: { schema: {} },
          onlyForVerifiedUsers: false,
        } as FormDefinitionEmail)

      const sendEmailSpy = jest.spyOn(service, 'sendFormEmail')
      const sendToNasesSpy = jest.spyOn(
        service['rabbitmqClientService'],
        'publishDelay',
      )

      jest.spyOn(isUserVerified, 'isUserVerified').mockReturnValue(false)

      let result = await service.sendForm('form-id', mockUserInfo, mockUser)

      expect(result).toEqual({
        id: 'form-id',
        message: 'Form was successfuly queued to be sent to email.',
        state: FormState.QUEUED,
      })

      // Even if onlyForVerifiedUsers is empty, we should be okay if the user is not verified
      jest
        .spyOn(formDefinitionModule, 'getFormDefinitionBySlug')
        .mockReturnValue({
          type: FormDefinitionType.Email,
          schemas: { schema: {} },
        } as FormDefinitionEmail)

      result = await service.sendForm('form-id', mockUserInfo, mockUser)

      expect(result).toEqual({
        id: 'form-id',
        message: 'Form was successfuly queued to be sent to email.',
        state: FormState.QUEUED,
      })

      expect(sendEmailSpy).toHaveBeenCalledTimes(2)
      expect(sendToNasesSpy).not.toHaveBeenCalled()
    })

    it('should throw an error if user is not allowed to send the form', async () => {
      jest.spyOn(formsHelper, 'userCanSendForm').mockReturnValue(false)

      await expect(
        service.sendForm('form-id', mockUserInfo, mockUser),
      ).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.FORBIDDEN,
        }),
      )
    })

    it('should handle email forms correctly', async () => {
      jest
        .spyOn(formDefinitionModule, 'getFormDefinitionBySlug')
        .mockReturnValue({
          type: FormDefinitionType.Email,
          schemas: { schema: {} },
        } as FormDefinitionEmail)

      const result = await service.sendForm('form-id', mockUserInfo, mockUser)

      expect(result).toEqual({
        id: 'form-id',
        message: 'Form was successfuly queued to be sent to email.',
        state: FormState.QUEUED,
      })
    })

    it('should throw an error if unable to add form to RabbitMQ', async () => {
      jest
        .spyOn(rabbitmqClientService, 'publishDelay')
        .mockRejectedValue(new Error('RabbitMQ error'))

      await expect(
        service.sendForm('form-id', mockUserInfo, mockUser),
      ).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.NOT_FOUND,
        }),
      )
    })

    it('should handle email forms for verified users only', async () => {
      jest
        .spyOn(formDefinitionModule, 'getFormDefinitionBySlug')
        .mockReturnValue({
          type: FormDefinitionType.Email,
          schemas: { schema: {} },
          onlyForVerifiedUsers: true,
        } as FormDefinitionEmail)

      const result = await service.sendForm('form-id', mockUserInfo, mockUser)

      expect(result).toEqual({
        id: 'form-id',
        message: 'Form was successfuly queued to be sent to email.',
        state: FormState.QUEUED,
      })
    })

    it('should update form state to QUEUED after successful sending', async () => {
      await service.sendForm('form-id', mockUserInfo, mockUser)

      expect(formsService.updateForm).toHaveBeenCalledWith('form-id', {
        state: FormState.QUEUED,
      })
    })
  })
})
/* eslint-enable pii/no-email */
