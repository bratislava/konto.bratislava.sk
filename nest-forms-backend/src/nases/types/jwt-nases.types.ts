class JwtNasesPayloadActor {
  declare name: string

  declare sub: string
}

export class JwtNasesPayload {
  declare sub: string

  declare exp: number

  declare nbf: number

  declare iat: number

  declare name: string

  declare actor: JwtNasesPayloadActor

  declare scopes: string[]

  declare jti: string
}
