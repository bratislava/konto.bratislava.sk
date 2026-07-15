import { Test, TestingModule } from '@nestjs/testing'
import axios from 'axios'

import { BloomreachExportService } from '../bloomreach-export.service'

jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  post: jest.fn(),
}))
const mockedAxios = axios as jest.Mocked<typeof axios>

const axiosNotFoundError = () => {
  const error = new axios.AxiosError('Request failed with status code 404')
  error.response = { status: 404 } as never
  return error
}

describe('BloomreachExportService', () => {
  let service: BloomreachExportService

  beforeEach(async () => {
    process.env.BLOOMREACH_API_URL = 'https://api.bloomreach.test'
    process.env.BLOOMREACH_PROJECT_TOKEN = 'test-project'
    process.env.BLOOMREACH_API_KEY = 'key'
    process.env.BLOOMREACH_API_SECRET = 'secret'

    const module: TestingModule = await Test.createTestingModule({
      providers: [BloomreachExportService],
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
      mockedAxios.post.mockRejectedValue(axiosNotFoundError())

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
      mockedAxios.post.mockRejectedValue(axiosNotFoundError())

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
