import { Readable } from 'node:stream'

import {
  SslPrehledDokumentuPrehledDokumentuItem,
  SslPrehledDokumentuResponse,
} from '@bratislava/ginis-sdk'
import { Test, TestingModule } from '@nestjs/testing'

import BaConfigService from '../../config/ba-config.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import GinisAPIService from './ginis-api.service'

jest.mock('@bratislava/ginis-sdk', () => ({
  Ginis: class {
    ssl = {
      detailDokumentu: jest.fn(async (bodyObj: object) => bodyObj),
      pridatSouborMtom: jest.fn(async (bodyObj: object) => bodyObj),
      prehledDokumentu: jest.fn(async (bodyObj: object) => bodyObj),
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
      providers: [
        GinisAPIService,
        ThrowerErrorGuard,
        {
          provide: BaConfigService,
          useValue: {
            ginisApi: {
              username: '',
              password: '',
              sslHost: '',
              ginHost: '',
            },
          },
        },
      ],
    }).compile()

    service = module.get<GinisAPIService>(GinisAPIService)

    Object.defineProperty(service, 'logger', {
      value: { error: jest.fn(), log: jest.fn() },
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
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

  describe('uploadFile', () => {
    it('should propagate and trim values correctly', async () => {
      const uploadSpy = jest.spyOn(service['ginis'].ssl, 'pridatSouborMtom')
      const mockStream = new Readable({
        read() {
          this.push('file content')
          this.push(null)
        },
      })

      const filename_first50 =
        // eslint-disable-next-line no-secrets/no-secrets
        'B01abcdefghijABCDEFGHIJ1-B02klmnopqrstuvWXYZabcd2-'
      const filename_middle204 =
        // eslint-disable-next-line no-secrets/no-secrets
        'B03LMNOP12345qrstuvABCD7-B04wxyzJKLMN6789opqrHIJ1-B05ZYXWVUTSRQ0987654321A-B06mnopqABCDEF123456789W-B07ijklLMNOPQR98765432S3-B08GHIJK1234mnopWXYZ5678-B09abcdEFGH567890ijklmNO-B10uvwxYZABCD345678stuv1-B11Z'
      const filename_last50 =
        // eslint-disable-next-line no-secrets/no-secrets
        'YXWVUTonmlkjihgfed01-B12PQRSxyz1234567890ABCD_.pdf'

      await service.uploadFile(
        'docId',
        filename_first50 + filename_middle204 + filename_last50,
        mockStream,
      )

      expect(uploadSpy).toHaveBeenCalledWith({
        'Id-dokumentu': 'docId',
        'Jmeno-souboru': filename_middle204 + filename_last50,
        'Typ-vazby': 'elektronicka-priloha',
        'Popis-souboru': filename_first50,
        'Podrobny-popis-souboru': filename_first50 + filename_middle204,
        Obsah: mockStream,
      })
    })

    it('should extract base name of the file correctly', async () => {
      const uploadSpy = jest.spyOn(service['ginis'].ssl, 'pridatSouborMtom')
      const mockStream = new Readable({
        read() {
          this.push('file content')
          this.push(null)
        },
      })

      await service.uploadFile('docId', 'foobar.zip', mockStream)

      expect(uploadSpy).toHaveBeenCalledWith({
        'Id-dokumentu': 'docId',
        'Jmeno-souboru': 'foobar.zip',
        'Typ-vazby': 'elektronicka-priloha',
        'Popis-souboru': 'foobar',
        'Podrobny-popis-souboru': 'foobar',
        Obsah: mockStream,
      })
    })
  })

  describe('findDocumentId', () => {
    beforeEach(() => {
      jest.spyOn(service['ginis'].ssl, 'prehledDokumentu').mockResolvedValue({
        'Prehled-dokumentu': [],
      } as unknown as SslPrehledDokumentuResponse)
    })

    it('should use current date in field Datum-podani-do', async () => {
      const findSpy = jest
        .spyOn(service['ginis'].ssl, 'prehledDokumentu')
        .mockResolvedValueOnce({
          'Prehled-dokumentu': [],
        } as unknown as SslPrehledDokumentuResponse)
      const currentDate = new Date().toISOString().slice(0, 10)

      await service.findDocumentId('formId')
      expect(findSpy).toHaveBeenCalledWith(
        {
          'Datum-podani-od': '2025-05-02',
          'Datum-podani-do': currentDate,
          'Priznak-spisu': 'neurceno',
          'Id-vlastnosti': 'MAG000V0A1LL',
          'Hodnota-vlastnosti-raw': 'formId',
        },
        {
          'Priznak-generovani': 'generovat',
          'Radek-od': '1',
          'Radek-do': '10',
          'Priznak-zachovani': 'nezachovavat',
          'Rozsah-prehledu': 'standardni',
        },
      )
    })

    it('should throw error if Ginis throws error', async () => {
      jest
        .spyOn(service['ginis'].ssl, 'prehledDokumentu')
        .mockRejectedValueOnce(new Error('Ginis find failed'))

      await expect(service.findDocumentId('formId')).rejects.toThrow(
        'Ginis find failed',
      )
    })

    it('should return null if document is not found', async () => {
      const documentId = await service.findDocumentId('formId')
      expect(documentId).toBeNull()
    })

    it('should throw error if more than 1 document is found', async () => {
      jest
        .spyOn(service['ginis'].ssl, 'prehledDokumentu')
        .mockResolvedValueOnce({
          'Prehled-dokumentu': [
            {
              'Id-dokumentu': 'docId1',
            } as unknown as SslPrehledDokumentuPrehledDokumentuItem,
            {
              'Id-dokumentu': 'docId2',
            } as unknown as SslPrehledDokumentuPrehledDokumentuItem,
          ],
        } as unknown as SslPrehledDokumentuResponse)

      await expect(service.findDocumentId('formId')).rejects.toThrow()
    })

    it('should return document ID if exactly 1 is found', async () => {
      jest
        .spyOn(service['ginis'].ssl, 'prehledDokumentu')
        .mockResolvedValueOnce({
          'Prehled-dokumentu': [
            {
              'Id-dokumentu': 'docId1',
            } as unknown as SslPrehledDokumentuPrehledDokumentuItem,
          ],
        } as unknown as SslPrehledDokumentuResponse)

      const documentId = await service.findDocumentId('formId')
      expect(documentId).toBe('docId1')
    })
  })
})
