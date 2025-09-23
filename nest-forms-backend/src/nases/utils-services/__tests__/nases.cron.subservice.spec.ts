import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError } from 'axios'
import {
  FormDefinition,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'

import ClientsService from '../../../clients/clients.service'
import BaConfigService from '../../../config/ba-config.service'
import { ClusterEnv } from '../../../config/environment-variables'
import ThrowerErrorGuard from '../../../utils/guards/thrower-error.guard'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../../nases.errors.enum'
import FormRegistrationStatusRepository from '../form-registration-status.repository'
import NasesCronSubservice from '../nases.cron.subservice'
import NasesUtilsService from '../tokens.nases.service'

jest.mock('../../../utils/subservices/line-logger.subservice', () => ({
  __esModule: true,
  default: jest.fn(),
  LineLoggerSubservice: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
  })),
}))

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
  ] as unknown as FormDefinition[],
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
        {
          provide: BaConfigService,
          useValue: {
            environment: {
              clusterEnv: ClusterEnv.Production,
            },
          },
        },
        {
          provide: FormRegistrationStatusRepository,
          useValue: createMock<FormRegistrationStatusRepository>(),
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
    let originalFormDefinitions: any

    beforeEach(() => {
      nasesUtilsService.createTechnicalAccountJwtToken.mockReturnValue(
        'mock-jwt-token',
      )

      // Store original mock for restoration
      const formDefinitionsModule = jest.requireMock(
        'forms-shared/definitions/formDefinitions',
      )
      originalFormDefinitions = [...formDefinitionsModule.formDefinitions]
    })

    afterEach(() => {
      // Restore original mock after each test
      const formDefinitionsModule = jest.requireMock(
        'forms-shared/definitions/formDefinitions',
      )
      formDefinitionsModule.formDefinitions = originalFormDefinitions
    })

    it('should validate all slovensko.sk forms successfully', async () => {
      mockSlovenskoSkApi.apiEformStatusGet.mockResolvedValue({
        data: { status: 'Publikovaný' },
      })
      const setStatusSpy = jest.spyOn(
        service['formRegistrationStatusRepository'],
        'setStatus',
      )

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

      expect(setStatusSpy).toHaveBeenCalledTimes(2)
      expect(setStatusSpy).toHaveBeenCalledWith(expect.any(Object), true)
      expect(setStatusSpy).not.toHaveBeenCalledWith(expect.any(Object), false)
    })

    it('should handle not published forms', async () => {
      mockSlovenskoSkApi.apiEformStatusGet
        .mockResolvedValueOnce({
          data: { status: 'Publikovaný' },
        })
        .mockResolvedValueOnce({
          data: { status: 'Nepublikovaný' },
        })
      const setStatusSpy = jest.spyOn(
        service['formRegistrationStatusRepository'],
        'setStatus',
      )

      const alertErrorSpy = jest.fn()
      jest.doMock('../../../utils/subservices/line-logger.subservice', () => ({
        __esModule: true,
        default: alertErrorSpy,
      }))

      await service.validateFormRegistrations()

      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledTimes(2)

      // Both types of calls should be made
      expect(setStatusSpy).toHaveBeenCalledTimes(2)
      expect(setStatusSpy).toHaveBeenCalledWith(expect.any(Object), true)
      expect(setStatusSpy).toHaveBeenCalledWith(expect.any(Object), false)
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
        expect.stringContaining(
          'All 2 Slovensko.sk form registrations are valid.',
        ),
      )
    })

    it('should pass if there is an unregistered testing form and the env is production', async () => {
      const testingForm = {
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'test.form.definition.3',
        pospVersion: '1.0',
        slug: 'priznanie-k-dani-z-nehnutelnosti-test',
        skipProductionRegistrationCheck: true,
      } as FormDefinition

      const formDefinitionsModule = jest.requireMock(
        'forms-shared/definitions/formDefinitions',
      )
      const extendedMockFormDefinitions = [
        ...formDefinitionsModule.formDefinitions,
        testingForm,
      ]
      formDefinitionsModule.formDefinitions = extendedMockFormDefinitions

      mockSlovenskoSkApi.apiEformStatusGet.mockImplementation((pospID) => {
        if (pospID === 'test.form.definition.3') {
          return Promise.resolve({
            data: { status: 'Nepublikovaný' },
          })
        }
        return Promise.resolve({
          data: { status: 'Publikovaný' },
        })
      })

      const logSpy = jest.spyOn(service['logger'], 'log')

      await service.validateFormRegistrations()

      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledTimes(2)
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'All 2 Slovensko.sk form registrations are valid.',
        ),
      )
    })

    it('should fail if there is an unregistered testing form and the env is staging', async () => {
      const testingForm = {
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'test.form.definition.3',
        pospVersion: '1.0',
        slug: 'priznanie-k-dani-z-nehnutelnosti-test',
        skipProductionRegistrationCheck: true,
      } as FormDefinition

      const formDefinitionsModule = jest.requireMock(
        'forms-shared/definitions/formDefinitions',
      )
      const extendedMockFormDefinitions = [
        ...formDefinitionsModule.formDefinitions,
        testingForm,
      ]
      formDefinitionsModule.formDefinitions = extendedMockFormDefinitions

      mockSlovenskoSkApi.apiEformStatusGet.mockImplementation((pospID) => {
        if (pospID === 'test.form.definition.3') {
          return Promise.resolve({
            data: { status: 'Nepublikovaný' },
          })
        }
        return Promise.resolve({
          data: { status: 'Publikovaný' },
        })
      })

      Object.defineProperty(service['baConfigService'], 'environment', {
        get: jest.fn(() => ({
          clusterEnv: ClusterEnv.Staging,
        })),
        configurable: true,
      })

      const alertErrorMock = jest.requireMock(
        '../../../utils/subservices/line-logger.subservice',
      ).default
      const logSpy = jest.spyOn(service['logger'], 'log')

      const result = await service.validateFormRegistrations()

      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledTimes(3)
      expect(logSpy).not.toHaveBeenCalled()
      expect(alertErrorMock).toHaveBeenCalled()

      expect(result['not-published']).toHaveLength(1)
      expect(result['valid']).toHaveLength(2)
    })

    it('should not save error status to db if there is an error with form verification', async () => {
      mockSlovenskoSkApi.apiEformStatusGet.mockRejectedValue(
        new Error('API Error'),
      )
      const setStatusSpy = jest.spyOn(
        service['formRegistrationStatusRepository'],
        'setStatus',
      )

      const result = await service.validateFormRegistrations()

      expect(result['error']).toHaveLength(2)
      expect(setStatusSpy).not.toHaveBeenCalled()
    })
  })
})
