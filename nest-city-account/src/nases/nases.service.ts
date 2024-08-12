import { Injectable } from '@nestjs/common'
import axios from 'axios'
import * as crypto from 'node:crypto'
import { v1 as uuidv1 } from 'uuid'
import { ErrorThrowerGuard } from '../utils/guards/errors.guard'

@Injectable()
export class NasesService {
  constructor(private errorThrowerGuard: ErrorThrowerGuard) {}

  async getUpvsIdentity(token: string) {
    await axios
      .get(`${process.env.SLOVENSKO_SK_CONTAINER_URI}/api/upvs/identity`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.statusCode !== 200) {
          this.errorThrowerGuard.unexpectedUpvsResponseError(response.data)
        }
      })
      .catch((error) => {
        this.errorThrowerGuard.verifyEidError(error)
      })
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
      obo: null
    }
    const headerEncode = Buffer.from(JSON.stringify(header)).toString('base64url')
    const payloadEncode = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const buffer = Buffer.from(`${headerEncode}.${payloadEncode}`)
    const signature = crypto.sign('sha256', buffer, { key: privateKey }).toString('base64url')
    return `${headerEncode}.${payloadEncode}.${signature}`
  }

  async searchUpvsIdentitiesByUri(uris: string[]) {
    const jwt = this.createTechnicalAccountJwtToken()
    const response = await axios
      .post(
        `${process.env.SLOVENSKO_SK_CONTAINER_URI}/api/iam/identities/search`,
        JSON.stringify({ uris }),
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .catch((error) => {
        console.error(error)
        throw error
      })
    if (response.status > 400) {
      this.errorThrowerGuard.unexpectedUpvsResponseError(response)
    }
    return response.data
  }
}
