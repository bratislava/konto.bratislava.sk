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

export enum GinContactType {
  PHYSICAL_ENTITY = 'fyz-osoba',
  LEGAL_ENTITY = 'pravnicka-osoba',
  SELF_EMPLOYED_ENTITY = 'fyz-osoba-osvc', // SZCO
}

export enum SslFileUploadType {
  ATTACHMENT = 'elektronicka-priloha',
  SOURCE = 'elektronicky-obraz',
}

export enum SslWflDocumentElectronicSourceExistence {
  EXISTS = 'existuje', // Příznak že dokument nebo jeho obraz existuje v sledované, elektronické podobě. Za sledovaný el. dokument se nepovažuje žádný soubor uložený mimo systém GINIS.
  EXISTS_NO_AUTOMATIC_CONVERSION = 'existuje-neaut-konv', // Příznak že dokument má el. podobu.
  HYBRID_DOSSIER = 'hybridni-spis', // Hybridní spis bez elektronického obrazu.
  DOES_NOT_EXIST = 'neexistuje', // Příznak že k dokument neexistuje sledovaný elektronický obraz.
}

export interface GinContactParams {
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
    fileType: SslFileUploadType = SslFileUploadType.ATTACHMENT,
  ): Promise<SslPridatSouborPridatSoubor> {
    const baseName = path.parse(fileName).name

    const fileUpload = await this.ginis.ssl.pridatSouborMtom(
      {
        'Id-dokumentu': documentId,
        'Jmeno-souboru': fileName.slice(-254), // filenames usually differ at the end
        'Typ-vazby': fileType,
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

  private extractTitleFromGinContactParams(
    params: GinContactParams,
  ): string | undefined {
    if (params.type !== GinContactType.PHYSICAL_ENTITY) {
      return params.name
    }

    if (!params.firstName) {
      return params.lastName
    }

    if (params.lastName) {
      return `${params.lastName} ${params.firstName}`
    }

    return undefined
  }

  private async updateContactInContactDatabase(
    contact: GinNajdiEsuNajdiEsuItem,
    params: GinContactParams,
    contactDatabase: GinContactDatabase,
  ): Promise<string> {
    let updateParams: GinContactParams = { ...params }

    // only update missing uri if the contact database is not ours
    // any other change would create a new contact instead of updating the existing one
    if (contactDatabase !== GinContactDatabase.CITY_ACCOUNT) {
      updateParams = {
        ...(!contact['Id-dat-schranky'] && { uri: params.uri }),
      }
    }

    // Skip update call if there are no updates to make
    const hasUpdates = Object.values(updateParams).some(
      (value) => value !== undefined,
    )
    if (!hasUpdates) {
      return contact['Id-esu']
    }

    const data = await this.ginis.gin.editEsu({
      'Id-esu': contact['Id-esu'],
      'Typ-esu': updateParams.type,
      'E-mail': updateParams.email,
      'Id-dat-schranky': updateParams.uri,
      Jmeno: updateParams.firstName,
      Prijmeni: updateParams.lastName,
      'Rodne-cislo': updateParams.birthNumber?.replace('/', ''),
      'Obchodni-jmeno': updateParams.name,
      Ico: updateParams.ico,
      Nazev: this.extractTitleFromGinContactParams(updateParams),
    })

    // changing information might create a new contact, so we need to return the new id
    return data['Vytvor-esu']['Id-esu']
  }

  private async findAndUpdateContactInContactDatabase(
    request: GinNajdiEsuRequest,
    params: GinContactParams,
    extended: boolean = false,
    contactDatabases: GinContactDatabase[] = this.defaultContactDatabaseOrder,
  ): Promise<string | undefined> {
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
      if (data['Najdi-esu'].length === 1) {
        return this.updateContactInContactDatabase(
          data['Najdi-esu'][0],
          params,
          database,
        )
      }
    }
    return undefined
  }

  private async findAndUpdateContactByUri(
    params: GinContactParams,
  ): Promise<string | undefined> {
    if (!params.uri) {
      return undefined
    }
    return this.findAndUpdateContactInContactDatabase(
      { 'Id-dat-schranky': params.uri },
      params,
    )
  }

  private async findAndUpdateContactByIdentifier(
    params: GinContactParams,
  ): Promise<string | undefined> {
    if (params.firstName && params.lastName && params.birthNumber) {
      const contactId = await this.findAndUpdateContactInContactDatabase(
        {
          Jmeno: params.firstName,
          Prijmeni: params.lastName,
          'Rodne-cislo': params.birthNumber.replace('/', ''),
        },
        params,
      )
      if (contactId) {
        return contactId
      }
    }

    if (params.name && params.ico) {
      const contactId = await this.findAndUpdateContactInContactDatabase(
        {
          'Obchodni-jmeno': params.name,
          Ico: params.ico,
        },
        params,
      )
      if (contactId) {
        return contactId
      }
    }
    return undefined
  }

  private async findAndUpdateContactByEmail(
    params: GinContactParams,
  ): Promise<string | undefined> {
    if (params.firstName && params.lastName && params.email) {
      const contactId = await this.findAndUpdateContactInContactDatabase(
        {
          Jmeno: params.firstName,
          Prijmeni: params.lastName,
          'E-mail': params.email,
          'Typ-esu': params.type,
        },
        params,
      )
      if (contactId) {
        return contactId
      }
    }

    if (params.name && params.email) {
      const contactId = await this.findAndUpdateContactInContactDatabase(
        {
          'Obchodni-jmeno': params.name,
          'E-mail': params.email,
          'Typ-esu': params.type,
        },
        params,
      )
      if (contactId) {
        return contactId
      }
    }
    return undefined
  }

  async findAndUpdateContact(
    params: GinContactParams,
  ): Promise<string | undefined> {
    return (
      (await this.findAndUpdateContactByUri(params)) ??
      (await this.findAndUpdateContactByIdentifier(params)) ??
      (await this.findAndUpdateContactByEmail(params))
    )
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
      Nazev: this.extractTitleFromGinContactParams(params),
    })
    return data['Vytvor-esu']['Id-esu']
  }

  async upsertContact(params: GinContactParams): Promise<string> {
    return (
      (await this.findAndUpdateContact(params)) ??
      (await this.createContact(params))
    )
  }

  async createDocument(
    externalDocumentId: string,
    type: string,
    sentAtDate: Date,
    subject: string,
    senderId?: string,
  ) {
    const sentAtIso = sentAtDate.toISOString().split('T')[0]
    const data = await this.ginis.ssl.zalozPisemnost(
      {
        'Id-dokumentu': {
          value: externalDocumentId,
          attributes: ['externi="true"'],
        },
        Vec: subject.slice(0, 100),
        'Id-typu-dokumentu': type,
        'Priznak-fyz-existence': 'neexistuje',
      },
      {
        Stat: 'SVK',
        'Datum-odeslani': sentAtIso,
        'Datum-ze-dne': sentAtIso,
        'Zpusob-doruceni': 'neurceno',
        'Druh-zasilky': 'neurceno',
        'Druh-zachazeni': 'neurceno',
        'Datum-prijmu-podani': `${sentAtIso}T00:00:00`,
        'Id-odesilatele':
          senderId ?? this.baConfigService.ginisApi.anonymousSenderId,
      },
      {
        Pristup: 'ke zverejneni',
        'Vec-podrobne': subject.slice(0, 254),
        'Datum-podani': `${sentAtIso}T00:00:00`,
      },
    )
    return data['Zaloz-pisemnost']['Id-dokumentu']
  }

  async assignReferenceNumber(documentId: string) {
    await this.ginis.ssl.zalozCj({
      'Id-init-dokumentu': documentId,
      'Denik-cj': 'MAG',
    })
  }

  async createFormIdProperty(documentId: string) {
    const data = await this.ginis.ssl.zalozitVlastnostDokumentu({
      'Id-dokumentu': documentId,
      'Typ-objektu': 'vlastnost',
      'Id-objektu': this.baConfigService.ginisApi.formIdPropertyId,
    })

    return data['Zalozit-vlastnost-dokumentu']['Poradove-cislo']
  }

  async setFormIdProperty(
    documentId: string,
    propertyOrder: string,
    formId: string,
  ) {
    const { formIdPropertyId } = this.baConfigService.ginisApi
    await this.ginis.ssl.nastavitVlastnostDokumentu({
      'Id-dokumentu': documentId,
      'Id-profilu': formIdPropertyId,
      'Id-struktury': formIdPropertyId,
      'Id-vlastnosti': formIdPropertyId,
      'Poradove-cislo': propertyOrder,
      'Hodnota-raw': formId,
    })
  }
}
