import {
  GinDetailFunkcnihoMistaResponse,
  GinDetailReferentaResponse,
  Ginis,
  SslDetailDokumentuResponse,
} from '@bratislava/ginis-sdk'
import { Injectable } from '@nestjs/common'

import { ErrorsEnum } from '../../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

/**
 * Handles all communication through @bratislava/ginis-sdk
 */ @Injectable()
export default class GinisAPIService {
  private readonly logger: LineLoggerSubservice

  private readonly ginis: Ginis

  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {
    this.logger = new LineLoggerSubservice('GinisAPIService')
    if (
      !(
        process.env.GINIS_USERNAME &&
        process.env.GINIS_PASSWORD &&
        process.env.GINIS_SSL_HOST &&
        process.env.GINIS_GIN_HOST
      ) &&
      process.env.JEST_WORKER_ID === undefined
    ) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Some of these env values are not set: GINIS_USERNAME, GINIS_PASSWORD, GINIS_SSL_HOST',
      )
    }
    this.ginis = new Ginis({
      // connect to any subset of services needed, all the urls are optional but requests to services missing urls will fail
      urls: {
        ssl: process.env.GINIS_SSL_HOST,
        gin: process.env.GINIS_GIN_HOST,
      },
      username: process.env.GINIS_USERNAME ?? '',
      password: process.env.GINIS_PASSWORD ?? '',
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
}
