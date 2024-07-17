import { getQueueToken } from '@nestjs/bull'
import { HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Forms } from '@prisma/client'

import prismaMock from '../../test/singleton'
import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import FilesService from '../files/files.service'
import FormsHelper from '../forms/forms.helper'
import FormsService from '../forms/forms.service'
import NasesConsumerService from '../nases-consumer/nases-consumer.service'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import TaxService from '../tax/tax.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { JwtNasesPayloadDto, UpdateFormRequestDto } from './dtos/requests.dto'
import NasesService from './nases.service'
import NasesUtilsService from './utils-services/tokens.nases.service'

jest.mock('../forms/forms.service')
jest.mock('../files/files.service')
jest.mock('../rabbitmq-client/rabbitmq-client.service')
jest.mock('../forms/forms.helper')
jest.mock('../nases-consumer/nases-consumer.service')
jest.mock('./utils-services/tokens.nases.service')

describe('NasesService', () => {
  let service: NasesService

  beforeEach(async () => {
    jest.resetAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        NasesService,
        ConfigService,
        FormsService,
        FilesService,
        FormsHelper,
        NasesConsumerService,
        RabbitmqClientService,
        ThrowerErrorGuard,
        NasesUtilsService,
        TaxService,
        {
          provide: getQueueToken('tax'),
          useValue: {},
        },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = app.get<NasesService>(NasesService)
    Object.defineProperty(service, 'logger', { value: { error: jest.fn() } })
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
})
