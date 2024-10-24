/* eslint-disable pii/no-email */
import { createMock } from '@golevelup/ts-jest'
import { HttpException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'
import { ValidationData } from '@rjsf/utils'
import {
  FormDefinition,
  FormDefinitionEmail,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import * as baRjsfValidatorModule from 'forms-shared/form-utils/validators'

import prismaMock from '../../test/singleton'
import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import FilesService from '../files/files.service'
import { FormsErrorsResponseEnum } from '../forms/forms.errors.enum'
import FormsHelper from '../forms/forms.helper'
import FormsService from '../forms/forms.service'
import NasesConsumerService from '../nases-consumer/nases-consumer.service'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import { Tier } from '../utils/global-enums/city-account.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { JwtNasesPayloadDto, UpdateFormRequestDto } from './dtos/requests.dto'
import { NasesErrorsEnum, NasesErrorsResponseEnum } from './nases.errors.enum'
import NasesService from './nases.service'
import NasesUtilsService from './utils-services/tokens.nases.service'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug')
jest.mock('forms-shared/form-utils/validators')

describe('NasesService', () => {
  let service: NasesService

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
      id: '1',
      formDefinitionSlug: 'test-slug',
      formDataJson: { test: 'data' },
    } as unknown as Forms

    const mockFormDefinition = {
      schemas: {
        schema: {},
        uiSchema: {},
      },
      type: FormDefinitionType.SlovenskoSkGeneric,
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
        .spyOn(service['formsHelper'], 'userCanSendForm')
        .mockReturnValue(true)
      jest
        .spyOn(service['formsService'], 'updateForm')
        .mockResolvedValue(mockForm)
      jest.spyOn(service as any, 'isUserVerified').mockReturnValue(true)
    })

    it('should throw an error if form definition is not found', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(null)

      await expect(service.sendForm('1')).rejects.toThrow(
        FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND,
      )
    })

    it('should throw an error if form data is invalid', async () => {
      jest
        .spyOn(baRjsfValidatorModule.baRjsfValidator, 'validateFormData')
        .mockReturnValue({
          errors: ['Invalid data'],
        } as unknown as ValidationData<any>)

      await expect(service.sendForm('1')).rejects.toThrow(
        FormsErrorsResponseEnum.FORM_DATA_INVALID,
      )
    })

    it('should throw an error if user is not verified for a form that requires verification', async () => {
      jest.spyOn(service as any, 'isUserVerified').mockReturnValue(false)

      await expect(
        service.sendForm('1', undefined, {} as CognitoGetUserData),
      ).rejects.toThrow(NasesErrorsResponseEnum.SEND_UNVERIFIED)
    })

    it('should throw an error if user cannot send the form', async () => {
      jest
        .spyOn(service['formsHelper'], 'userCanSendForm')
        .mockReturnValue(false)

      await expect(service.sendForm('1')).rejects.toThrow(
        NasesErrorsResponseEnum.FORBIDDEN_SEND,
      )
    })

    it('should throw an error if publishing to RabbitMQ fails', async () => {
      jest
        .spyOn(service['rabbitmqClientService'], 'publishDelay')
        .mockRejectedValue(new Error('RabbitMQ error'))

      await expect(service.sendForm('1')).rejects.toThrow(
        NasesErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT,
      )
    })

    it('should queue the form', async () => {
      const result = await service.sendForm('1')

      expect(result).toEqual({
        id: '1',
        message: 'Form was successfully queued to rabbitmq.',
        state: FormState.QUEUED,
      })
    })

    it('should fail if the email form is only for verified users and the user is not verified', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        ...mockFormDefinitionEmail,
      })
      jest.spyOn(service as any, 'isUserVerified').mockReturnValue(false)

      await expect(service.sendForm('1')).rejects.toThrow(
        NasesErrorsResponseEnum.SEND_UNVERIFIED,
      )
    })

    it('should queue the email form even if the user is not authenticated and the form is not only for authenticated users', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        ...mockFormDefinitionEmail,
        allowSendingUnauthenticatedUsers: true,
      })
      jest.spyOn(service as any, 'isUserVerified').mockReturnValue(false)

      const result = await service.sendForm('1')

      expect(result).toEqual({
        id: '1',
        message: 'Form was successfully queued to rabbitmq.',
        state: FormState.QUEUED,
      })
    })

    it('should queue the email form when the user is authenticated and needs to be authenticated', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        ...mockFormDefinitionEmail,
        allowSendingUnauthenticatedUsers: false,
      })

      const result = await service.sendForm('1')

      expect(result).toEqual({
        id: '1',
        message: 'Form was successfully queued to rabbitmq.',
        state: FormState.QUEUED,
      })
    })
  })

  describe('isUserVerified', () => {
    it('should return true if the user is verified', () => {
      expect(
        service['isUserVerified']({
          'custom:tier': Tier.IDENTITY_CARD,
        } as CognitoGetUserData),
      ).toBeTruthy()
    })

    it('should return false if the user is not verified', () => {
      expect(
        service['isUserVerified']({
          'custom:tier': Tier.NOT_VERIFIED_IDENTITY_CARD,
        } as CognitoGetUserData),
      ).toBeFalsy()
    })

    it('should return false if the user is not provided', () => {
      expect(service['isUserVerified']()).toBeFalsy()
    })
  })

  describe('emailParsedFromForm', () => {
    it('should return null if the form definition is not an email form', () => {
      expect(
        service['emailParsedFromForm'](
          {
            type: FormDefinitionType.SlovenskoSkGeneric,
          } as FormDefinition,
          {},
        ),
      ).toBeNull()
    })

    it('should return null if the user email path is not a string', () => {
      expect(
        service['emailParsedFromForm'](
          {
            type: FormDefinitionType.Email,
            userEmailPath: 'user.email',
          } as FormDefinitionEmail,
          { user: { email: { more: 'data' } } },
        ),
      ).toBeNull()

      expect(
        service['emailParsedFromForm'](
          {
            type: FormDefinitionType.Email,
            userEmailPath: 'user.email',
          } as FormDefinitionEmail,
          {},
        ),
      ).toBeNull()
    })

    it('should return the email if the user email path is a string', () => {
      expect(
        service['emailParsedFromForm'](
          {
            type: FormDefinitionType.Email,
            userEmailPath: 'user.email',
          } as FormDefinitionEmail,
          { user: { email: 'test@example.com' } },
        ),
      ).toBe('test@example.com')
    })
  })

  describe('firstNameParsedFromForm', () => {
    it('should return null if the form definition is not an email form', () => {
      expect(
        service['firstNameParsedFromForm'](
          {
            type: FormDefinitionType.SlovenskoSkGeneric,
          } as FormDefinition,
          {},
        ),
      ).toBeNull()
    })

    it('should return null if the user name path is not a string', () => {
      expect(
        service['firstNameParsedFromForm'](
          {
            type: FormDefinitionType.Email,
            userNamePath: 'user.name',
          } as FormDefinitionEmail,
          { user: { name: { more: 'data' } } },
        ),
      ).toBeNull()

      expect(
        service['firstNameParsedFromForm'](
          {
            type: FormDefinitionType.Email,
            userNamePath: 'user.name',
          } as FormDefinitionEmail,
          {},
        ),
      ).toBeNull()
    })

    it('should return the first name if the user name path is a string', () => {
      expect(
        service['firstNameParsedFromForm'](
          {
            type: FormDefinitionType.Email,
            userNamePath: 'user.name',
          } as FormDefinitionEmail,
          { user: { name: 'John' } },
        ),
      ).toBe('John')
    })
  })
})
/* eslint-enable pii/no-email */
