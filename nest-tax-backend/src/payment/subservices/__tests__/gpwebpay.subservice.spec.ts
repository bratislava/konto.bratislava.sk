import crypto from 'node:crypto'

import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { TaxType } from '@prisma/client'

import {
  CreateOrderData,
  PaymentResponseQueryToVerifyDto,
} from '../../dtos/gpwebpay.dto'
import { GpWebpaySubservice } from '../gpwebpay.subservice'

describe('GpWebpaySubservice', () => {
  let service: GpWebpaySubservice

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      switch (key) {
        case 'PAYGATE_SIGN_CERT':
          return 'mock-cert'

        case 'PAYGATE_KEY':
          return 'mock-key'

        case 'PAYGATE_MERCHANT_NUMBER':
          return 'mock-merchant-number'

        case 'PAYGATE_PASSPHRASE':
          return 'mock-passphrase'

        default:
          throw new Error('Invalid key')
      }
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpWebpaySubservice,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<GpWebpaySubservice>(GpWebpaySubservice)
  })

  describe('getDataToSign', () => {
    it('should correctly join valid data fields with pipes', () => {
      const mockData: CreateOrderData = {
        MERCHANTNUMBER: '123',
        OPERATION: 'CREATE',
        ORDERNUMBER: '456',
        AMOUNT: '100',
        CURRENCY: 'EUR',
        DEPOSITFLAG: '1',
        URL: 'http://example.com',
        DESCRIPTION: 'Test order',
        EMAIL: 'test@example.com',
        PAYMETHODS: 'CARD',
      }

      const result = (service as any).getDataToSign(mockData)
      expect(result).toBe(
        // eslint-disable-next-line no-secrets/no-secrets
        '123|CREATE|456|100|EUR|1|http://example.com|Test order|test@example.com|CARD',
      )
    })

    it('should skip undefined or null values, and be in correct order', () => {
      const mockData: CreateOrderData = {
        AMOUNT: '100',
        MERCHANTNUMBER: '123',
        OPERATION: 'CREATE',
        ORDERNUMBER: '456',
        DEPOSITFLAG: '1',
        URL: 'http://example.com',
        CURRENCY: 'EUR',
      }

      const result = (service as any).getDataToSign(mockData)
      // eslint-disable-next-line no-secrets/no-secrets
      expect(result).toBe('123|CREATE|456|100|EUR|1|http://example.com')
    })
  })

  describe('getDataToVerify', () => {
    it('should correctly join verification data fields with pipes', () => {
      const mockData: PaymentResponseQueryToVerifyDto = {
        OPERATION: 'CREATE',
        ORDERNUMBER: '456',
        PRCODE: '0',
        SRCODE: '0',
        RESULTTEXT: 'OK',
      }

      const result = service.getDataToVerify(mockData)
      expect(result).toBe('CREATE|456|0|0|OK')
    })
  })

  describe('getSignedData', () => {
    it('should return signed data with digest', () => {
      jest.spyOn(crypto, 'createSign').mockReturnValue({
        write: jest.fn(),
        end: jest.fn(),
        sign: jest.fn().mockReturnValue('mock-signature'),
      } as any)

      const mockData: CreateOrderData = {
        MERCHANTNUMBER: '123',
        OPERATION: 'CREATE',
        ORDERNUMBER: '456',
        AMOUNT: '100',
        CURRENCY: 'EUR',
        DEPOSITFLAG: '1',
        URL: 'http://example.com',
      }

      const result = service.getSignedData(TaxType.DZN, mockData)
      expect(result).toEqual({
        ...mockData,
        DIGEST: 'mock-signature',
      })
    })
  })

  describe('verifyData', () => {
    it('should verify data with digest', () => {
      jest.spyOn(crypto, 'createVerify').mockReturnValue({
        write: jest.fn(),
        end: jest.fn(),
        verify: jest.fn().mockReturnValue(true),
      } as any)

      const result = service.verifyData(TaxType.DZN, 'test-data', 'test-digest')
      expect(result).toBe(true)
    })
  })
})
