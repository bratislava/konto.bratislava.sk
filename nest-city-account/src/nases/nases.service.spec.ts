import { createMock } from '@golevelup/ts-jest'
import { HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError } from 'axios'

import prismaMock from '../../test/singleton'
import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
import ClientsService from '../clients/clients.service'
import { PrismaService } from '../prisma/prisma.service'
import { VerificationErrorsEnum } from '../user-verification/verification.errors.enum'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { NasesService } from './nases.service'

describe('NasesService', () => {
  let service: NasesService
  let throwerErrorGuard: ThrowerErrorGuard
  let clientsService: ClientsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NasesService,
        ThrowerErrorGuard,
        { provide: ClientsService, useValue: createMock<ClientsService>() },
        { provide: ApiJwtTokensService, useValue: createMock<ApiJwtTokensService>() },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<NasesService>(NasesService)
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)
    clientsService = module.get<ClientsService>(ClientsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getIdentitiesByUris', () => {
    it('should successfully match direct URI results', async () => {
      const inputs = [
        { uri: 'rc://sk/1234567890_doe_john', physicalEntityId: 'entity-1' },
        { uri: 'rc://sk/9876543210_smith_jane', physicalEntityId: 'entity-2' },
      ]

      jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: 'rc://sk/1234567890_doe_john',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '123' },
        },
        {
          uri: 'rc://sk/9876543210_smith_jane',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '456' },
        },
      ] as any)

      const result = await service.getIdentitiesByUris(inputs)

      expect(result.success).toHaveLength(2)
      expect(result.failed).toHaveLength(0)
      expect(result.success[0]).toEqual({
        inputUri: 'rc://sk/1234567890_doe_john',
        data: expect.objectContaining({ uri: 'rc://sk/1234567890_doe_john' }),
        physicalEntityId: 'entity-1',
      })
      expect(result.success[1]).toEqual({
        inputUri: 'rc://sk/9876543210_smith_jane',
        data: expect.objectContaining({ uri: 'rc://sk/9876543210_smith_jane' }),
        physicalEntityId: 'entity-2',
      })
    })

    it('should handle possible URI change when exactly one unmatched result and one unmatched input', async () => {
      const inputs = [{ uri: 'rc://sk/1234567890_doe_john', physicalEntityId: 'entity-1' }]

      // API returns different URI (e.g., surname changed)
      jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: 'rc://sk/1234567890_smith_john',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '123' },
        },
      ] as any)

      const result = await service.getIdentitiesByUris(inputs)

      expect(result.success).toHaveLength(1)
      expect(result.failed).toHaveLength(0)
      expect(result.success[0]).toEqual({
        inputUri: 'rc://sk/1234567890_doe_john',
        data: expect.objectContaining({ uri: 'rc://sk/1234567890_smith_john' }),
        physicalEntityId: 'entity-1',
      })
    })

    it('should mark as possibleUriChange when multiple unmatched results and inputs', async () => {
      const inputs = [
        { uri: 'rc://sk/1234567890_doe_john', physicalEntityId: 'entity-1' },
        { uri: 'rc://sk/9876543210_smith_jane', physicalEntityId: 'entity-2' },
      ]

      // API returns different URIs that we can't safely match
      jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: 'rc://sk/1234567890_jones_john',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '123' },
        },
        {
          uri: 'rc://sk/9876543210_brown_jane',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '456' },
        },
      ] as any)

      const result = await service.getIdentitiesByUris(inputs)

      expect(result.success).toHaveLength(0)
      expect(result.failed).toHaveLength(2)
      expect(result.failed).toEqual(
        expect.arrayContaining([
          {
            physicalEntityId: 'entity-1',
            inputUri: 'rc://sk/1234567890_doe_john',
            possibleUriChange: true,
          },
          {
            physicalEntityId: 'entity-2',
            inputUri: 'rc://sk/9876543210_smith_jane',
            possibleUriChange: true,
          },
        ])
      )
    })

    it('should handle regular failures when no URI is returned', async () => {
      const inputs = [{ uri: 'rc://sk/invalid_uri', physicalEntityId: 'entity-1' }]

      jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: null,
          status: 'not_found',
        },
      ] as any)

      const result = await service.getIdentitiesByUris(inputs)

      expect(result.success).toHaveLength(0)
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0]).toEqual({
        physicalEntityId: 'entity-1',
        inputUri: 'rc://sk/invalid_uri',
        possibleUriChange: false,
      })
    })

    it('should handle mixed success and possible URI changes', async () => {
      const inputs = [
        { uri: 'rc://sk/1111111111_match_direct' },
        { uri: 'rc://sk/2222222222_nomatch_old', physicalEntityId: 'entity-2' },
      ]

      jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: 'rc://sk/1111111111_match_direct',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '111' },
        },
        {
          uri: 'rc://sk/2222222222_nomatch_new',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '222' },
        },
      ] as any)

      const result = await service.getIdentitiesByUris(inputs)

      // When there's exactly 1 unmatched result and 1 unmatched input, they get matched
      expect(result.success).toHaveLength(2)
      expect(result.failed).toHaveLength(0)
      expect(result.success[0].inputUri).toBe('rc://sk/1111111111_match_direct')
      expect(result.success[1].inputUri).toBe('rc://sk/2222222222_nomatch_old')
      expect(result.success[1].data.uri).toBe('rc://sk/2222222222_nomatch_new')
    })

    it('should throw error for invalid input size', async () => {
      const throwerSpy = jest.spyOn(throwerErrorGuard, 'BadRequestException')

      await expect(service.getIdentitiesByUris([])).rejects.toThrow()
      expect(throwerSpy).toHaveBeenCalled()

      const tooManyInputs = Array.from({ length: 11 }, (_, i) => ({ uri: `uri-${i}` }))
      await expect(service.getIdentitiesByUris(tooManyInputs)).rejects.toThrow()
    })

    it('should deduplicate inputs by URI', async () => {
      const inputs = [
        { uri: 'rc://sk/same_uri', physicalEntityId: 'entity-1' },
        { uri: 'rc://sk/same_uri', physicalEntityId: 'entity-2' },
      ]

      const searchSpy = jest.spyOn(service as any, 'searchUpvsIdentitiesByUri').mockResolvedValue([
        {
          uri: 'rc://sk/same_uri',
          status: 'activated',
          upvs: { edesk_status: 'active', edesk_number: '123' },
        },
      ] as any)

      await service.getIdentitiesByUris(inputs)

      // Should only search for unique URI once
      expect(searchSpy).toHaveBeenCalledWith(['rc://sk/same_uri'])
    })

    it('should throw error if UPVS server is down', async () => {
      const inputs = [
        { uri: 'rc://sk/same_uri', physicalEntityId: 'entity-1' },
        { uri: 'rc://sk/same_uri', physicalEntityId: 'entity-2' },
      ]

      const searchSpy = jest
        .spyOn(service as any, 'searchUpvsIdentitiesByUri')
        .mockRejectedValue(new Error('UPVS server is down'))

      await expect(service.getIdentitiesByUris(inputs)).rejects.toThrow()
      expect(searchSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('lookupIdentityFO', () => {
    const apiIamIdentitiesLookupGetSpy = () =>
      jest.spyOn(clientsService.slovenskoSkApi, 'apiIamIdentitiesLookupGet')

    const axiosErrorWithStatus = (status: number, data: object = {}, headers: object = {}) =>
      new AxiosError('Request failed', String(status), undefined, undefined, {
        status,
        statusText: '',
        headers,
        config: {},
        data,
      } as never)

    const thrownBy = async (): Promise<unknown> =>
      service.lookupIdentityFO('1234567890', 'John', 'Doe', 'entity-1').catch((e: unknown) => e)

    // One table for the whole error mapping documented on lookupIdentityFO.
    // Notes per row:
    // - 429 must keep its status: the urgent queue detects throttling by it.
    // - the 400 bodies mirror render_bad_request in slovensko-digital/slovensko-sk-api;
    //   a `fault` is attached exactly when the error came from UPVS IAM.
    // - a no-fault 400 means our own request building failed container validation -
    //   an internal bug, hence the alerting 500.
    it.each([
      {
        upstreamCase: '429 (rate limit)',
        rejection: axiosErrorWithStatus(429),
        status: HttpStatus.TOO_MANY_REQUESTS,
        errorName: ErrorsEnum.TOO_MANY_REQUESTS_ERROR,
      },
      {
        upstreamCase: '400 with fault (UPVS IAM rejection)',
        rejection: axiosErrorWithStatus(400, {
          message: 'Invalid query',
          fault: { code: '00074421', reason: 'Nastala chyba: IDENTITY_ID_FAULT' },
        }),
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errorName: VerificationErrorsEnum.IDENTITY_LOOKUP_REJECTED,
      },
      {
        upstreamCase: '400 without fault (parameter validation)',
        rejection: axiosErrorWithStatus(400, { message: 'Invalid query' }),
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorName: ErrorsEnum.INTERNAL_SERVER_ERROR,
      },
      {
        upstreamCase: '503 with Retry-After',
        rejection: axiosErrorWithStatus(503, {}, { 'retry-after': '60' }),
        status: HttpStatus.SERVICE_UNAVAILABLE,
        errorName: ErrorsEnum.SERVICE_UNAVAILABLE_ERROR,
      },
      {
        upstreamCase: '503 without Retry-After',
        rejection: axiosErrorWithStatus(503),
        status: HttpStatus.BAD_GATEWAY,
        errorName: ErrorsEnum.BAD_GATEWAY_ERROR,
      },
      {
        upstreamCase: '401 (broken credentials)',
        rejection: axiosErrorWithStatus(401),
        status: HttpStatus.BAD_GATEWAY,
        errorName: ErrorsEnum.BAD_GATEWAY_AUTH_ERROR,
      },
      {
        upstreamCase: 'network error with no response',
        rejection: new AxiosError('Network Error'),
        status: HttpStatus.BAD_GATEWAY,
        errorName: ErrorsEnum.BAD_GATEWAY_ERROR,
      },
      {
        upstreamCase: 'non-axios error',
        rejection: new Error('boom'),
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorName: ErrorsEnum.INTERNAL_SERVER_ERROR,
      },
    ])('maps $upstreamCase to $status $errorName', async ({ rejection, status, errorName }) => {
      apiIamIdentitiesLookupGetSpy().mockRejectedValue(rejection)

      const error = await thrownBy()

      expect(error).toBeInstanceOf(HttpException)
      expect((error as HttpException).getStatus()).toBe(status)
      expect((error as HttpException).getResponse()).toMatchObject({ errorName })
    })

    // Rejections are persisted right here in the service - the row's existence
    // excludes the entity from further urgent lookups.
    it('persists the rejection with its fault when UPVS IAM rejects the lookup', async () => {
      apiIamIdentitiesLookupGetSpy().mockRejectedValue(
        axiosErrorWithStatus(400, {
          message: 'Invalid query',
          fault: { code: '00074421', reason: 'Nastala chyba: IDENTITY_ID_FAULT' },
        })
      )

      await thrownBy()

      expect(prismaMock.identityLookupRejection.upsert).toHaveBeenCalledWith({
        where: { physicalEntityId: 'entity-1' },
        create: {
          physicalEntityId: 'entity-1',
          faultCode: '00074421',
          faultReason: 'Nastala chyba: IDENTITY_ID_FAULT',
        },
        update: {
          faultCode: '00074421',
          faultReason: 'Nastala chyba: IDENTITY_ID_FAULT',
        },
      })
    })

    it('does not persist a rejection for non-fault failures', async () => {
      apiIamIdentitiesLookupGetSpy().mockRejectedValue(
        axiosErrorWithStatus(400, { message: 'Invalid query' })
      )

      await thrownBy()

      expect(prismaMock.identityLookupRejection.upsert).not.toHaveBeenCalled()
    })
  })
})
