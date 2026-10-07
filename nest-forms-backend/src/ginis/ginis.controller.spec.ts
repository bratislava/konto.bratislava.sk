import { GinisError } from '@bratislava/ginis-sdk'
import { ErrorEnum, ErrorFactoryService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError, AxiosResponse } from 'axios'

import { createMockGinisDocumentData } from '../__tests__/factories/ginisDocument.factory'
import { expectObjectContaining } from '../__tests__/matchers'
import ClientsService from '../clients/clients.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import { FormAccessService } from '../forms-v2/services/form-access.service'
import alertReporting from '../utils/constants/error.alerts'
import GinisController from './ginis.controller'
import GinisHelper from './subservices/ginis.helper'
import GinisAPIService from './subservices/ginis-api.service'

vi.mock('./subservices/ginis-api.service')
vi.mock('../forms/forms.service')

describe('GinisController', () => {
  let controller: GinisController
  const errorFactory = new ErrorFactoryService({ alertReporting })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GinisController],
      providers: [
        { provide: ErrorFactoryService, useValue: errorFactory },
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
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getGinisDocumentByFormId (GET :formId)', () => {
    it('should throw error if form not found', async () => {
      controller['formsService'].getUniqueForm = vi.fn().mockResolvedValue(null)
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow(
        errorFactory.NotFoundException({
          errorEnum: FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
          message: FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
        }),
      )
    })

    it('should throw error if getting form does', async () => {
      const getFormError = new Error('Error')
      controller['formsService'].getUniqueForm = vi
        .fn()
        .mockRejectedValue(getFormError)
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow(
        getFormError,
      )
    })

    it('should throw error if the form has no ginis ID', async () => {
      const formId = '123'
      controller['formsService'].getUniqueForm = vi.fn().mockResolvedValue({})
      await expect(controller.getGinisDocumentByFormId(formId)).rejects.toThrow(
        errorFactory.NotFoundException({
          errorEnum: ErrorEnum.NOT_FOUND_ERROR,
          message: `Form with id ${formId} does not have a ginisDocumentId`,
        }),
      )
    })

    it('should throw error if there is some error in the ginis api', async () => {
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
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow(
        errorFactory.fromAxiosError(axiosError, {
          statusOverrides: {
            [HttpStatus.NOT_FOUND]: {
              status: HttpStatus.NOT_FOUND,
              errorEnum: ErrorEnum.NOT_FOUND_ERROR,
              message:
                'Document or document owner not found in GINIS - document id, if available: unavailable - document not found or invalid',
            },
          },
        }),
      )

      // GinisError without an underlying AxiosError -> generic internal server error
      controller['ginisAPIService'].getDocumentDetail = vi
        .fn()
        .mockResolvedValue(createMockGinisDocumentData())
      const ownerGinisError = new GinisError('Error')
      controller['ginisAPIService'].getOwnerDetail = vi
        .fn()
        .mockRejectedValue(ownerGinisError)
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow(
        errorFactory.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: 'Error while getting document or owner from GINIS:',
          error: ownerGinisError,
        }),
      )

      // Unexpected (non-Ginis) error, here a missing owner response -> generic internal server error
      controller['ginisAPIService'].getOwnerDetail = vi.fn()
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow(
        expectObjectContaining<{ response: object; status: number }>({
          response: expectObjectContaining({
            errorName: ErrorEnum.INTERNAL_SERVER_ERROR,
            message: 'Error while getting document or owner from GINIS:',
          }),
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      )
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

      const result = await controller.getGinisDocumentByFormId('123')
      expect(result.ownerName).toBe('Jill Mary Black-Smith')
    })
  })
})
