import { HttpException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Forms } from '@prisma/client'

import {
  FormFilesWithMinio,
  GetFileResponseReducedDto,
} from '../../files/files.dto'
import FormsService from '../../forms/forms.service'
import { GinisUploadInfo } from '../dtos/ginis.response.dto'
import GinisHelper from './ginis.helper'

jest.mock('../../forms/forms.service')

describe('GinisHelper', () => {
  let helper: GinisHelper
  const { console } = global

  beforeEach(async () => {
    jest.resetAllMocks()

    global.console = {
      ...console,
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [GinisHelper, FormsService],
    }).compile()

    helper = module.get<GinisHelper>(GinisHelper)

    Object.defineProperty(helper, 'logger', {
      value: { error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    })
  })

  afterEach(() => {
    global.console = console
  })

  it('should be defined', () => {
    expect(helper).toBeDefined()
  })

  describe('allFilesUploadedToGinis', () => {
    const allUploaded = [
      { ginisOrder: 1, ginisUploaded: true },
      { ginisOrder: null, ginisUploaded: true },
      { ginisOrder: 10, ginisUploaded: true },
    ] as GetFileResponseReducedDto[]
    const notAllUploaded = [
      { ginisOrder: 1, ginisUploaded: true },
      { ginisOrder: null, ginisUploaded: true },
      { ginisOrder: 10, ginisUploaded: false },
    ] as GetFileResponseReducedDto[]

    it('should return true', () => {
      expect(helper.allFilesUploadedToGinis(allUploaded)).toBeTruthy()
      expect(helper.allFilesUploadedToGinis([])).toBeTruthy()
    })

    it('should return false', () => {
      expect(helper.allFilesUploadedToGinis(notAllUploaded)).toBeFalsy()
    })
  })

  describe('areAllFilesInGinisResponse', () => {
    it('should return true', () => {
      const filesEmpty: FormFilesWithMinio[] = []
      const files: FormFilesWithMinio[] = [
        { minioPath: 'minioPath/name1.pdf', id: '1', fileName: 'name1.pdf' },
        { minioPath: 'minioPath/name2.pdf', id: '2', fileName: 'name2.pdf' },
        { minioPath: 'minioPath/name3.pdf', id: '3', fileName: 'name3.pdf' },
      ]
      const ginisResponse: GinisUploadInfo[] = [
        {
          Súbor: 'name2.pdf',
        } as GinisUploadInfo,
        { Súbor: 'name4.pdf' } as GinisUploadInfo,
        { Súbor: 'name1.pdf' } as GinisUploadInfo,
        { Súbor: 'name3.pdf' } as GinisUploadInfo,
      ]

      expect(
        helper.areAllFilesInGinisResponse(filesEmpty, ginisResponse),
      ).toBeTruthy()
      expect(
        helper.areAllFilesInGinisResponse(files, ginisResponse),
      ).toBeTruthy()
    })

    it('should return false', () => {
      const files: FormFilesWithMinio[] = [
        { minioPath: 'minioPath/name1.pdf', id: '1', fileName: 'name1.pdf' },
        { minioPath: 'minioPath/name2.pdf', id: '2', fileName: 'name2.pdf' },
        { minioPath: 'minioPath/name3.pdf', id: '3', fileName: 'name3.pdf' },
      ]
      const ginisResponse: GinisUploadInfo[] = [
        { Súbor: 'name2.pdf' } as GinisUploadInfo,
        { Súbor: 'name4.pdf' } as GinisUploadInfo,
        { Súbor: 'name3.pdf' } as GinisUploadInfo,
      ]

      expect(
        helper.areAllFilesInGinisResponse(files, ginisResponse),
      ).toBeFalsy()
    })
  })

  describe('setFormToError', () => {
    it('should just call update form', async () => {
      const spy = jest
        .spyOn(helper['formsService'], 'updateForm')
        .mockImplementation(async () => ({}) as Forms)
      await helper.setFormToError('sss')

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should be okay even if update form fails because of nonexistent id', async () => {
      const spy = jest
        .spyOn(helper['formsService'], 'updateForm')
        .mockRejectedValue(new HttpException('response', 500))
      await helper.setFormToError('sss')
      // No exception here - the result is ignored, just logged

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})
