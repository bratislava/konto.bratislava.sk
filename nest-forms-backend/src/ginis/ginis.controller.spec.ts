/* eslint-disable @typescript-eslint/dot-notation */
import { Test, TestingModule } from '@nestjs/testing'
import { Forms } from '@prisma/client'
import { AxiosError } from 'axios'

import { mockGinisDocumentData } from '../__tests__/ginisContants'
import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import FormsService from '../forms/forms.service'
import { ResponseGdprDataDto } from '../nases/dtos/responses.dto'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import GinisController from './ginis.controller'
import GinisAPIService from './subservices/ginis-api.service'

jest.mock('./subservices/ginis-api.service')
jest.mock('../forms/forms.service')

describe('GinisController', () => {
  let controller: GinisController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GinisController],
      providers: [ThrowerErrorGuard, GinisAPIService, FormsService],
    }).compile()
    controller = module.get<GinisController>(GinisController)

    Object.defineProperty(controller, 'logger', { value: { error: jest.fn() } })
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  // eslint-disable-next-line no-secrets/no-secrets
  describe('getGinisDocumentByFormId (GET :formId)', () => {
    it('should call getForm with null if no user is provided', async () => {
      const spy = jest
        .spyOn(controller['formsService'], 'getFormWithAccessCheck')
        .mockResolvedValue({} as Forms)

      try {
        // because it will fail after this function
        await controller.getGinisDocumentByFormId('123', {
          sub: 'sub',
        } as CognitoGetUserData)
      } catch (error) {
        expect(spy).toHaveBeenLastCalledWith('123', 'sub', null)
      }

      try {
        await controller.getGinisDocumentByFormId('123', undefined, {
          ico: 'ico1',
        } as ResponseGdprDataDto)
      } catch (error) {
        expect(spy).toHaveBeenLastCalledWith('123', null, 'ico1')
      }
    })

    it('should throw error if getting form does', async () => {
      controller['formsService'].getFormWithAccessCheck = jest
        .fn()
        .mockRejectedValue(new Error('Error'))
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow()
    })

    it('should throw error if the form has no ginis ID', async () => {
      controller['formsService'].getFormWithAccessCheck = jest
        .fn()
        .mockResolvedValue({} as Forms)
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow()
    })

    it('should throw error if there is some error in the ginis api', async () => {
      const notFoundSpy = jest.spyOn(
        controller['throwerErrorGuard'],
        'NotFoundException',
      )
      const internalServerErrorSpy = jest.spyOn(
        controller['throwerErrorGuard'],
        'InternalServerErrorException',
      )

      const axiosError = new AxiosError('Error')
      axiosError.status = 404

      controller['formsService'].getFormWithAccessCheck = jest
        .fn()
        .mockResolvedValue({ ginisDocumentId: 'id' } as Forms)
      controller['ginisAPIService'].getDocumentDetail = jest
        .fn()
        .mockRejectedValue(axiosError)
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow()
      expect(notFoundSpy).toHaveBeenCalled()

      controller['ginisAPIService'].getDocumentDetail = jest.fn()
      controller['ginisAPIService'].getOwnerDetail = jest
        .fn()
        .mockRejectedValue(new Error('Error'))
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow()
      expect(internalServerErrorSpy).toHaveBeenCalled()

      controller['ginisAPIService'].getOwnerDetail = jest.fn()
      jest.mock('../utils/ginis/ginis-api-helper', () => ({
        mapGinisHistory: jest.fn().mockImplementation(() => {
          throw new Error('Error')
        }),
      }))
      await expect(controller.getGinisDocumentByFormId('123')).rejects.toThrow()

      // If th
    })

    it('should return GinisDocumentDetailResponseDto', async () => {
      controller['formsService'].getFormWithAccessCheck = jest
        .fn()
        .mockResolvedValue({ ginisDocumentId: 'id' } as Forms)
      controller['ginisAPIService'].getDocumentDetail = jest
        .fn()
        .mockResolvedValue(mockGinisDocumentData)
      controller['ginisAPIService'].getOwnerDetail = jest.fn()
      jest.mock('../utils/ginis/ginis-api-helper', () => ({
        mapGinisHistory: jest.fn(),
      }))

      const result = await controller.getGinisDocumentByFormId('123')
      expect(result.id).toBe('MAG0X03RZDEB')
      expect(result.ownerName).toBe(' ') // getOwnerDetail returns nothing
      expect(result.ownerEmail).toBe('')
    })
  })
})
/* eslint-enable @typescript-eslint/dot-notation */
