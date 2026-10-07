import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'
import axios, { AxiosError } from 'axios'
import Bull from 'bull'
import {
  FormDefinition,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import * as getFormDefinitionBySlug from 'forms-shared/definitions/getFormDefinitionBySlug'
import * as baOmitExtraData from 'forms-shared/form-utils/omitExtraData'
import * as getValuesForSharepoint from 'forms-shared/sharepoint/getValuesForSharepoint'
import { SharepointDataAllColumnMappingsToFields } from 'forms-shared/sharepoint/types'

import prismaMock from '../../../test/singleton'
import { createTestFormDefinitionSlovenskoSkGeneric } from '../../__tests__/factories/formDefinition.factory'
import BaConfigService from '../../config/ba-config.service'
import FormValidatorRegistryService from '../../form-validator-registry/form-validator-registry.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import { FormError, Forms, FormState } from '../../generated/prisma/client'
import PrismaService from '../../prisma/prisma.service'
import alertReporting from '../../utils/constants/error.alerts'
import {
  SharepointErrorsEnum,
  SharepointErrorsResponseEnum,
} from '../../utils/subservices/dtos/sharepoint.errors.enum'
import SharepointService from './sharepoint.service'

vi.mock('forms-shared/definitions/getFormDefinitionBySlug')
vi.mock('forms-shared/form-utils/omitExtraData')
vi.mock('forms-shared/sharepoint/getValuesForSharepoint')
vi.mock('forms-shared/form-utils/formDataExtractors', () => ({
  extractFormSubjectPlain: vi.fn(),
}))
describe('SharepointService', () => {
  let service: SharepointService
  const errorFactory = new ErrorFactoryService({ alertReporting })

  beforeEach(async () => {
    vi.spyOn(console, 'log').mockImplementation(vi.fn())

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineLoggerService,
        SharepointService,
        { provide: ErrorFactoryService, useValue: errorFactory },
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: BaConfigService,
          useValue: {
            sharepoint: {
              domain: 'domainValue',
              siteId: 'siteIdValue',
              siteName: 'siteNameValue',
              graphUrl: 'https://test.graph.microsoft.com/v1.0',
              clientId: 'clientIdValue',
              clientSecret: 'clientSecretValue',
              tenantId: 'tenantIdValue',
            },
          },
        },
        {
          provide: FormValidatorRegistryService,
          useValue: createMock<FormValidatorRegistryService>(),
        },
      ],
    }).compile()

    service = module.get<SharepointService>(SharepointService)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('transcode', () => {
    it('should just post new record', async () => {
      const spy = vi
        .spyOn(service, 'postNewRecord')
        .mockImplementation(async () => Promise.resolve())
      await service.transcode({ data: { formId: 'formIdValue' } } as Bull.Job<{
        formId: string
      }>)
      expect(spy).toHaveBeenCalledWith('formIdValue')
    })
  })

  describe('getAccessToken', () => {
    it('should throw BadGateway exception if the request fails', async () => {
      const axiosError = new AxiosError('some error')
      vi.spyOn(axios, 'post').mockRejectedValue(axiosError)
      await expect(service['getAccessToken']()).rejects.toThrow(
        errorFactory.BadGatewayException({
          errorEnum: SharepointErrorsEnum.ACCESS_TOKEN_ERROR,
          message: SharepointErrorsResponseEnum.ACCESS_TOKEN_ERROR,
          error: axiosError,
        }),
      )
    })

    it('should return the access token', async () => {
      vi.spyOn(axios, 'post').mockResolvedValue({
        data: { access_token: 'access_token_value' },
      })
      const result = await service['getAccessToken']()
      expect(result).toBe('access_token_value')
    })
  })

  describe('postDataToSharepoint', () => {
    it('should return the id of the created record', async () => {
      const postSpy = vi
        .spyOn(axios, 'post')
        .mockResolvedValue({ data: { id: 120 } })
      const result = await service['postDataToSharepoint'](
        'dbNameValue',
        'accessTokenValue',
        { field1: 'value1' },
      )

      expect(result.id).toBe(120)
      expect(postSpy).toHaveBeenCalledWith(
        expect.anything(),
        { fields: { field1: 'value1' } },
        expect.anything(),
      )
    })

    it('should throw BadGateway exception if the request fails', async () => {
      const axiosError = new AxiosError('some error')
      const dbName = 'dbNameValue'
      const fieldValues = { field1: 'value1' }
      vi.spyOn(axios, 'post').mockRejectedValue(axiosError)
      await expect(
        service['postDataToSharepoint'](
          dbName,
          'accessTokenValue',
          fieldValues,
        ),
      ).rejects.toThrow(
        errorFactory.BadGatewayException({
          errorEnum: SharepointErrorsEnum.POST_DATA_TO_SHAREPOINT_ERROR,
          message: SharepointErrorsResponseEnum.POST_DATA_TO_SHAREPOINT_ERROR,
          console: JSON.stringify({
            databaseName: dbName,
            postedFields: Object.keys(fieldValues),
          }),
          error: axiosError,
        }),
      )
    })
  })

  describe('mapColumnsToFields', () => {
    beforeEach(() => {
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: {
          value: [
            { displayName: 'Title1', name: 'StaticName1' },
            { displayName: 'Title2', name: 'StaticName2' },
            { displayName: 'Title3', name: 'StaticName3' },
          ],
        },
      })
    })

    it('should throw error if we are looking for unknown column', async () => {
      const unknownColumn = 'TitleNotExists'
      const dbName = 'dbNameValue'
      await expect(
        service['mapColumnsToFields'](
          ['Title1', unknownColumn],
          'access_token',
          dbName,
        ),
      ).rejects.toThrow(
        errorFactory.BadRequestException({
          errorEnum: SharepointErrorsEnum.UNKNOWN_COLUMN,
          message: `${SharepointErrorsResponseEnum.UNKNOWN_COLUMN} Column: ${unknownColumn}, dtb name: ${dbName}.`,
        }),
      )
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
      service['mapColumnsToFields'] = vi
        .fn()
        .mockResolvedValue({ Col1: 'Field1' })
      const result = await service['getAllFieldsMappings'](
        { databaseName: 'db_name', columnMap: {} },
        'acc_token',
      )

      expect(result).toEqual({
        fieldMap: { Col1: 'Field1' },
        oneToMany: {
          fieldMaps: {},
          originalTableFields: {},
        },
        oneToOne: {
          fieldMaps: {},
          originalTableFields: {},
        },
      })
    })

    it('should fill in all mappings', async () => {
      service['mapColumnsToFields'] = vi.fn(
        async (columns: string[]): Promise<Record<string, string>> => {
          const result: Record<string, string> = {}
          columns.forEach((column) => {
            result[column] = `${column}_val`
          })
          return Promise.resolve(result)
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
          oneToOne: {
            someMapping: {
              databaseName: 'otodb1',
              originalTableId: 'otoOriginalId1',
              columnMap: { oto1: { type: 'title' } },
            },
          },
        },
        'acc_token',
      )
      const expected: SharepointDataAllColumnMappingsToFields = {
        fieldMap: { original1: 'original1_val' },
        oneToMany: {
          fieldMaps: {
            otmdb1: {
              fieldMap: {
                otm1: 'otm1_val',
              },
            },
            otmdb2: {
              fieldMap: {
                otm2: 'otm2_val',
              },
            },
          },
          originalTableFields: {
            otmOriginalId1: 'otmOriginalId1_val',
            otmOriginalId2: 'otmOriginalId2_val',
          },
        },
        oneToOne: {
          fieldMaps: {
            otodb1: { fieldMap: { oto1: 'oto1_val' } },
          },
          originalTableFields: { otoOriginalId1: 'otoOriginalId1_val' },
        },
      }
      expect(result).toEqual(expected)
    })
  })

  describe('postNewRecord', () => {
    it('should throw error if no form is found', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(null)
      const getFormDefinitionSpy = vi
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockReturnValue(null)

      await expect(service.postNewRecord('formId')).rejects.toThrow(
        errorFactory.NotFoundException({
          errorEnum: FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
          message: FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
        }),
      )
      expect(getFormDefinitionSpy).not.toHaveBeenCalled()
    })

    it('should throw error if no form definition is found', async () => {
      const form = {} as Forms
      prismaMock.forms.findUnique.mockResolvedValue(form)
      const getFormDefinitionSpy = vi
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockReturnValue(null)

      await expect(service.postNewRecord('formId')).rejects.toThrow(
        errorFactory.NotFoundException({
          errorEnum: FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
          message: `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
        }),
      )
      expect(getFormDefinitionSpy).toHaveBeenCalled()
    })

    it('should throw error if the form definition has no sharepoint data', async () => {
      const form = {} as Forms
      prismaMock.forms.findUnique.mockResolvedValue(form)
      const getFormDefinitionSpy = vi
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockReturnValue({} as FormDefinition)

      await expect(service.postNewRecord('formId')).rejects.toThrow(
        errorFactory.UnprocessableEntityException({
          errorEnum: SharepointErrorsEnum.SHAREPOINT_DATA_NOT_PROVIDED,
          message: SharepointErrorsResponseEnum.SHAREPOINT_DATA_NOT_PROVIDED,
          console: { formId: form.id },
        }),
      )
      expect(getFormDefinitionSpy).toHaveBeenCalled()
    })

    it('should correctly post data to sharepoint', async () => {
      prismaMock.forms.findUnique.mockResolvedValue({
        formDataJson: {},
      } as Forms)
      vi.spyOn(
        getFormDefinitionBySlug,
        'getFormDefinitionBySlug',
      ).mockReturnValue(
        createTestFormDefinitionSlovenskoSkGeneric({
          sharepointData: {
            databaseName: 'dbName',
            columnMap: {},
            oneToMany: {
              otm1: {
                databaseName: 'otmDb1',
                originalTableId: 'otmOriginal1',
                columnMap: { col1otm1: { type: 'title' } },
              },
            },
            oneToOne: {
              oto1: {
                databaseName: 'otoDb1',
                originalTableId: 'otoOriginal1',
                columnMap: { col1oto1: { type: 'title' } },
              },
              oto2: {
                databaseName: 'otoDb2',
                originalTableId: 'otoOriginal2',
                columnMap: { col1oto2: { type: 'title' } },
              },
            },
          },
        }),
      )
      service['postDataToSharepoint'] = vi.fn().mockResolvedValue({ id: 123 })
      service['handleOneToMany'] = vi
        .fn()
        .mockResolvedValue({ otm1: 1, otm2: 2 })
      service['handleOneToOne'] = vi
        .fn()
        .mockResolvedValue({ oto1: 1, oto2: 2 })
      service['getAccessToken'] = vi.fn().mockResolvedValue('accessTokenValue')
      service['mapColumnsToFields'] = vi.fn(
        async (columns: string[]): Promise<Record<string, string>> => {
          const result: Record<string, string> = {}
          columns.forEach((column) => {
            result[column] = `${column}_val`
          })
          return Promise.resolve(result)
        },
      )
      const getValuesSpy = vi
        .spyOn(getValuesForSharepoint, 'getValuesForFields')
        .mockReturnValue({})
      const updateFormSpy = vi.mocked(service['prismaService'].forms.update)
      vi.spyOn(baOmitExtraData, 'baOmitExtraData').mockReturnValue({
        omitted: true,
      })

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

    it('should throw UnprocessableEntityException when formDataJson is null', async () => {
      const mockForm = {
        id: 'formId',
        formDefinitionSlug: 'test-slug',
        formDataJson: null,
        archived: false,
      } as Forms

      const mockFormDefinition = {
        type: FormDefinitionType.SlovenskoSkGeneric,
        sharepointData: {
          databaseName: 'testDb',
          columnMap: {},
        },
        schema: {},
        slug: 'test-slug',
      } as FormDefinitionSlovenskoSkGeneric

      prismaMock.forms.findUnique.mockResolvedValue(mockForm)
      vi.spyOn(
        getFormDefinitionBySlug,
        'getFormDefinitionBySlug',
      ).mockReturnValue(mockFormDefinition)

      await expect(service.postNewRecord('formId')).rejects.toThrow(
        errorFactory.UnprocessableEntityException({
          errorEnum: FormsErrorsEnum.EMPTY_FORM_DATA,
          message: FormsErrorsResponseEnum.EMPTY_FORM_DATA,
        }),
      )

      // Verify that no update was attempted
      expect(prismaMock.forms.update).not.toHaveBeenCalled()
    })
  })
})
