import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError } from 'axios'
import {
  FormDefinition,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import type { Mocked } from 'vitest'

import {
  createTestFormDefinitionSlovenskoSkGeneric,
  createTestFormDefinitionSlovenskoSkTax,
  createTestFormDefinitionWebhook,
} from '../../../__tests__/factories/formDefinition.factory'
import { expectStringContaining } from '../../../__tests__/matchers'
import ApiJwtTokensService from '../../../api-jwt-tokens/api-jwt-tokens.service'
import ClientsService from '../../../clients/clients.service'
import BaConfigService from '../../../config/ba-config.service'
import { ClusterEnv } from '../../../config/environment-variables'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../../nases.errors.enum'
import FormRegistrationStatusRepository from '../../repositories/form-registration-status.repository'
import NasesCronService from '../nases.cron.service'

vi.mock('@bratislava/log-nest', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@bratislava/log-nest')>()),
  LineLoggerService: vi.fn().mockImplementation(function () {
    return { log: vi.fn(), error: vi.fn() }
  }),
}))

vi.mock('forms-shared/definitions/formDefinitions', () => ({
  formDefinitions: [
    createTestFormDefinitionSlovenskoSkGeneric({
      pospID: 'test.form.definition.1',
      pospVersion: '1.0',
      slug: 'test-form-1',
    }),
    createTestFormDefinitionSlovenskoSkTax({
      pospID: 'test.form.definition.2',
      pospVersion: '2.0',
      slug: 'test-form-2',
    }),
    createTestFormDefinitionWebhook({
      slug: 'non-slovensko-form',
    }),
  ],
}))

describe('NasesCronService', () => {
  let service: NasesCronService
  let apiJwtTokensService: Mocked<ApiJwtTokensService>
  let errorFactoryService: Mocked<ErrorFactoryService>

  const mockSlovenskoSkApi = {
    apiEformStatusGet: vi.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineLoggerService,
        NasesCronService,
        {
          provide: ClientsService,
          useValue: {
            slovenskoSkApi: mockSlovenskoSkApi,
          },
        },
        {
          provide: ApiJwtTokensService,
          useValue: createMock<ApiJwtTokensService>({
            createTechnicalAccountJwtToken: vi.fn(),
          }),
        },
        {
          provide: ErrorFactoryService,
          useValue: createMock<ErrorFactoryService>({
            InternalServerErrorException: vi.fn(),
          }),
        },
        {
          provide: BaConfigService,
          useValue: {
            environment: {
              clusterEnv: ClusterEnv.Production,
            },
            slovenskoSk: {
              subNasesTechnicalAccount: 'test-sub',
              apiTokenPrivate: 'test-private-key',
            },
          },
        },
        {
          provide: FormRegistrationStatusRepository,
          useValue: createMock<FormRegistrationStatusRepository>(),
        },
      ],
    }).compile()

    service = module.get<NasesCronService>(NasesCronService)
    apiJwtTokensService = module.get(ApiJwtTokensService)
    errorFactoryService = module.get(ErrorFactoryService)
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
    let originalFormDefinitions: FormDefinition[]

    beforeEach(async () => {
      apiJwtTokensService.createTechnicalAccountJwtToken.mockReturnValue(
        'mock-jwt-token',
      )

      // Store original mock for restoration
      const formDefinitionsModule =
        (await import('forms-shared/definitions/formDefinitions')) as {
          formDefinitions: FormDefinition[]
        }
      originalFormDefinitions = [...formDefinitionsModule.formDefinitions]
    })

    afterEach(async () => {
      // Restore original mock after each test
      const formDefinitionsModule =
        (await import('forms-shared/definitions/formDefinitions')) as {
          formDefinitions: FormDefinition[]
        }
      formDefinitionsModule.formDefinitions = originalFormDefinitions
    })

    it('should validate all slovensko.sk forms successfully', async () => {
      mockSlovenskoSkApi.apiEformStatusGet.mockResolvedValue({
        data: { status: 'Publikovaný' },
      })
      const setStatusSpy = vi.mocked(
        service['formRegistrationStatusRepository'].setStatus,
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
      const setStatusSpy = vi.mocked(
        service['formRegistrationStatusRepository'].setStatus,
      )

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

      vi.doMock('axios', () => ({
        isAxiosError: vi.fn(() => true),
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
        errorFactoryService.InternalServerErrorException,
      ).toHaveBeenCalledWith({
        errorEnum: NasesErrorsEnum.FAILED_FORM_REGISTRATION_VERIFICATION,
        message: NasesErrorsResponseEnum.FAILED_FORM_REGISTRATION_VERIFICATION,
        error: genericError,
      })
    })

    it('should skip non-slovensko.sk forms', async () => {
      await service.validateFormRegistrations()

      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledTimes(2)
      expect(
        apiJwtTokensService.createTechnicalAccountJwtToken,
      ).toHaveBeenCalledTimes(2)
    })

    it('should create JWT token for each form validation', async () => {
      mockSlovenskoSkApi.apiEformStatusGet.mockResolvedValue({
        data: { status: 'Publikovaný' },
      })

      await service.validateFormRegistrations()

      expect(
        apiJwtTokensService.createTechnicalAccountJwtToken,
      ).toHaveBeenCalledTimes(2)
    })

    it('should log success message when all forms are valid', async () => {
      mockSlovenskoSkApi.apiEformStatusGet.mockResolvedValue({
        data: { status: 'Publikovaný' },
      })

      const logSpy = vi.spyOn(service['logger'], 'log')

      await service.validateFormRegistrations()

      expect(logSpy).toHaveBeenCalledWith(
        expectStringContaining(
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

      const formDefinitionsModule =
        (await import('forms-shared/definitions/formDefinitions')) as {
          formDefinitions: FormDefinition[]
        }
      const extendedMockFormDefinitions = [
        ...formDefinitionsModule.formDefinitions,
        testingForm,
      ]
      formDefinitionsModule.formDefinitions = extendedMockFormDefinitions

      mockSlovenskoSkApi.apiEformStatusGet.mockImplementation(
        async (pospID) => {
          if (pospID === 'test.form.definition.3') {
            return Promise.resolve({
              data: { status: 'Nepublikovaný' },
            })
          }
          return Promise.resolve({
            data: { status: 'Publikovaný' },
          })
        },
      )

      const logSpy = vi.spyOn(service['logger'], 'log')

      await service.validateFormRegistrations()

      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledTimes(2)
      expect(logSpy).toHaveBeenCalledWith(
        expectStringContaining(
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

      const formDefinitionsModule =
        (await import('forms-shared/definitions/formDefinitions')) as {
          formDefinitions: FormDefinition[]
        }
      const extendedMockFormDefinitions = [
        ...formDefinitionsModule.formDefinitions,
        testingForm,
      ]
      formDefinitionsModule.formDefinitions = extendedMockFormDefinitions

      mockSlovenskoSkApi.apiEformStatusGet.mockImplementation(
        async (pospID) => {
          if (pospID === 'test.form.definition.3') {
            return Promise.resolve({
              data: { status: 'Nepublikovaný' },
            })
          }
          return Promise.resolve({
            data: { status: 'Publikovaný' },
          })
        },
      )

      Object.defineProperty(service['baConfigService'], 'environment', {
        get: vi.fn(() => ({
          clusterEnv: ClusterEnv.Staging,
        })),
        configurable: true,
      })

      const logSpy = vi.spyOn(service['logger'], 'log')
      const errorSpy = vi.spyOn(service['logger'], 'error')

      const result = await service.validateFormRegistrations()

      expect(mockSlovenskoSkApi.apiEformStatusGet).toHaveBeenCalledTimes(3)
      expect(logSpy).not.toHaveBeenCalled()
      expect(errorSpy).toHaveBeenCalled()

      expect(result['not-published']).toHaveLength(1)
      expect(result['valid']).toHaveLength(2)
    })

    it('should not save error status to db if there is an error with form verification', async () => {
      mockSlovenskoSkApi.apiEformStatusGet.mockRejectedValue(
        new Error('API Error'),
      )
      const setStatusSpy = vi.mocked(
        service['formRegistrationStatusRepository'].setStatus,
      )

      const result = await service.validateFormRegistrations()

      expect(result['error']).toHaveLength(2)
      expect(setStatusSpy).not.toHaveBeenCalled()
    })

    it('should put a published but disabled form into published-but-disabled, not valid', async () => {
      const disabledForm = {
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'test.form.definition.disabled',
        pospVersion: '1.0',
        slug: 'disabled-form',
        isDisabled: true,
      } as FormDefinition

      const formDefinitionsModule =
        (await import('forms-shared/definitions/formDefinitions')) as {
          formDefinitions: FormDefinition[]
        }
      formDefinitionsModule.formDefinitions = [
        ...originalFormDefinitions,
        disabledForm,
      ]

      mockSlovenskoSkApi.apiEformStatusGet.mockResolvedValue({
        data: { status: 'Publikovaný' },
      })

      const result = await service.validateFormRegistrations()

      /*
      TODO: temporarily changing, after fix put back.
      https://github.com/bratislava/private-konto.bratislava.sk/issues/1680

      expect(result['published-but-disabled']).toHaveLength(1)
      expect(result['published-but-disabled'][0].slug).toBe('disabled-form')
      expect(result.valid).toHaveLength(2)
      */
      expect(result['published-but-disabled']).toHaveLength(0)
      expect(result.valid).toHaveLength(3)
    })

    it('should set registration status to true for a published-but-disabled form', async () => {
      const disabledForm = {
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'test.form.definition.disabled',
        pospVersion: '1.0',
        slug: 'disabled-form',
        isDisabled: true,
      } as FormDefinition

      const formDefinitionsModule =
        (await import('forms-shared/definitions/formDefinitions')) as {
          formDefinitions: FormDefinition[]
        }
      formDefinitionsModule.formDefinitions = [disabledForm]

      mockSlovenskoSkApi.apiEformStatusGet.mockResolvedValue({
        data: { status: 'Publikovaný' },
      })

      const setStatusSpy = vi.mocked(
        service['formRegistrationStatusRepository'].setStatus,
      )

      await service.validateFormRegistrations()

      expect(setStatusSpy).toHaveBeenCalledWith(disabledForm, true)
    })

    it('should trigger an error alert when there are published-but-disabled forms', async () => {
      const disabledForm = {
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'test.form.definition.disabled',
        pospVersion: '1.0',
        slug: 'disabled-form',
        isDisabled: true,
      } as FormDefinition

      const formDefinitionsModule =
        (await import('forms-shared/definitions/formDefinitions')) as {
          formDefinitions: FormDefinition[]
        }
      formDefinitionsModule.formDefinitions = [disabledForm]

      mockSlovenskoSkApi.apiEformStatusGet.mockResolvedValue({
        data: { status: 'Publikovaný' },
      })

      const errorSpy = vi.spyOn(service['logger'], 'error')
      const logSpy = vi.spyOn(service['logger'], 'log')

      await service.validateFormRegistrations()

      /*
      TODO: temporarily changing, after fix put back.
      https://github.com/bratislava/private-konto.bratislava.sk/issues/1680

      expect(errorSpy).toHaveBeenCalled()
      expect(logSpy).not.toHaveBeenCalled()
      */

      expect(errorSpy).not.toHaveBeenCalled()
      expect(logSpy).toHaveBeenCalled()
    })

    it('should put a not-published disabled form into not-published, not published-but-disabled', async () => {
      const disabledForm = {
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'test.form.definition.disabled',
        pospVersion: '1.0',
        slug: 'disabled-form',
        isDisabled: true,
      } as FormDefinition

      const formDefinitionsModule =
        (await import('forms-shared/definitions/formDefinitions')) as {
          formDefinitions: FormDefinition[]
        }
      formDefinitionsModule.formDefinitions = [disabledForm]

      mockSlovenskoSkApi.apiEformStatusGet.mockResolvedValue({
        data: { status: 'Nepublikovaný' },
      })

      const result = await service.validateFormRegistrations()

      expect(result['not-published']).toHaveLength(1)
      expect(result['published-but-disabled']).toHaveLength(0)
    })
  })
})
