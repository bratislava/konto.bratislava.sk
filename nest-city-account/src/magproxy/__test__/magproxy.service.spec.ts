import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { ResponseRfoPersonDto } from 'openapi-clients/magproxy'

import ClientsService from '../../clients/clients.service'
import BaConfigService from '../../config/ba-config.service'
import { mockRfoResponseListOneItems } from '../../rfo-by-birthnumber/dtos/__test__/rfoResponse.mock'
import alertReporting from '../../utils/constants/error.alerts'
import { MagproxyErrorsEnum, MagproxyErrorsResponseEnum } from '../magproxy.errors.enum'
import { MagproxyService } from '../magproxy.service'

describe('MagproxyService', () => {
  let service: MagproxyService
  let errorFactoryService: ErrorFactoryService
  let logger: LineLoggerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LineLoggerService, useValue: createMock<LineLoggerService>() },
        MagproxyService,
        { provide: ErrorFactoryService, useValue: new ErrorFactoryService({ alertReporting }) },
        { provide: ClientsService, useValue: createMock<ClientsService>() },
        {
          provide: BaConfigService,
          useValue: {
            magproxy: {
              url: 'https://mock-new-magproxy.bratislava.sk',
              azureAdUrl:
                'https://mock-login.microsoftonline.com/mock-azure-ad-id/oauth2/v2.0/token',
              azureClientId: 'mock-magproxy-azure-client-id',
              azureClientSecret: 'mock-magproxy-azure-secret',
              azureScope: 'api://mock-azure-scope/.default',
            },
          },
        },
      ],
    }).compile()

    service = module.get<MagproxyService>(MagproxyService)
    errorFactoryService = module.get(ErrorFactoryService)
    logger = module.get(LineLoggerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateRfoDataFormat', () => {
    it('should return result for valid RFO data', () => {
      const response = service['validateRfoDataFormat'](
        mockRfoResponseListOneItems as unknown as ResponseRfoPersonDto[]
      )

      expect(vi.mocked(logger.error)).not.toHaveBeenCalled()
      expect(response).toEqual(mockRfoResponseListOneItems as unknown as ResponseRfoPersonDto[])
    })

    it('should log error for invalid RFO data, however still return', () => {
      const mockRfoResponseListOneItemsInvalid = mockRfoResponseListOneItems
      mockRfoResponseListOneItemsInvalid[0].rodnePriezviskaOsoby[0].meno = 1222 as unknown as string // Invalid data - name as number
      const response = service['validateRfoDataFormat'](
        mockRfoResponseListOneItemsInvalid as unknown as ResponseRfoPersonDto[]
      )

      expect(vi.mocked(logger.error)).toHaveBeenCalled()
      expect(response).toEqual(mockRfoResponseListOneItemsInvalid)
    })

    it('should throw error if the data is not an array', () => {
      expect(() => {
        service['validateRfoDataFormat']({} as unknown as ResponseRfoPersonDto[])
      }).toThrow(
        errorFactoryService.UnprocessableEntityException({
          errorEnum: MagproxyErrorsEnum.RFO_DATA_ARRAY_EXPECTED,
          message: MagproxyErrorsResponseEnum.RFO_DATA_ARRAY_EXPECTED,
        })
      )

      expect(vi.mocked(logger.error)).toHaveBeenCalled()
    })
  })
})
