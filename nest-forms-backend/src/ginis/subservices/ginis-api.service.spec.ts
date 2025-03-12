import { Test, TestingModule } from '@nestjs/testing'

import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import GinisAPIService from './ginis-api.service'

jest.mock('@bratislava/ginis-sdk', () => ({
  Ginis: class {
    ssl = {
      detailDokumentu: jest.fn(async (bodyObj: object) => bodyObj),
    }

    gin = {
      detailFunkcnihoMista: jest.fn(async (bodyObj: object) => bodyObj),
      detailReferenta: jest.fn(async (bodyObj: object) => bodyObj),
    }
  },
}))

describe('GinisAPIService', () => {
  let service: GinisAPIService

  beforeEach(async () => {
    jest.resetAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [GinisAPIService, ThrowerErrorGuard],
    }).compile()

    service = module.get<GinisAPIService>(GinisAPIService)

    Object.defineProperty(service, 'logger', {
      value: { error: jest.fn(), log: jest.fn() },
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('constructor no testing', () => {
    const { env } = process

    beforeEach(() => {
      jest.resetModules()
      process.env = {
        ...env,
        JEST_WORKER_ID: undefined,
        GINIS_USERNAME: undefined,
      }
    })

    afterEach(() => {
      process.env = env
    })

    it('should throw error if some env value is not set and not during testing', () => {
      expect(() => new GinisAPIService(new ThrowerErrorGuard())).toThrow()
    })
  })

  describe('getDocumentDetail', () => {
    it('should just call with documentId', async () => {
      const detailSpy = jest.spyOn(service['ginis'].ssl, 'detailDokumentu')
      await service.getDocumentDetail('docId')
      expect(detailSpy).toHaveBeenCalledWith({
        'Id-dokumentu': 'docId',
      })
    })
  })

  describe('getOwnerDetail', () => {
    it('should call both functions', async () => {
      const { detailFunkcnihoMista, detailReferenta } = service['ginis'].gin

      const detailFunkcnihoMistaSpy = jest
        .spyOn(service['ginis'].gin, 'detailFunkcnihoMista')
        .mockResolvedValue({
          'Detail-funkcniho-mista': { 'Id-referenta': '1' },
        } as Awaited<ReturnType<typeof detailFunkcnihoMista>>)
      const detailReferentaSpy = jest
        .spyOn(service['ginis'].gin, 'detailReferenta')
        .mockResolvedValue({
          'Detail-referenta': { 'Id-osoby': 'id1' },
        } as Awaited<ReturnType<typeof detailReferenta>>)

      const result = await service.getOwnerDetail('fun123')

      expect(detailFunkcnihoMistaSpy).toHaveBeenCalledWith({
        'Id-funkce': 'fun123',
      })
      expect(detailReferentaSpy).toHaveBeenCalledWith({
        'Id-osoby': '1',
      })

      expect(result).toEqual({ 'Detail-referenta': { 'Id-osoby': 'id1' } })
    })
  })
})
