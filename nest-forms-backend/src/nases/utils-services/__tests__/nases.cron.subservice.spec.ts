import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError } from 'axios'
import { FormDefinitionType } from 'forms-shared/definitions/formDefinitionTypes'

import ClientsService from '../../../clients/clients.service'
import ThrowerErrorGuard from '../../../utils/guards/thrower-error.guard'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../../nases.errors.enum'
import NasesCronSubservice from '../nases.cron.subservice'
import NasesUtilsService from '../tokens.nases.service'

jest.mock('forms-shared/definitions/formDefinitions', () => ({
  formDefinitions: [
    {
      type: FormDefinitionType.SlovenskoSkGeneric,
      pospID: 'test.form.definition.1',
      pospVersion: '1.0',
      slug: 'test-form-1',
    },
    {
      type: FormDefinitionType.SlovenskoSkTax,
      pospID: 'test.form.definition.2',
      pospVersion: '2.0',
      slug: 'test-form-2',
    },
    {
      type: FormDefinitionType.Webhook,
      slug: 'non-slovensko-form',
    },
  ],
}))

jest.mock('../../../utils/subservices/line-logger.subservice', () => ({
  __esModule: true,
  default: jest.fn(),
  LineLoggerSubservice: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
  })),
}))

describe('NasesCronSubservice', () => {
  let service: NasesCronSubservice
  let nasesUtilsService: jest.Mocked<NasesUtilsService>
  let throwerErrorGuard: jest.Mocked<ThrowerErrorGuard>

  const mockSlovenskoSkApi = {
    apiEformStatusGet: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NasesCronSubservice,
        {
          provide: ClientsService,
          useValue: {
            slovenskoSkApi: mockSlovenskoSkApi,
          },
        },
        {
          provide: NasesUtilsService,
          useValue: createMock<NasesUtilsService>({
            createTechnicalAccountJwtToken: jest.fn(),
          }),
        },
        {
          provide: ThrowerErrorGuard,
          useValue: createMock<ThrowerErrorGuard>({
            InternalServerErrorException: jest.fn(),
          }),
        },
      ],
    }).compile()

    service = module.get<NasesCronSubservice>(NasesCronSubservice)
    nasesUtilsService = module.get(NasesUtilsService)
    throwerErrorGuard = module.get(ThrowerErrorGuard)
  })

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should initialize logger', () => {
      expect(service['logger']).toBeDefined()
    })
  })

  describe('validateFormRegistrations', () => {
    beforeEach(() => {
      nasesUtilsService.createTechnicalAccountJwtToken.mockReturnValue(
        'mock-jwt-token',
      )
    })

    it('should validate all slovensko.sk forms successfully', async () => {
      mockSlovenskoSkApi.apiEformStatusGet.mockResolvedValue({
        data: { status: 'Publikovaný' },
      })

      await service.validateFormRegistrations()

      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledTimes(2)
      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledWith(
        'test.form.definition.1',
        '1.0',
        {
          headers: {
            Authorization: 'Bearer mock-jwt-token',
          },
        },
      )
      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledWith(
        'test.form.definition.2',
        '2.0',
        {
          headers: {
            Authorization: 'Bearer mock-jwt-token',
          },
        },
      )
    })

    it('should handle not published forms', async () => {
      mockSlovenskoSkApi.apiEformStatusGet
        .mockResolvedValueOnce({
          data: { status: 'Publikovaný' },
        })
        .mockResolvedValueOnce({
          data: { status: 'Nepublikovaný' },
        })

      const alertErrorSpy = jest.fn()
      jest.doMock('../../../utils/subservices/line-logger.subservice', () => ({
        __esModule: true,
        default: alertErrorSpy,
      }))

      await service.validateFormRegistrations()

      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledTimes(2)
    })

    it('should handle 404 errors (form not found)', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
      } as AxiosError

      mockSlovenskoSkApi.apiEformStatusGet
        .mockResolvedValueOnce({
          data: { status: 'Publikovaný' },
        })
        .mockRejectedValueOnce(axiosError)

      jest.doMock('axios', () => ({
        isAxiosError: jest.fn(() => true),
      }))

      await service.validateFormRegistrations()

      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledTimes(2)
    })

    it('should handle other API errors', async () => {
      const genericError = new Error('API Error')

      mockSlovenskoSkApi.apiEformStatusGet
        .mockResolvedValueOnce({
          data: { status: 'Publikovaný' },
        })
        .mockRejectedValueOnce(genericError)

      await service.validateFormRegistrations()

      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledTimes(2)
      expect(
        throwerErrorGuard.InternalServerErrorException,
      ).toHaveBeenCalledWith(
        NasesErrorsEnum.FAILED_FORM_REGISTRATION_VERIFICATION,
        NasesErrorsResponseEnum.FAILED_FORM_REGISTRATION_VERIFICATION,
        undefined,
        genericError,
      )
    })

    it('should skip non-slovensko.sk forms', async () => {
      await service.validateFormRegistrations()

      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledTimes(2)
      expect(
        nasesUtilsService.createTechnicalAccountJwtToken,
      ).toHaveBeenCalledTimes(2)
    })

    it('should create JWT token for each form validation', async () => {
      mockSlovenskoSkApi.apiEformStatusGet.mockResolvedValue({
        data: { status: 'Publikovaný' },
      })

      await service.validateFormRegistrations()

      expect(
        nasesUtilsService.createTechnicalAccountJwtToken,
      ).toHaveBeenCalledTimes(2)
    })

    it('should log success message when all forms are valid', async () => {
      mockSlovenskoSkApi.apiEformStatusGet.mockResolvedValue({
        data: { status: 'Publikovaný' },
      })

      const logSpy = jest.spyOn(service['logger'], 'log')

      await service.validateFormRegistrations()

      expect(logSpy).toHaveBeenCalledWith(
        'All Slovensko.sk form registrations are valid.',
      )
    })
  })
})
