import { Test, TestingModule } from '@nestjs/testing'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { MagproxyService } from '../magproxy.service'
import ClientsService from '../../clients/clients.service'
import { createMock } from '@golevelup/ts-jest'
import { mockRfoResponseListOneItems } from '../../rfo-by-birthnumber/dtos/__test__/rfoResponse.test'
import { ResponseRfoPersonDto } from 'openapi-clients/magproxy'

describe('MagproxyService', () => {
  let service: MagproxyService

  beforeAll(() => {
    process.env = {
      ...process.env,
      MAGPROXY_URL: 'https://mock-new-magproxy.bratislava.sk',
      MAGPROXY_AZURE_AD_URL:
        'https://mock-login.microsoftonline.com/mock-azure-ad-id/oauth2/v2.0/token',
      MAGPROXY_AZURE_CLIENT_ID: 'mock-magproxy-azure-client-id',
      MAGPROXY_AZURE_CLIENT_SECRET: 'mock-magproxy-azure-secret',
      MAGPROXY_AZURE_SCOPE: 'api://mock-azure-scope/.default',
    }
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MagproxyService,
        ThrowerErrorGuard,
        { provide: ClientsService, useValue: createMock<ClientsService>() },
      ],
    }).compile()

    service = module.get<MagproxyService>(MagproxyService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateRfoDataFormat', () => {
    it('should return result for valid RFO data', () => {
      const errorLogSpy = jest.spyOn(service['logger'], 'error').mockImplementation(() => {})
      const response = service['validateRfoDataFormat'](
        mockRfoResponseListOneItems as unknown as ResponseRfoPersonDto[]
      )

      expect(errorLogSpy).not.toHaveBeenCalled()
      expect(response).toEqual(mockRfoResponseListOneItems as unknown as ResponseRfoPersonDto[])
    })

    it('should log error for invalid RFO data, however still return', () => {
      const errorLogSpy = jest.spyOn(service['logger'], 'error').mockImplementation(() => {})
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockRfoResponseListOneItemsInvalid = mockRfoResponseListOneItems as any
      mockRfoResponseListOneItemsInvalid[0].rodnePriezviskaOsoby[0].meno = 1222 // Invalid data - name as number
      const response = service['validateRfoDataFormat'](
        mockRfoResponseListOneItemsInvalid as unknown as ResponseRfoPersonDto[]
      )

      expect(errorLogSpy).toHaveBeenCalled()
      expect(response).toEqual(mockRfoResponseListOneItemsInvalid)
    })

    it('should throw error if the data is not an array', () => {
      const errorLogSpy = jest.spyOn(service['logger'], 'error').mockImplementation(() => {})
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service['validateRfoDataFormat']({} as any)
      }).toThrow()

      expect(errorLogSpy).toHaveBeenCalled()
    })
  })
})
