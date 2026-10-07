import {
  ErrorEnum,
  ErrorFactoryService,
  ErrorResponseEnum,
  LineLoggerService,
} from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'
import {
  UpvsCorporateBody,
  UpvsNaturalPerson,
} from 'openapi-clients/slovensko-sk'

import ClientsService from '../../../clients/clients.service'
import alertReporting from '../../../utils/constants/error.alerts'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../../nases.errors.enum'
import {
  isUpvsCorporateBody,
  isUpvsNaturalPerson,
} from '../../utils/nases.identity.utils'
import NasesContactsService from '../nases.contacts.service'

describe('NasesContactsService', () => {
  let service: NasesContactsService
  let logger: LineLoggerService
  const errorFactory = new ErrorFactoryService({ alertReporting })
  const icoNotFoundError = errorFactory.UnprocessableEntityException({
    errorEnum: NasesErrorsEnum.IDENTITY_SEARCH_DATA_INCONSISTENT,
    message: `extractCorporateBodyData: ${NasesErrorsResponseEnum.IDENTITY_SEARCH_DATA_INCONSISTENT}: ICO not found in contact returned by nases.`,
  })

  beforeEach(async () => {
    vi.resetAllMocks()
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LineLoggerService,
          useValue: createMock<LineLoggerService>(),
        },
        NasesContactsService,
        { provide: ErrorFactoryService, useValue: errorFactory },
        {
          provide: ClientsService,
          useValue: createMock<ClientsService>(),
        },
      ],
    }).compile()

    service = app.get<NasesContactsService>(NasesContactsService)
    logger = app.get(LineLoggerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('isUpvsNaturalPerson', () => {
    it('should return true when type is natural_person AND natural_person property exists', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        natural_person: {
          given_names: ['John'],
        },
      }

      expect(isUpvsNaturalPerson(contact)).toBe(true)
    })

    it('should return false when only type is natural_person but no natural_person property', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        uri: 'uri://test',
      }

      expect(isUpvsNaturalPerson(contact)).toBe(false)
    })

    it('should return false when only natural_person property exists but type is wrong', () => {
      const contact: UpvsNaturalPerson = {
        type: 'legal_entity',
        natural_person: {
          given_names: ['John'],
        },
      }

      expect(isUpvsNaturalPerson(contact)).toBe(false)
    })

    it('should return false for corporate body', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        corporate_body: {
          name: 'Test Company',
        },
      }

      expect(isUpvsNaturalPerson(contact)).toBe(false)
    })
  })

  describe('isUpvsCorporateBody', () => {
    it('should return true when type is legal_entity AND corporate_body property exists', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        corporate_body: {
          name: 'Test Company',
        },
      }

      expect(isUpvsCorporateBody(contact)).toBe(true)
    })

    it('should return false when only type is legal_entity but no corporate_body property', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
      }

      expect(isUpvsCorporateBody(contact)).toBe(false)
    })

    it('should return false when only corporate_body property exists but type is wrong', () => {
      const contact: UpvsCorporateBody = {
        type: 'natural_person',
        corporate_body: {
          name: 'Test Company',
        },
      }

      expect(isUpvsCorporateBody(contact)).toBe(false)
    })

    it('should return false for natural person', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        natural_person: {
          given_names: ['John'],
        },
      }

      expect(isUpvsCorporateBody(contact)).toBe(false)
    })
  })

  describe('extractNaturalPersonData', () => {
    it('should extract first names and last names from natural person', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        natural_person: {
          given_names: ['John', 'Michael'],
          family_names: [
            { value: 'Doe', primary: true },
            { value: 'Smith', primary: false },
          ],
        },
      }

      const result = service.extractNaturalPersonData(contact)

      expect(result.firstNames).toEqual(['John', 'Michael'])
      expect(result.lastNames).toEqual(['Doe', 'Smith'])
    })

    it('should sort family names by primary first', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        natural_person: {
          given_names: ['John'],
          family_names: [
            { value: 'Smith', primary: false },
            { value: 'Doe', primary: true },
            { value: 'Johnson', primary: false },
          ],
        },
      }

      const result = service.extractNaturalPersonData(contact)

      expect(result.lastNames).toEqual(['Doe', 'Smith', 'Johnson'])
    })

    it('should return empty arrays when natural_person is null', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        // API contract types this as optional-only, but be defensive against null too
        natural_person: null as unknown as UpvsNaturalPerson['natural_person'],
      }

      const result = service.extractNaturalPersonData(contact)

      expect(result.firstNames).toEqual([])
      expect(result.lastNames).toEqual([])
    })

    it('should return empty arrays when natural_person is undefined', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
      }

      const result = service.extractNaturalPersonData(contact)

      expect(result.firstNames).toEqual([])
      expect(result.lastNames).toEqual([])
    })

    it('should filter out undefined family name values', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        natural_person: {
          given_names: ['John'],
          family_names: [
            { value: 'Doe', primary: true },
            { value: undefined, primary: false },
            { value: 'Smith', primary: false },
          ],
        },
      }

      const result = service.extractNaturalPersonData(contact)

      expect(result.lastNames).toEqual(['Doe', 'Smith'])
    })
  })

  describe('extractCorporateBodyData', () => {
    it('should extract name and ico from corporate_body', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
          cin: '12345678',
        },
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBe('Test Company')
      expect(result.ico).toBe('12345678')
    })

    it('should extract ico from various_ids if not in corporate_body', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
        },
        various_ids: [
          {
            type: {
              id: '7',
              name: 'IČO (Identifikačné číslo organizácie)',
              description: undefined,
            },
            value: '87654321',
            specified: true,
          },
        ],
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBe('Test Company')
      expect(result.ico).toBe('87654321')
    })

    it('should extract ico from various_ids with short IČO name', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
        },
        various_ids: [
          {
            type: { name: 'IČO' },
            value: '11112222',
          },
        ],
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.ico).toBe('11112222')
    })

    it('should extract ico from various_ids with alternative name', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
        },
        various_ids: [
          {
            type: {
              name: 'Identifikačné číslo organizácie',
            },
            value: '11223344',
          },
        ],
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.ico).toBe('11223344')
    })

    it('should return empty object when corporate_body is null', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        // API contract types this as optional-only, but be defensive against null too
        corporate_body: null as unknown as UpvsCorporateBody['corporate_body'],
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBeUndefined()
      expect(result.ico).toBeUndefined()
    })

    it('should return empty object when corporate_body is undefined', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBeUndefined()
      expect(result.ico).toBeUndefined()
    })

    it('should prefer ico from corporate_body over various_ids', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
          cin: '12345678',
        },
        various_ids: [
          {
            type: { name: 'IČO' },
            value: '87654321',
          },
        ],
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.ico).toBe('12345678')
    })

    it('should log error when ico not found in corporate_body but found in various_ids', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
        },
        various_ids: [
          {
            type: { name: 'IČO' },
            value: '87654321',
          },
        ],
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBe('Test Company')
      expect(result.ico).toBe('87654321')
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(icoNotFoundError)
    })

    it('should log error when ico not found in corporate_body or various_ids', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
        },
        various_ids: [
          {
            type: { name: 'Other ID' },
            value: 'some-value',
          },
        ],
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBe('Test Company')
      expect(result.ico).toBeUndefined()
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(icoNotFoundError)
    })
  })

  describe('getUpvsIdentity', () => {
    it('should return identity if request succeeds', async () => {
      const mockIdentity = { uri: 'test-uri', type: 'natural_person' }
      service['clientsService'].slovenskoSkApi.apiUpvsIdentityGet = vi
        .fn()
        .mockResolvedValue({ data: mockIdentity })

      const result = await service.getUpvsIdentity('test-token')

      expect(result).toEqual(mockIdentity)
    })

    it('should return null if request fails', async () => {
      const requestError = new Error('Request failed')
      service['clientsService'].slovenskoSkApi.apiUpvsIdentityGet = vi
        .fn()
        .mockRejectedValue(requestError)

      const result = await service.getUpvsIdentity('test-token')

      expect(result).toBeNull()
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        errorFactory.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: ErrorResponseEnum.INTERNAL_SERVER_ERROR,
          console: `Failed to get nases identity`,
          error: requestError,
        }),
      )
    })
  })
})
