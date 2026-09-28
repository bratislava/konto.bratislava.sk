import { GinisError } from '@bratislava/ginis-sdk'
import { createMock } from '@golevelup/ts-vitest'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError, AxiosResponse } from 'axios'

import { createMockGinisDocumentData } from '../__tests__/factories/ginisDocument.factory'
import ClientsService from '../clients/clients.service'
import FormsService from '../forms/forms.service'
import { FormAccessService } from '../forms-v2/services/form-access.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import GinisController from './ginis.controller'
import GinisHelper from './subservices/ginis.helper'
import GinisAPIService from './subservices/ginis-api.service'

vi.mock('./subservices/ginis-api.service')
vi.mock('../forms/forms.service')

describe('GinisController', () => {
  let controller: GinisController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GinisController],
      providers: [
        ThrowerErrorGuard,
        GinisAPIService,
        GinisHelper,
        FormsService,
        { provide: ClientsService, useValue: createMock<ClientsService>() },
        {
          provide: FormAccessService,
          useValue: createMock<FormAccessService>(),
        },
      ],
    }).compile()
    controller = module.get<GinisController>(GinisController)

    Object.defineProperty(controller, 'logger', { value: { error: vi.fn() } })
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getGinisDocumentByFormId (GET :formId)', () => {
    it('should throw error if form not found', async () => {
      controller['formsService'].getUniqueForm = vi.fn().mockResolvedValue(null)
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow()
    })

    it('should throw error if getting form does', async () => {
      controller['formsService'].getUniqueForm = vi
        .fn()
        .mockRejectedValue(new Error('Error'))
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow()
    })

    it('should throw error if the form has no ginis ID', async () => {
      controller['formsService'].getUniqueForm = vi.fn().mockResolvedValue({})
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow()
    })

    it('should throw error if there is some error in the ginis api', async () => {
      const internalServerErrorSpy = vi.spyOn(
        controller['throwerErrorGuard'],
        'InternalServerErrorException',
      )

      // A real ginis 404 carries the underlying AxiosError with a populated
      // response, which fromAxiosError reads via error.response?.status.
      const axiosError = new AxiosError('Error')
      axiosError.response = createMock<AxiosResponse>({
        status: HttpStatus.NOT_FOUND,
      })
      const ginisError = new GinisError('Error', axiosError)

      controller['formsService'].getUniqueForm = vi
        .fn()
        .mockResolvedValue({ ginisDocumentId: 'id' })
      controller['ginisAPIService'].getDocumentDetail = vi
        .fn()
        .mockRejectedValue(ginisError)
      try {
        await controller.getGinisDocumentByFormId('123')
        expect(true).toBeFalsy()
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect((error as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND)
      }

      controller['ginisAPIService'].getDocumentDetail = vi.fn()
      controller['ginisAPIService'].getOwnerDetail = vi
        .fn()
        .mockRejectedValue(new GinisError('Error'))
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow()
      expect(internalServerErrorSpy).toHaveBeenCalled()

      controller['ginisAPIService'].getOwnerDetail = vi.fn()
      vi.doMock('../utils/ginis/ginis-api-helper', () => ({
        mapGinisHistory: vi.fn().mockImplementation(() => {
          throw new Error('Error')
        }),
      }))
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow()

      // If th
    })

    it('should return GinisDocumentDetailResponseDto', async () => {
      controller['formsService'].getUniqueForm = vi
        .fn()
        .mockResolvedValue({ ginisDocumentId: 'id' })
      controller['ginisAPIService'].getDocumentDetail = vi
        .fn()
        .mockResolvedValue(createMockGinisDocumentData())
      controller['ginisAPIService'].getOwnerDetail = vi.fn().mockResolvedValue({
        'Detail-referenta': {
          Jmeno: 'Jack',
          Prijmeni: 'Brown',
        },
      })
      vi.doMock('../utils/ginis/ginis-api-helper', () => ({
        mapGinisHistory: vi.fn(),
      }))

      const result = await controller.getGinisDocumentByFormId('123')
      expect(result.id).toBe('MAG0X05D1111')
      expect(result.ownerName).toBe('Jack Brown')
      expect(result.ownerEmail).toBe('')
    })

    it('should sanitize ginis owner name', async () => {
      controller['formsService'].getUniqueForm = vi
        .fn()
        .mockResolvedValue({ ginisDocumentId: 'id' })
      controller['ginisAPIService'].getDocumentDetail = vi
        .fn()
        .mockResolvedValue(createMockGinisDocumentData())
      controller['ginisAPIService'].getOwnerDetail = vi.fn().mockResolvedValue({
        'Detail-referenta': {
          Jmeno: 'Jill Mary-47',
          Prijmeni: '42-Black-Smith',
        },
      })
      vi.doMock('../utils/ginis/ginis-api-helper', () => ({
        mapGinisHistory: vi.fn(),
      }))

      const result = await controller.getGinisDocumentByFormId('123')
      expect(result.ownerName).toBe('Jill Mary Black-Smith')
    })
  })
})
