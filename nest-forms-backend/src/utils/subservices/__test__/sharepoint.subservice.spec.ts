import { HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'
import axios from 'axios'
import Bull from 'bull'
import {
  FormDefinition,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import * as getFormDefinitionBySlug from 'forms-shared/definitions/getFormDefinitionBySlug'
import { SharepointRelationData } from 'forms-shared/definitions/sharepointTypes'
import * as omitExtraData from 'forms-shared/form-utils/omitExtraData'
import * as getValuesForSharepoint from 'forms-shared/sharepoint/getValuesForSharepoint'
import { SharepointDataAllColumnMappingsToFields } from 'forms-shared/sharepoint/types'

import prismaMock from '../../../../test/singleton'
import PrismaService from '../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../guards/thrower-error.guard'
import * as textHandler from '../../handlers/text.handler'
import SharepointSubservice from '../sharepoint.subservice'

describe('SharepointSubservice', () => {
  let service: SharepointSubservice

  beforeEach(async () => {
    jest.resetAllMocks()

    const configServiceMock = {
      get: jest.fn().mockReturnValue('value'),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SharepointSubservice,
        ThrowerErrorGuard,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile()

    service = module.get<SharepointSubservice>(SharepointSubservice)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('transcode', () => {
    it('should just post new record', async () => {
      const spy = jest
        .spyOn(service, 'postNewRecord')
        .mockImplementation(async () => {})
      await service.transcode({ data: { formId: 'formIdValue' } } as Bull.Job<{
        formId: string
      }>)
      expect(spy).toHaveBeenCalledWith('formIdValue')
    })
  })

  describe('getTitle', () => {
    it('should return fallback if frontend title is null', () => {
      jest
        .spyOn(textHandler, 'getSubjectTextFromForm')
        .mockReturnValue('subject')
      jest
        .spyOn(textHandler, 'getFrontendFormTitleFromForm')
        .mockReturnValue(null)

      const result = service['getTitle']({} as Forms, {} as FormDefinition)
      expect(result).toBe('subject')
    })

    it('should return frontend title', () => {
      jest
        .spyOn(textHandler, 'getSubjectTextFromForm')
        .mockReturnValue('subject')
      jest
        .spyOn(textHandler, 'getFrontendFormTitleFromForm')
        .mockReturnValue('frontend')

      const result = service['getTitle']({} as Forms, {} as FormDefinition)
      expect(result).toBe('frontend')
    })
  })

  describe('getAccessToken', () => {
    it('should throw BadRequest exception if there was some error', async () => {
      jest.spyOn(axios, 'post').mockRejectedValue(new Error('some error'))
      try {
        await service['getAccessToken']()
        expect(true).toBeFalsy()
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        )
      }
    })

    it('should return the access token', async () => {
      jest
        .spyOn(axios, 'post')
        .mockResolvedValue({ data: { access_token: 'access_token_value' } })
      const result = await service['getAccessToken']()
      expect(result).toBe('access_token_value')
    })
  })

  describe('postDataToSharepoint', () => {
    it('should return the id of the created record', async () => {
      const postSpy = jest
        .spyOn(axios, 'post')
        .mockResolvedValue({ data: { d: { ID: 120 } } })
      const result = await service['postDataToSharepoint'](
        'dbNameValue',
        'accessTokenValue',
        { field1: 'value1' },
      )

      expect(result.id).toBe(120)
      expect(postSpy).toHaveBeenCalledWith(
        expect.anything(),
        { field1: 'value1' },
        expect.anything(),
      )
    })

    it('should throw BadRequest exception if there was some error', async () => {
      jest.spyOn(axios, 'post').mockRejectedValue(new Error('some error'))
      try {
        await service['postDataToSharepoint'](
          'dbNameValue',
          'accessTokenValue',
          { field1: 'value1' },
        )
        expect(true).toBeFalsy()
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        )
      }
    })
  })

  describe('mapColumnsToFields', () => {
    beforeEach(() => {
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: {
          d: {
            results: [
              { Title: 'Title1', StaticName: 'StaticName1' },
              { Title: 'Title2', StaticName: 'StaticName2' },
              { Title: 'Title3', StaticName: 'StaticName3' },
            ],
          },
        },
      })
    })

    it('should throw error if we are looking for unknown column', async () => {
      try {
        await service['mapColumnsToFields'](
          ['Title1', 'TitleNotExists'],
          'access_token',
          'dbNameValue',
        )
        expect(true).toBeFalsy()
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        )
      }
    })

    it('should return correct mapping', async () => {
      const result = await service['mapColumnsToFields'](
        ['Title1', 'Title3'],
        'access_token',
        'dbNameValue',
      )
      expect(result).toEqual({ Title1: 'StaticName1', Title3: 'StaticName3' })
    })
  })

  describe('getAllFieldsMappings', () => {
    it('should make oneToMany and oneToOne empty', async () => {
      service['mapColumnsToFields'] = jest
        .fn()
        .mockResolvedValue({ Col1: 'Field1' })
      const result = await service['getAllFieldsMappings'](
        { databaseName: 'db_name', columnMap: {} },
        'acc_token',
      )

      expect(result).toEqual({
        fieldMap: { Col1: 'Field1' },
        oneToMany: {},
        oneToOne: {
          fieldMaps: {},
          oneToOneOriginalTableFields: {},
        },
      })
    })

    it('should fill in all mappings', async () => {
      service['mapColumnsToFields'] = jest.fn(
        async (columns: string[]): Promise<Record<string, string>> => {
          const result: Record<string, string> = {}
          columns.forEach((column) => {
            result[column] = `${column}_val`
          })
          return result
        },
      )
      const result = await service['getAllFieldsMappings'](
        {
          databaseName: 'db_name',
          columnMap: { original1: { type: 'title' } },
          oneToMany: {
            otm1: {
              databaseName: 'otmdb1',
              originalTableId: 'otmOriginalId1',
              columnMap: { otm1: { type: 'title' } },
            },
            otm2: {
              databaseName: 'otmdb2',
              originalTableId: 'otmOriginalId2',
              columnMap: { otm2: { type: 'title' } },
            },
          },
          oneToOne: [
            {
              databaseName: 'otodb1',
              originalTableId: 'otoOriginalId1',
              columnMap: { oto1: { type: 'title' } },
            },
          ],
        },
        'acc_token',
      )
      const expected: SharepointDataAllColumnMappingsToFields = {
        fieldMap: { original1: 'original1_val' },
        oneToMany: {
          otmdb1: {
            fieldMap: {
              otm1: 'otm1_val',
              otmOriginalId1: 'otmOriginalId1_val',
            },
          },
          otmdb2: {
            fieldMap: {
              otm2: 'otm2_val',
              otmOriginalId2: 'otmOriginalId2_val',
            },
          },
        },
        oneToOne: {
          fieldMaps: {
            otodb1: { fieldMap: { oto1: 'oto1_val' } },
          },
          oneToOneOriginalTableFields: { otoOriginalId1: 'otoOriginalId1_val' },
        },
      }
      expect(result).toEqual(expected)
    })
  })

  describe('postNewRecord', () => {
    it('should throw error if no form is found', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(null)
      const getFormDefinitionSpy = jest
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockReturnValue(null)

      try {
        await service.postNewRecord('formId')
        expect(true).toBeFalsy()
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect((error as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND)
      }
      expect(getFormDefinitionSpy).not.toHaveBeenCalled()
    })

    it('should throw error if no form definition is found', async () => {
      prismaMock.forms.findUnique.mockResolvedValue({} as Forms)
      const getFormDefinitionSpy = jest
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockReturnValue(null)

      try {
        await service.postNewRecord('formId')
        expect(true).toBeFalsy()
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect((error as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND)
      }
      expect(getFormDefinitionSpy).toHaveBeenCalled()
    })

    it('should throw error if the form definition has no sharepoint data', async () => {
      prismaMock.forms.findUnique.mockResolvedValue({} as Forms)
      const getFormDefinitionSpy = jest
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockReturnValue({} as FormDefinition)

      try {
        await service.postNewRecord('formId')
        expect(true).toBeFalsy()
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.UNPROCESSABLE_ENTITY,
        )
      }
      expect(getFormDefinitionSpy).toHaveBeenCalled()
    })

    it('should correctly post data to sharepoint', async () => {
      prismaMock.forms.findUnique.mockResolvedValue({} as Forms)
      jest
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockReturnValue({
          sharepointData: {
            databaseName: 'dbName',
            columnMap: {},
            oneToMany: {
              otm1: {
                databaseName: 'otmDb1',
                originalTableId: 'otmOriginal1',
                columnMap: { col1otm1: { type: 'title' } },
              } as SharepointRelationData,
            },
            oneToOne: [
              {
                databaseName: 'otoDb1',
                originalTableId: 'otoOriginal1',
                columnMap: { col1oto1: { type: 'title' } },
              },
              {
                databaseName: 'otoDb2',
                originalTableId: 'otoOriginal2',
                columnMap: { col1oto2: { type: 'title' } },
              },
            ] as SharepointRelationData[],
          },
          type: FormDefinitionType.SlovenskoSkGeneric,
          schemas: {},
        } as unknown as FormDefinition)
      service['postDataToSharepoint'] = jest.fn().mockResolvedValue({ id: 123 })
      service['handleOneToMany'] = jest.fn()
      service['handleOneToOne'] = jest
        .fn()
        .mockResolvedValue({ oto1: 1, oto2: 2 })
      service['getAccessToken'] = jest
        .fn()
        .mockResolvedValue('accessTokenValue')
      service['getTitle'] = jest.fn().mockReturnValue('titleVal')
      service['mapColumnsToFields'] = jest.fn(
        async (columns: string[]): Promise<Record<string, string>> => {
          const result: Record<string, string> = {}
          columns.forEach((column) => {
            result[column] = `${column}_val`
          })
          return result
        },
      )
      const getValuesSpy = jest
        .spyOn(getValuesForSharepoint, 'getValuesForFields')
        .mockReturnValue({})
      const updateFormSpy = jest.spyOn(service['prismaService'].forms, 'update')
      jest
        .spyOn(omitExtraData, 'omitExtraData')
        .mockReturnValue({ omitted: true })

      await service.postNewRecord('formId')

      // TOOD more checks for calls etc.

      expect(getValuesSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { omitted: true },
        expect.anything(),
      )

      expect(updateFormSpy).toHaveBeenCalledWith({
        where: {
          id: 'formId',
        },
        data: {
          error: FormError.NONE,
          state: FormState.PROCESSING,
        },
      })
    })
  })
})
