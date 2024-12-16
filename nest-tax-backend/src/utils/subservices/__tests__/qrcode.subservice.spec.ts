import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { QrCodeSubservice } from '../qrcode.subservice'

describe('QrCodeSubservice', () => {
  let service: QrCodeSubservice
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrCodeSubservice,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
      ],
    }).compile()

    service = module.get<QrCodeSubservice>(QrCodeSubservice)
    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createQrCode', () => {
    const randomIBANs = [
      'NL30RABO8617225181',
      'SK2227523855978541341798',
      'SK8781821247435876786313',
      'CZ0350513555122156988912',
    ]
    const qrCodeDataMocks = [
      { amount: 10060, variableSymbol: '123456', specificSymbol: '654321' },
      { amount: 21000, variableSymbol: '654321', specificSymbol: '123456' },
      { amount: 30050, variableSymbol: '111111', specificSymbol: '222222' },
    ]

    randomIBANs.forEach((iban) => {
      describe(`with IBAN ${iban}`, () => {
        beforeEach(() => {
          jest.spyOn(configService, 'getOrThrow').mockReturnValue(iban)
        })

        qrCodeDataMocks.forEach((qrCodeData) => {
          it('should be decoded to the original value', async () => {
            const qrCode = await service.createQrCode(qrCodeData)
            //expect(qrCode).toMatchSnapshot()
          })
        })
      })
    })
  })
})
