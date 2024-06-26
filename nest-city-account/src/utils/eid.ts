import * as crypto from 'crypto'
// eslint-disable-next-line import/no-extraneous-dependencies
import { v1 as uuidv1 } from 'uuid'

export function createUserJwtToken(oboToken: string) {
  if (!process.env.API_TOKEN_PRIVATE) throw new Error('API_TOKEN_PRIVATE not set')
  const privateKey = process.env.API_TOKEN_PRIVATE
  const header = {
    alg: 'RS256',
    cty: 'JWT',
  }
  const exp = Math.floor(new Date(new Date().getTime() + 5 * 60000).getTime() / 1000)
  const jti = uuidv1()
  const payload = {
    exp: exp,
    jti: jti,
    obo: oboToken,
  }
  const headerEncode = Buffer.from(JSON.stringify(header)).toString('base64url')
  const payloadEncode = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const buffer = Buffer.from(headerEncode + '.' + payloadEncode)
  const signature = crypto.sign('sha256', buffer, { key: privateKey }).toString('base64url')
  return headerEncode + '.' + payloadEncode + '.' + signature
}
