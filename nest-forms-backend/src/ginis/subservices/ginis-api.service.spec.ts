import { Readable } from 'node:stream'

import {
  GinNajdiEsuNajdiEsuItem,
  SslPrehledDokumentuPrehledDokumentuItem,
  SslPrehledDokumentuResponse,
} from '@bratislava/ginis-sdk'
import { Test, TestingModule } from '@nestjs/testing'

import BaConfigService from '../../config/ba-config.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import GinisAPIService, { GinContactType } from './ginis-api.service'

jest.mock('@bratislava/ginis-sdk', () => ({
  Ginis: class {
    ssl = {
      detailDokumentu: jest.fn(async (bodyObj: object) => bodyObj),
      pridatSouborMtom: jest.fn(async (bodyObj: object) => bodyObj),
      prehledDokumentu: jest.fn(async (bodyObj: object) => bodyObj),
      prideleni: jest.fn(async (bodyObj: object) => bodyObj),
    }

    gin = {
      detailFunkcnihoMista: jest.fn(async (bodyObj: object) => bodyObj),
      detailReferenta: jest.fn(async (bodyObj: object) => bodyObj),
      najdiEsu: jest.fn(async (bodyObj: object) => bodyObj),
      editEsu: jest.fn(async (bodyObj: object) => bodyObj),
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
              sslMtomHost: '',
              ginHost: '',
              formIdPropertyId: 'MAG00example',
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

      expect(uploadSpy).toHaveBeenCalledWith(
        {
          'Id-dokumentu': 'docId',
          'Jmeno-souboru': filename_middle204 + filename_last50,
          'Typ-vazby': 'elektronicka-priloha',
          'Popis-souboru': filename_first50,
          'Podrobny-popis-souboru': filename_first50 + filename_middle204,
        },
        mockStream,
      )
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

      expect(uploadSpy).toHaveBeenCalledWith(
        {
          'Id-dokumentu': 'docId',
          'Jmeno-souboru': 'foobar.zip',
          'Typ-vazby': 'elektronicka-priloha',
          'Popis-souboru': 'foobar',
          'Podrobny-popis-souboru': 'foobar',
        },
        mockStream,
      )
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
          'Id-vlastnosti': 'MAG00example',
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

  describe('assignDocument', () => {
    beforeEach(() => {
      jest.spyOn(service['ginis'].ssl, 'prideleni').mockResolvedValue({
        Prideleni: {
          'Datum-zmeny': '2025-06-02T19:06:00',
        },
      })
    })

    it('should use functionId if present', async () => {
      const assignSpy = jest
        .spyOn(service['ginis'].ssl, 'prideleni')
        .mockResolvedValue({
          Prideleni: {
            'Datum-zmeny': '2025-06-02T19:06:00',
          },
        })

      await service.assignDocument('docId', 'nodeId', 'functionId')
      expect(assignSpy).toHaveBeenCalledWith({
        'Id-dokumentu': 'docId',
        'Id-uzlu': 'nodeId',
        'Id-funkce': 'functionId',
        'Ucel-distribuce': 'Automatizovane pridelenie',
        'Prime-prideleni': 'prime-prideleni',
      })
    })

    it('should ommit functionId if not present', async () => {
      const assignSpy = jest
        .spyOn(service['ginis'].ssl, 'prideleni')
        .mockResolvedValue({
          Prideleni: {
            'Datum-zmeny': '2025-06-02T19:06:00',
          },
        })

      await service.assignDocument('docId', 'nodeId')
      expect(assignSpy).toHaveBeenCalledWith({
        'Id-dokumentu': 'docId',
        'Id-uzlu': 'nodeId',
        'Ucel-distribuce': 'Automatizovane pridelenie',
        'Prime-prideleni': 'prime-prideleni',
      })
    })

    it('should throw error if Ginis throws error', async () => {
      jest
        .spyOn(service['ginis'].ssl, 'prideleni')
        .mockRejectedValueOnce(new Error('Ginis find failed'))

      await expect(service.assignDocument('docId', 'nodeId')).rejects.toThrow(
        'Ginis find failed',
      )
    })

    it('should extract the assignment data to be returned', async () => {
      const data = await service.assignDocument('docId', 'nodeId')
      expect(data).toEqual({
        'Datum-zmeny': '2025-06-02T19:06:00',
      })
    })
  })

  describe('extractTitleFromGinContactParams', () => {
    it('should return name for non-physical entity', () => {
      const title = (service as any).extractTitleFromGinContactParams({
        type: GinContactType.LEGAL_ENTITY,
        name: 'Company Name',
      })
      expect(title).toBe('Company Name')
    })

    it('should return lastName when firstName is missing for physical entity', () => {
      const title = (service as any).extractTitleFromGinContactParams({
        type: GinContactType.PHYSICAL_ENTITY,
        lastName: 'Doe',
      })
      expect(title).toBe('Doe')
    })

    it('should return formatted name "lastName firstName" for physical entity', () => {
      const title = (service as any).extractTitleFromGinContactParams({
        type: GinContactType.PHYSICAL_ENTITY,
        firstName: 'John',
        lastName: 'Doe',
      })
      expect(title).toBe('Doe John')
    })

    it('should return undefined when no valid name data', () => {
      const title = (service as any).extractTitleFromGinContactParams({
        type: GinContactType.PHYSICAL_ENTITY,
        firstName: 'John',
      })
      expect(title).toBeUndefined()
    })
  })

  describe('updateContactInContactDatabase', () => {
    const mockContact: GinNajdiEsuNajdiEsuItem = {
      'Id-esu': 'contact-id-123',
      'E-mail': 'existing@example.com',
      'Id-dat-schranky': 'existing-uri',
      Ico: '12345678',
      'Rodne-cislo': '001122/3344',
    } as GinNajdiEsuNajdiEsuItem

    beforeEach(() => {
      jest.spyOn(service['ginis'].gin, 'editEsu').mockResolvedValue({
        'Vytvor-esu': {
          'Id-esu': 'updated-id',
          'Datum-zmeny': '2025-01-01',
          'Provedena-operace': 'oprava-klicova',
        },
      })
    })

    it('should update all params for CITY_ACCOUNT database', async () => {
      const params = {
        email: 'new@example.com',
        firstName: 'John',
        lastName: 'Doe',
        birthNumber: '001122/3344',
        uri: 'test-uri',
        type: GinContactType.PHYSICAL_ENTITY,
      }

      const result = await (service as any).updateContactInContactDatabase(
        mockContact,
        params,
        '5', // CITY_ACCOUNT
      )

      expect(service['ginis'].gin.editEsu).toHaveBeenCalledWith(
        expect.objectContaining({
          'Id-esu': 'contact-id-123',
          'Typ-esu': GinContactType.PHYSICAL_ENTITY,
          'E-mail': 'new@example.com',
          'Id-dat-schranky': 'test-uri',
          Jmeno: 'John',
          Prijmeni: 'Doe',
          'Rodne-cislo': '0011223344',
          Nazev: 'Doe John',
        }),
      )
      expect(result).toBe('updated-id')
    })

    it('should only update missing uri for non-CITY_ACCOUNT database', async () => {
      const contactWithoutUri = {
        ...mockContact,
        'Id-dat-schranky': undefined,
      }
      const params = {
        email: 'new@example.com',
        uri: 'new-uri',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = await (service as any).updateContactInContactDatabase(
        contactWithoutUri,
        params,
        '0', // COMMON
      )

      expect(service['ginis'].gin.editEsu).toHaveBeenCalledWith(
        expect.objectContaining({
          'Id-esu': 'contact-id-123',
          'Id-dat-schranky': 'new-uri',
        }),
      )
      expect(result).toBe('updated-id')
    })

    it('should not update uri for non-CITY_ACCOUNT database if already present', async () => {
      const contactWithUri = {
        ...mockContact,
        'Id-dat-schranky': 'existing-uri',
      }
      const params = {
        email: 'new@example.com',
        uri: 'new-uri',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = await (service as any).updateContactInContactDatabase(
        contactWithUri,
        params,
        '0', // COMMON
      )

      expect(service['ginis'].gin.editEsu).not.toHaveBeenCalled()
      expect(result).toBe('contact-id-123')
    })

    it('should skip update call if no updates to make', async () => {
      const params = {}
      const contactWithoutUri = {
        ...mockContact,
        'Id-dat-schranky': undefined,
      }

      const result = await (service as any).updateContactInContactDatabase(
        contactWithoutUri,
        params,
        '0', // COMMON
      )

      expect(service['ginis'].gin.editEsu).not.toHaveBeenCalled()
      expect(result).toBe('contact-id-123')
    })

    it('should replace slash in birthNumber', async () => {
      const params = {
        birthNumber: '001122/3344',
        uri: 'test-uri',
        type: GinContactType.PHYSICAL_ENTITY,
      }

      await (service as any).updateContactInContactDatabase(
        mockContact,
        params,
        '5', // CITY_ACCOUNT
      )

      expect(service['ginis'].gin.editEsu).toHaveBeenCalledWith(
        expect.objectContaining({
          'Rodne-cislo': '0011223344',
        }),
      )
    })

    it('should passthrough birthNumber without slash', async () => {
      const params = {
        birthNumber: '0011223344',
        uri: 'test-uri',
        type: GinContactType.PHYSICAL_ENTITY,
      }

      await (service as any).updateContactInContactDatabase(
        mockContact,
        params,
        '5', // CITY_ACCOUNT
      )

      expect(service['ginis'].gin.editEsu).toHaveBeenCalledWith(
        expect.objectContaining({
          'Rodne-cislo': '0011223344',
        }),
      )
    })
  })

  describe('findUpdateContactInContactDatabase', () => {
    beforeEach(() => {
      jest
        .spyOn(service['ginis'].gin, 'najdiEsu')
        .mockResolvedValue({ 'Najdi-esu': [] })
      jest.spyOn(service['ginis'].gin, 'editEsu').mockResolvedValue({
        'Vytvor-esu': {
          'Id-esu': 'updated-id',
          'Datum-zmeny': '2025-01-01',
          'Provedena-operace': 'oprava-neklicova',
        },
      })
    })

    it('should search databases in order', async () => {
      const findSpy = jest.spyOn(service['ginis'].gin, 'najdiEsu')

      await (service as any).findUpdateContactInContactDatabase(
        { 'Id-dat-schranky': 'test-uri' },
        { email: 'test@example.com' },
      )

      expect(findSpy).toHaveBeenCalledTimes(4)
      expect(findSpy).toHaveBeenNthCalledWith(
        1,
        {
          Aktivita: 'aktivni',
          'Uroven-pristupu': '5', // CITY_ACCOUNT
          'Id-dat-schranky': 'test-uri',
        },
        { 'Rozsah-prehledu': 'standardni' },
      )
    })

    it('should use extended search when extended is true', async () => {
      const findSpy = jest.spyOn(service['ginis'].gin, 'najdiEsu')

      await (service as any).findUpdateContactInContactDatabase(
        { 'Id-dat-schranky': 'test-uri' },
        { email: 'test@example.com' },
        true,
      )

      expect(findSpy).toHaveBeenCalledWith(expect.any(Object), {
        'Rozsah-prehledu': 'rozsireny',
      })
    })

    it('should return updated contact ID when found', async () => {
      const mockContact: GinNajdiEsuNajdiEsuItem = {
        'Id-esu': 'found-contact-id',
      } as GinNajdiEsuNajdiEsuItem

      jest.spyOn(service['ginis'].gin, 'najdiEsu').mockResolvedValueOnce({
        'Najdi-esu': [mockContact],
      })

      const updateSpy = jest.spyOn(
        service as any,
        'updateContactInContactDatabase',
      )
      updateSpy.mockResolvedValueOnce('updated-contact-id')

      const result = await (service as any).findUpdateContactInContactDatabase(
        { 'Id-dat-schranky': 'test-uri' },
        { email: 'test@example.com' },
      )

      expect(result).toBe('updated-contact-id')
      expect(updateSpy).toHaveBeenCalledWith(
        mockContact,
        { email: 'test@example.com' },
        '5', // CITY_ACCOUNT
      )
    })

    it('should return undefined when contact not found', async () => {
      const result = await (service as any).findUpdateContactInContactDatabase(
        { 'Id-dat-schranky': 'test-uri' },
        { email: 'test@example.com' },
      )

      expect(result).toBeUndefined()
    })
  })

  describe('findUpdateContactByUri', () => {
    it('should return undefined when uri is missing', async () => {
      const result = await (service as any).findUpdateContactByUri({})

      expect(result).toBeUndefined()
      expect(service['ginis'].gin.najdiEsu).not.toHaveBeenCalled()
    })

    it('should call findUpdateContactInContactDatabase with uri', async () => {
      const findUpdateSpy = jest
        .spyOn(service as any, 'findUpdateContactInContactDatabase')
        .mockResolvedValue('contact-id')

      const result = await (service as any).findUpdateContactByUri({
        uri: 'test-uri',
        email: 'test@example.com',
      })

      expect(result).toBe('contact-id')
      expect(findUpdateSpy).toHaveBeenCalledWith(
        { 'Id-dat-schranky': 'test-uri' },
        { uri: 'test-uri', email: 'test@example.com' },
      )
    })
  })

  describe('findUpdateContactByIdentifier', () => {
    it('should search by firstName, lastName, and birthNumber', async () => {
      const findUpdateSpy = jest
        .spyOn(service as any, 'findUpdateContactInContactDatabase')
        .mockResolvedValue('contact-id')

      const result = await (service as any).findUpdateContactByIdentifier({
        firstName: 'John',
        lastName: 'Doe',
        birthNumber: '001122/3344',
        uri: 'test-uri',
        type: GinContactType.PHYSICAL_ENTITY,
      })

      expect(result).toBe('contact-id')
      expect(findUpdateSpy).toHaveBeenCalledWith(
        {
          Jmeno: 'John',
          Prijmeni: 'Doe',
          'Rodne-cislo': '0011223344',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          birthNumber: '001122/3344',
          uri: 'test-uri',
          type: GinContactType.PHYSICAL_ENTITY,
        },
      )
    })

    it('should search by name and ico for legal entity', async () => {
      const findUpdateSpy = jest
        .spyOn(service as any, 'findUpdateContactInContactDatabase')
        .mockResolvedValue('contact-id')

      const result = await (service as any).findUpdateContactByIdentifier({
        name: 'Company',
        ico: '12345678',
        uri: 'test-uri',
        type: GinContactType.LEGAL_ENTITY,
      })

      expect(result).toBe('contact-id')
      expect(findUpdateSpy).toHaveBeenCalledWith(
        {
          'Obchodni-jmeno': 'Company',
          Ico: '12345678',
        },
        {
          name: 'Company',
          ico: '12345678',
          uri: 'test-uri',
          type: GinContactType.LEGAL_ENTITY,
        },
      )
    })

    it('should return undefined when no identifier provided', async () => {
      const result = await (service as any).findUpdateContactByIdentifier({})

      expect(result).toBeUndefined()
    })
  })

  describe('findUpdateContactByEmail', () => {
    it('should search by firstName, lastName, and email', async () => {
      const findUpdateSpy = jest
        .spyOn(service as any, 'findUpdateContactInContactDatabase')
        .mockResolvedValue('contact-id')

      const result = await (service as any).findUpdateContactByEmail({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        type: GinContactType.PHYSICAL_ENTITY,
      })

      expect(result).toBe('contact-id')
      expect(findUpdateSpy).toHaveBeenCalledWith(
        {
          Jmeno: 'John',
          Prijmeni: 'Doe',
          'E-mail': 'test@example.com',
          'Typ-esu': GinContactType.PHYSICAL_ENTITY,
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          type: GinContactType.PHYSICAL_ENTITY,
        },
      )
    })

    it('should search by name and email for legal entity', async () => {
      const findUpdateSpy = jest
        .spyOn(service as any, 'findUpdateContactInContactDatabase')
        .mockResolvedValue('contact-id')

      const result = await (service as any).findUpdateContactByEmail({
        name: 'Company',
        email: 'test@example.com',
        type: GinContactType.LEGAL_ENTITY,
      })

      expect(result).toBe('contact-id')
      expect(findUpdateSpy).toHaveBeenCalledWith(
        {
          'Obchodni-jmeno': 'Company',
          'E-mail': 'test@example.com',
          'Typ-esu': GinContactType.LEGAL_ENTITY,
        },
        {
          name: 'Company',
          email: 'test@example.com',
          type: GinContactType.LEGAL_ENTITY,
        },
      )
    })

    it('should return undefined when no email provided', async () => {
      const result = await (service as any).findUpdateContactByEmail({})

      expect(result).toBeUndefined()
    })
  })

  describe('findUpdateContact', () => {
    it('should try uri first, then identifier, then email', async () => {
      const uriSpy = jest
        .spyOn(service as any, 'findUpdateContactByUri')
        // eslint-disable-next-line unicorn/no-useless-undefined
        .mockResolvedValue(undefined)
      const identifierSpy = jest
        .spyOn(service as any, 'findUpdateContactByIdentifier')
        // eslint-disable-next-line unicorn/no-useless-undefined
        .mockResolvedValue(undefined)
      const emailSpy = jest
        .spyOn(service as any, 'findUpdateContactByEmail')
        .mockResolvedValue('contact-id')

      const result = await service.findUpdateContact({
        uri: 'test-uri',
        firstName: 'John',
        lastName: 'Doe',
        birthNumber: '001122/3344',
        email: 'test@example.com',
      })

      expect(result).toBe('contact-id')
      expect(uriSpy).toHaveBeenCalled()
      expect(identifierSpy).toHaveBeenCalled()
      expect(emailSpy).toHaveBeenCalled()
    })

    it('should return immediately when uri search succeeds', async () => {
      const uriSpy = jest
        .spyOn(service as any, 'findUpdateContactByUri')
        .mockResolvedValue('contact-id')
      const identifierSpy = jest.spyOn(
        service as any,
        'findUpdateContactByIdentifier',
      )
      const emailSpy = jest.spyOn(service as any, 'findUpdateContactByEmail')

      const result = await service.findUpdateContact({
        uri: 'test-uri',
        email: 'test@example.com',
      })

      expect(result).toBe('contact-id')
      expect(uriSpy).toHaveBeenCalled()
      expect(identifierSpy).not.toHaveBeenCalled()
      expect(emailSpy).not.toHaveBeenCalled()
    })

    it('should return undefined when all searches fail', async () => {
      jest
        .spyOn(service as any, 'findUpdateContactByUri')
        // eslint-disable-next-line unicorn/no-useless-undefined
        .mockResolvedValue(undefined)
      jest
        .spyOn(service as any, 'findUpdateContactByIdentifier')
        // eslint-disable-next-line unicorn/no-useless-undefined
        .mockResolvedValue(undefined)
      jest
        .spyOn(service as any, 'findUpdateContactByEmail')
        // eslint-disable-next-line unicorn/no-useless-undefined
        .mockResolvedValue(undefined)

      const result = await service.findUpdateContact({
        email: 'test@example.com',
        type: GinContactType.PHYSICAL_ENTITY,
      })

      expect(result).toBeUndefined()
    })
  })

  describe('createContact', () => {
    beforeEach(() => {
      jest.spyOn(service['ginis'].gin, 'editEsu').mockResolvedValue({
        'Vytvor-esu': {
          'Id-esu': 'new-contact-id',
          'Datum-zmeny': '2025-01-01',
          'Provedena-operace': 'zalozeni',
        },
      })
    })

    it('should create contact with all params for physical entity', async () => {
      const params = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        birthNumber: '001122/3344',
        uri: 'test-uri',
        type: GinContactType.PHYSICAL_ENTITY,
      }

      const result = await service.createContact(params)

      expect(service['ginis'].gin.editEsu).toHaveBeenCalledWith(
        expect.objectContaining({
          'Uroven-pristupu': '5', // CITY_ACCOUNT
          'Typ-esu': GinContactType.PHYSICAL_ENTITY,
          'E-mail': 'test@example.com',
          'Id-dat-schranky': 'test-uri',
          Jmeno: 'John',
          Prijmeni: 'Doe',
          'Rodne-cislo': '0011223344',
          Nazev: 'Doe John',
        }),
      )
      expect(result).toBe('new-contact-id')
    })

    it('should create contact with all params for legal entity', async () => {
      const params = {
        email: 'test@example.com',
        name: 'Company Name',
        ico: '12345678',
        uri: 'test-uri',
        type: GinContactType.LEGAL_ENTITY,
      }

      const result = await service.createContact(params)

      expect(service['ginis'].gin.editEsu).toHaveBeenCalledWith(
        expect.objectContaining({
          'Uroven-pristupu': '5', // CITY_ACCOUNT
          'Typ-esu': GinContactType.LEGAL_ENTITY,
          'E-mail': 'test@example.com',
          'Id-dat-schranky': 'test-uri',
          'Obchodni-jmeno': 'Company Name',
          Ico: '12345678',
          Nazev: 'Company Name',
        }),
      )
      expect(result).toBe('new-contact-id')
    })

    it('should create contact with minimal params', async () => {
      const params = {
        email: 'test@example.com',
        type: GinContactType.PHYSICAL_ENTITY,
      }

      const result = await service.createContact(params)

      expect(service['ginis'].gin.editEsu).toHaveBeenCalledWith(
        expect.objectContaining({
          'Uroven-pristupu': '5',
          'E-mail': 'test@example.com',
        }),
      )
      expect(result).toBe('new-contact-id')
    })

    it('should replace slash in birthNumber', async () => {
      const params = {
        birthNumber: '001122/3344',
        uri: 'test-uri',
      }

      await service.createContact(params)

      expect(service['ginis'].gin.editEsu).toHaveBeenCalledWith(
        expect.objectContaining({
          'Rodne-cislo': '0011223344',
        }),
      )
    })
  })

  describe('upsertContact', () => {
    it('should return existing contact when found', async () => {
      jest
        .spyOn(service, 'findUpdateContact')
        .mockResolvedValue('existing-contact-id')
      const createSpy = jest.spyOn(service, 'createContact')

      const result = await service.upsertContact({
        email: 'test@example.com',
        type: GinContactType.PHYSICAL_ENTITY,
      })

      expect(result).toBe('existing-contact-id')
      expect(createSpy).not.toHaveBeenCalled()
    })

    it('should create contact when not found', async () => {
      jest
        .spyOn(service, 'findUpdateContact')
        // eslint-disable-next-line unicorn/no-useless-undefined
        .mockResolvedValue(undefined)
      jest.spyOn(service, 'createContact').mockResolvedValue('new-contact-id')

      const result = await service.upsertContact({
        email: 'test@example.com',
        type: GinContactType.PHYSICAL_ENTITY,
      })

      expect(result).toBe('new-contact-id')
      expect(service.createContact).toHaveBeenCalledWith({
        email: 'test@example.com',
        type: GinContactType.PHYSICAL_ENTITY,
      })
    })
  })
})
