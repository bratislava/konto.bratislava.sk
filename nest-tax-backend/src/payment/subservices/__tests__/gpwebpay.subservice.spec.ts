import crypto, { Sign, Verify } from 'node:crypto'

import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import BaConfigService from '../../../config/ba-config.service'
import { TaxType } from '../../../generated/prisma/client'
import {
  CreateOrderData,
  PaymentResponseQueryToVerifyDto,
} from '../../dtos/gpwebpay.dto'
import { GpWebpaySubservice } from '../gpwebpay.subservice'

describe('GpWebpaySubservice', () => {
  let service: GpWebpaySubservice

  const mockBaConfigService = {
    paygate: {
      [TaxType.DZN]: {
        key: 'mock-key',
        signCert: 'mock-cert',
        merchantNumber: 'mock-merchant-number',
        passphrase: 'mock-passphrase',
      },
      [TaxType.KO]: {
        key: 'mock-key-ko',
        signCert: 'mock-cert-ko',
        merchantNumber: 'mock-merchant-number-ko',
        passphrase: 'mock-passphrase-ko',
      },
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpWebpaySubservice,
        {
          provide: BaConfigService,
          useValue: mockBaConfigService,
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

      const result = service['getDataToSign'](mockData)
      expect(result).toBe(
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

      const result = service['getDataToSign'](mockData)
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
      jest.spyOn(crypto, 'createSign').mockReturnValue(
        createMock<Sign>({
          sign: jest.fn().mockReturnValue('mock-signature'),
        }),
      )

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
      jest
        .spyOn(crypto, 'createVerify')
        .mockReturnValue(
          createMock<Verify>({ verify: jest.fn().mockReturnValue(true) }),
        )

      const result = service.verifyData(TaxType.DZN, 'test-data', 'test-digest')
      expect(result).toBe(true)
    })
  })
})
