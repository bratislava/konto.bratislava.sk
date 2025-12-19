import { Injectable } from '@nestjs/common'
import * as crypto from 'node:crypto'
import { v1 as uuidv1 } from 'uuid'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../user-verification/verification.errors.enum'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import ClientsService from '../clients/clients.service'
import { UpvsNaturalPerson } from 'openapi-clients/slovensko-sk'

@Injectable()
export class NasesService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private clientsService: ClientsService
  ) {
    this.logger = new LineLoggerSubservice(NasesService.name)
  }

  async getUpvsIdentity(token: string): Promise<UpvsNaturalPerson | null> {
    const result = await this.clientsService.slovenskoSkApi
      .apiUpvsIdentityGet({
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => response.data)
      .catch((error) => {
        throw this.throwerErrorGuard.BadRequestException(
          VerificationErrorsEnum.VERIFY_EID_ERROR,
          VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          undefined,
          error
        )
      })
    return result
  }

  // copied from nest-forms-backend
  createTechnicalAccountJwtToken(): string {
    const privateKey = process.env.API_TOKEN_PRIVATE ?? ''
    const header = {
      alg: 'RS256',
    }
    const jti = uuidv1()
    const exp = Math.floor(new Date(Date.now() + 5 * 60_000).getTime() / 1000)
    const payload = {
      sub: process.env.SUB_NASES_TECHNICAL_ACCOUNT,
      exp,
      jti,
      obo: null,
    }
    const headerEncode = Buffer.from(JSON.stringify(header)).toString('base64url')
    const payloadEncode = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const buffer = Buffer.from(`${headerEncode}.${payloadEncode}`)
    const signature = crypto.sign('sha256', buffer, { key: privateKey }).toString('base64url')
    return `${headerEncode}.${payloadEncode}.${signature}`
  }

  async searchUpvsIdentitiesByUri(uris: string[]) {
    const jwt = this.createTechnicalAccountJwtToken()
    const result = await this.clientsService.slovenskoSkApi
      .apiIamIdentitiesSearchPost(
        {
          uris,
        },
        {
          headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
        }
      )
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          VerificationErrorsEnum.VERIFY_EID_ERROR,
          VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          `Internal reason: ${VerificationErrorsResponseEnum.UNEXPECTED_UPVS_RESPONSE}`,
          error
        )
      })
    return result
  }
}
