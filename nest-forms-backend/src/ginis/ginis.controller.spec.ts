/* eslint-disable @typescript-eslint/dot-notation */
import { GinisError } from '@bratislava/ginis-sdk'
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Forms } from '@prisma/client'
import { AxiosError } from 'axios'

import {
  AuthFixtureUser,
  UserFixtureFactory,
} from '../../test/fixtures/auth/user-fixture-factory'
import { mockGinisDocumentData } from '../__tests__/ginisContants'
import ClientsService from '../clients/clients.service'
import FormsService from '../forms/forms.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import GinisController from './ginis.controller'
import GinisHelper from './subservices/ginis.helper'
import GinisAPIService from './subservices/ginis-api.service'

jest.mock('./subservices/ginis-api.service')
jest.mock('../forms/forms.service')

describe('GinisController', () => {
  let controller: GinisController
  let userFixtureFactory: UserFixtureFactory
  let user: AuthFixtureUser

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GinisController],
      providers: [
        ThrowerErrorGuard,
        GinisAPIService,
        GinisHelper,
        FormsService,
        { provide: ClientsService, useValue: createMock<ClientsService>() },
      ],
    }).compile()
    controller = module.get<GinisController>(GinisController)

    userFixtureFactory = new UserFixtureFactory()
    user = userFixtureFactory.createFoAuthUser()
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
        await controller.getGinisDocumentByFormId('123', user.user)
      } catch (error) {
        expect(spy).toHaveBeenLastCalledWith('123', user.user)
      }

      try {
        await controller.getGinisDocumentByFormId('123', user.user)
      } catch (error) {
        expect(spy).toHaveBeenLastCalledWith('123', user.user)
      }
    })

    it('should throw error if getting form does', async () => {
      controller['formsService'].getFormWithAccessCheck = jest
        .fn()
        .mockRejectedValue(new Error('Error'))
      await expect(
        controller.getGinisDocumentByFormId('123', user.user),
      ).rejects.toThrow()
    })

    it('should throw error if the form has no ginis ID', async () => {
      controller['formsService'].getFormWithAccessCheck = jest
        .fn()
        .mockResolvedValue({} as Forms)
      await expect(
        controller.getGinisDocumentByFormId('123', user.user),
      ).rejects.toThrow()
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
      const ginisError = new GinisError('Error', axiosError)

      controller['formsService'].getFormWithAccessCheck = jest
        .fn()
        .mockResolvedValue({ ginisDocumentId: 'id' } as Forms)
      controller['ginisAPIService'].getDocumentDetail = jest
        .fn()
        .mockRejectedValue(ginisError)
      await expect(
        controller.getGinisDocumentByFormId('123', user.user),
      ).rejects.toThrow()
      expect(notFoundSpy).toHaveBeenCalled()

      controller['ginisAPIService'].getDocumentDetail = jest.fn()
      controller['ginisAPIService'].getOwnerDetail = jest
        .fn()
        .mockRejectedValue(new GinisError('Error'))
      await expect(
        controller.getGinisDocumentByFormId('123', user.user),
      ).rejects.toThrow()
      expect(internalServerErrorSpy).toHaveBeenCalled()

      controller['ginisAPIService'].getOwnerDetail = jest.fn()
      jest.mock('../utils/ginis/ginis-api-helper', () => ({
        mapGinisHistory: jest.fn().mockImplementation(() => {
          throw new Error('Error')
        }),
      }))
      await expect(
        controller.getGinisDocumentByFormId('123', user.user),
      ).rejects.toThrow()

      // If th
    })

    it('should return GinisDocumentDetailResponseDto', async () => {
      controller['formsService'].getFormWithAccessCheck = jest
        .fn()
        .mockResolvedValue({ ginisDocumentId: 'id' } as Forms)
      controller['ginisAPIService'].getDocumentDetail = jest
        .fn()
        .mockResolvedValue(mockGinisDocumentData)
      controller['ginisAPIService'].getOwnerDetail = jest
        .fn()
        .mockResolvedValue({
          'Detail-referenta': {
            Jmeno: 'Jack',
            Prijmeni: 'Brown',
          },
        })
      jest.mock('../utils/ginis/ginis-api-helper', () => ({
        mapGinisHistory: jest.fn(),
      }))

      const result = await controller.getGinisDocumentByFormId('123', user.user)
      expect(result.id).toBe('MAG0X03RZDEB')
      expect(result.ownerName).toBe('Jack Brown')
      expect(result.ownerEmail).toBe('') // email is not mandatory, not returned in mock
    })

    it('should sanitize ginis owner name', async () => {
      controller['formsService'].getFormWithAccessCheck = jest
        .fn()
        .mockResolvedValue({ ginisDocumentId: 'id' } as Forms)
      controller['ginisAPIService'].getDocumentDetail = jest
        .fn()
        .mockResolvedValue(mockGinisDocumentData)
      controller['ginisAPIService'].getOwnerDetail = jest
        .fn()
        .mockResolvedValue({
          'Detail-referenta': {
            Jmeno: 'Jill Mary-47',
            Prijmeni: '42-Black-Smith',
          },
        })
      jest.mock('../utils/ginis/ginis-api-helper', () => ({
        mapGinisHistory: jest.fn(),
      }))

      const result = await controller.getGinisDocumentByFormId('123', user.user)
      expect(result.ownerName).toBe('Jill Mary Black-Smith')
    })
  })
})
/* eslint-enable @typescript-eslint/dot-notation */
