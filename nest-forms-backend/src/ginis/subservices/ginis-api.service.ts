import path from 'node:path'
import { Readable } from 'node:stream'

import {
  GinDetailFunkcnihoMistaResponse,
  GinDetailReferentaResponse,
  Ginis,
  SslDetailDokumentuResponse,
  SslPridatSouborPridatSoubor,
  SslPridatSouborResponse,
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

    const fileUpload: SslPridatSouborResponse =
      await this.ginis.ssl.pridatSouborMtom({
        'Id-dokumentu': documentId,
        'Jmeno-souboru': fileName,
        'Typ-vazby': 'elektronicka-priloha',
        'Popis-souboru': baseName,
        'Podrobny-popis-souboru': baseName,
        Obsah: contentStream,
      })

    return fileUpload['Pridat-soubor']
  }
}
