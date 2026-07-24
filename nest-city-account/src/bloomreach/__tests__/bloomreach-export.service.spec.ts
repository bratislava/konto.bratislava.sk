import { Test, TestingModule } from '@nestjs/testing'
import axios from 'axios'

import BaConfigService from '../../config/ba-config.service'
import { BloomreachExportService } from '../bloomreach-export.service'

jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  post: jest.fn(),
}))
const mockedAxios = axios as jest.Mocked<typeof axios>

/**
 * Build a plain object that satisfies axios's `isAxiosError` predicate
 * (it only checks for `error.isAxiosError === true`). Avoids depending on
 * the real AxiosError class, which auto-mocking would replace.
 */
const makeAxiosError = (status: number): Error => {
  const error = new Error(`Request failed with status code ${status}`) as Error & {
    isAxiosError: boolean
    response?: { status: number }
  }
  error.isAxiosError = true
  error.response = { status }
  return error
}

describe('BloomreachExportService', () => {
  let service: BloomreachExportService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloomreachExportService,
        {
          provide: BaConfigService,
          useValue: {
            bloomreach: {
              apiUrl: 'https://api.bloomreach.test',
              projectToken: 'test-project',
              apiKey: 'key',
              apiSecret: 'secret',
            },
          },
        },
      ],
    }).compile()

    service = module.get<BloomreachExportService>(BloomreachExportService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchCustomer', () => {
    it('should return null when the response is not successful', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: false } })

      expect(await service.fetchCustomer({ contact_id: 'contact-1' })).toBeNull()
    })

    it('should return null on 404', async () => {
      mockedAxios.post.mockRejectedValue(makeAxiosError(404))

      expect(await service.fetchCustomer({ contact_id: 'contact-1' })).toBeNull()
    })

    it('should rethrow other errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Request failed with status code 500'))

      await expect(service.fetchCustomer({ contact_id: 'contact-1' })).rejects.toThrow('500')
    })
  })

  describe('fetchConsentEvents', () => {
    it('should return empty array when the response is not successful', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: false } })

      expect(await service.fetchConsentEvents({ city_account_id: 'cognito-1' })).toEqual([])
    })

    it('should return empty array on 404', async () => {
      mockedAxios.post.mockRejectedValue(makeAxiosError(404))

      expect(await service.fetchConsentEvents({ city_account_id: 'cognito-1' })).toEqual([])
    })

    it('should rethrow other errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Request failed with status code 500'))

      await expect(service.fetchConsentEvents({ city_account_id: 'cognito-1' })).rejects.toThrow(
        '500'
      )
    })
  })
})
