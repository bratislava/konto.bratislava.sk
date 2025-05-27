import path from 'node:path'
import { Readable } from 'node:stream'

import {
  GinDetailFunkcnihoMistaResponse,
  GinDetailReferentaResponse,
  Ginis,
  SslDetailDokumentuResponse,
  SslPridatSouborPridatSoubor,
} from '@bratislava/ginis-sdk'
import { Injectable } from '@nestjs/common'

import BaConfigService from '../../config/ba-config.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

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
    contentStream: Readable,
  ): Promise<SslPridatSouborPridatSoubor> {
    const baseName = path.parse(fileName).name

    const fileUpload = await this.ginis.ssl.pridatSouborMtom({
      'Id-dokumentu': documentId,
      'Jmeno-souboru': fileName.slice(-254), // filenames usually differ at the end
      'Typ-vazby': 'elektronicka-priloha',
      'Popis-souboru': baseName.slice(0, 50),
      'Podrobny-popis-souboru': baseName.slice(0, 254),
      Obsah: contentStream,
    })

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
}
