import path from 'node:path'
import { Readable } from 'node:stream'

import {
  GinDetailFunkcnihoMistaResponse,
  GinDetailReferentaResponse,
  Ginis,
  GinNajdiEsuNajdiEsuItem,
  GinNajdiEsuRequest,
  SslDetailDokumentuResponse,
  SslPridatSouborPridatSoubor,
  SslPrideleniPrideleni,
} from '@bratislava/ginis-sdk'
import { Injectable } from '@nestjs/common'

import BaConfigService from '../../config/ba-config.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

enum GinContactDatabase {
  COMMON = '0',
  ADMIN = '1',
  NORIS = '2',
  LEGACY_ESBS = '3', // legacy database, do not use for search or creation
  CITY_ACCOUNT = '5',
}

enum GinContactType {
  PHYSICAL_ENTITY = 'fyz-osoba',
  LEGAL_ENTITY = 'pravnicka-osoba',
  SELF_EMPLOYED_ENTITY = 'fyz-osoba-osvc', // SZCO
}

interface GinContactParams {
  email?: string
  firstName?: string
  lastName?: string
  birthNumber?: string
  name?: string
  ico?: string
  uri?: string
  type?: GinContactType
}

/**
 * Handles all communication through @bratislava/ginis-sdk
 */ @Injectable()
export default class GinisAPIService {
  private readonly logger: LineLoggerSubservice

  private readonly ginis: Ginis

  constructor(
    private readonly baConfigService: BaConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice('GinisAPIService')
    this.ginis = new Ginis({
      // connect to any subset of services needed, all the urls are optional but requests to services missing urls will fail
      urls: {
        ssl: this.baConfigService.ginisApi.sslHost,
        ssl_mtom: this.baConfigService.ginisApi.sslMtomHost,
        gin: this.baConfigService.ginisApi.ginHost,
      },
      username: this.baConfigService.ginisApi.username,
      password: this.baConfigService.ginisApi.password,
      debug: false,
    })
  }

  async getDocumentDetail(
    documentId: string,
  ): Promise<SslDetailDokumentuResponse> {
    return this.ginis.ssl.detailDokumentu({ 'Id-dokumentu': documentId })
  }

  async getOwnerDetail(
    functionId: string,
  ): Promise<GinDetailReferentaResponse> {
    const functionDetail: GinDetailFunkcnihoMistaResponse =
      await this.ginis.gin.detailFunkcnihoMista({
        'Id-funkce': functionId,
      })
    // if the latter call fails because of missing IdReferenta, we'll get a log of previous result to debug
    this.logger.log(
      'Using the following data in getting GINIS owner: ',
      JSON.stringify(functionDetail),
    )
    return this.ginis.gin.detailReferenta({
      'Id-osoby': functionDetail['Detail-funkcniho-mista']['Id-referenta'],
    })
  }

  async uploadFile(
    documentId: string,
    fileName: string,
    fileStream: Readable,
  ): Promise<SslPridatSouborPridatSoubor> {
    const baseName = path.parse(fileName).name

    const fileUpload = await this.ginis.ssl.pridatSouborMtom(
      {
        'Id-dokumentu': documentId,
        'Jmeno-souboru': fileName.slice(-254), // filenames usually differ at the end
        'Typ-vazby': 'elektronicka-priloha',
        'Popis-souboru': baseName.slice(0, 50),
        'Podrobny-popis-souboru': baseName.slice(0, 254),
      },
      fileStream,
    )

    return fileUpload['Pridat-soubor']
  }

  async findDocumentId(formId: string): Promise<string | null> {
    // formId mapping to this attribute was implemented on Ginis side on '2025-05-02'
    const documentList = await this.ginis.ssl.prehledDokumentu(
      {
        'Datum-podani-od': '2025-05-02',
        'Datum-podani-do': new Date().toISOString().slice(0, 10),
        'Priznak-spisu': 'neurceno',
        'Id-vlastnosti': this.baConfigService.ginisApi.formIdPropertyId,
        'Hodnota-vlastnosti-raw': formId,
      },
      {
        'Priznak-generovani': 'generovat',
        'Radek-od': '1',
        'Radek-do': '10',
        'Priznak-zachovani': 'nezachovavat',
        'Rozsah-prehledu': 'standardni',
      },
    )

    if (documentList['Prehled-dokumentu'].length === 0) {
      return null
    }

    if (documentList['Prehled-dokumentu'].length > 1) {
      throw new Error(
        `More than one GINIS document found for formId ${formId}. ${JSON.stringify(documentList)}`,
      )
    }

    return documentList['Prehled-dokumentu'][0]['Id-dokumentu']
  }

  async assignDocument(
    documentId: string,
    nodeId: string,
    functionId?: string,
  ): Promise<SslPrideleniPrideleni> {
    const data = await this.ginis.ssl.prideleni({
      'Id-dokumentu': documentId,
      'Id-uzlu': nodeId,
      ...(functionId && { 'Id-funkce': functionId }),
      'Ucel-distribuce': 'Automatizovane pridelenie',
      'Prime-prideleni': 'prime-prideleni',
    })
    return data.Prideleni
  }

  private readonly defaultContactDatabaseOrder = [
    GinContactDatabase.CITY_ACCOUNT,
    GinContactDatabase.COMMON,
    GinContactDatabase.ADMIN,
    GinContactDatabase.NORIS,
  ]

  private async findContactInContactDatabase(
    request: GinNajdiEsuRequest,
    extended: boolean = false,
    contactDatabases: GinContactDatabase[] = this.defaultContactDatabaseOrder,
  ): Promise<GinNajdiEsuNajdiEsuItem[]> {
    // eslint-disable-next-line no-restricted-syntax
    for (const database of contactDatabases) {
      // contact database search must happen one by one, not in parallel, in specified order
      // eslint-disable-next-line no-await-in-loop
      const data = await this.ginis.gin.najdiEsu(
        {
          Aktivita: 'aktivni',
          'Uroven-pristupu': database,
          ...request,
        },
        { 'Rozsah-prehledu': extended ? 'rozsireny' : 'standardni' },
      )
      if (data['Najdi-esu'].length > 0) {
        return data['Najdi-esu']
      }
    }
    return []
  }

  private async findContactByUri(
    params: GinContactParams,
  ): Promise<string | undefined> {
    if (!params.uri) {
      return undefined
    }
    const data = await this.findContactInContactDatabase({
      'Id-dat-schranky': params.uri,
    })
    return data.length === 1 ? data[0]['Id-esu'] : undefined
  }

  private async findContactByIdentifier(
    params: GinContactParams,
  ): Promise<string | undefined> {
    if (params.firstName && params.lastName && params.birthNumber) {
      const data = await this.findContactInContactDatabase({
        Jmeno: params.firstName,
        Prijmeni: params.lastName,
        'Rodne-cislo': params.birthNumber.replace('/', ''),
      })
      if (data.length === 1) {
        return data[0]['Id-esu']
      }
    }

    if (params.name && params.ico) {
      const data = await this.findContactInContactDatabase({
        'Obchodni-jmeno': params.name,
        Ico: params.ico,
      })
      if (data.length === 1) {
        return data[0]['Id-esu']
      }
    }
    return undefined
  }

  private async findContactByEmail(
    params: GinContactParams,
  ): Promise<string | undefined> {
    if (params.firstName && params.lastName && params.email) {
      const data = await this.findContactInContactDatabase({
        Jmeno: params.firstName,
        Prijmeni: params.lastName,
        'E-mail': params.email,
        'Typ-esu': params.type,
      })
      if (data.length === 1) {
        return data[0]['Id-esu']
      }
    }

    if (params.name && params.email) {
      const data = await this.findContactInContactDatabase({
        'Obchodni-jmeno': params.name,
        'E-mail': params.email,
        'Typ-esu': params.type,
      })
      if (data.length === 1) {
        return data[0]['Id-esu']
      }
    }
    return undefined
  }

  async findContact(params: GinContactParams): Promise<string | undefined> {
    let contactId: string | undefined

    contactId = await this.findContactByUri(params)
    if (contactId) {
      return contactId
    }

    contactId = await this.findContactByIdentifier(params)
    if (contactId) {
      return contactId
    }

    contactId = await this.findContactByEmail(params)
    if (contactId) {
      return contactId
    }

    return undefined
  }

  async createContact(params: GinContactParams): Promise<string> {
    const data = await this.ginis.gin.editEsu({
      'Uroven-pristupu': GinContactDatabase.CITY_ACCOUNT,
      'Typ-esu': params.type,
      'E-mail': params.email,
      'Id-dat-schranky': params.uri,
      Jmeno: params.firstName,
      Prijmeni: params.lastName,
      'Rodne-cislo': params.birthNumber?.replace('/', ''),
      'Obchodni-jmeno': params.name,
      Ico: params.ico,
      Nazev:
        params.type === GinContactType.PHYSICAL_ENTITY
          ? `${params.lastName} ${params.firstName}`
          : params.name,
    })
    return data['Vytvor-esu']['Id-esu']
  }

  async findOrCreateContact(params: GinContactParams): Promise<string> {
    return (
      (await this.findContact(params)) ?? (await this.createContact(params))
    )
  }
}
