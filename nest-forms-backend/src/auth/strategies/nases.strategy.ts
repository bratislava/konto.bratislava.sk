import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import * as jwt from 'jsonwebtoken'
import { Strategy } from 'passport-http-bearer'

import { JwtNasesPayloadDto } from '../../nases/dtos/requests.dto'
import NasesService from '../../nases/nases.service'
import NasesUtilsService from '../../nases/utils-services/tokens.nases.service'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'

@Injectable()
export default class NasesStrategy extends PassportStrategy(Strategy, 'nases') {
  constructor(
    private nasesUtilsService: NasesUtilsService,
    private nasesService: NasesService,
    private throwerErrorGuard: ThrowerErrorGuard,
  ) {
    super()
  }

  async validate(oboToken: string): Promise<JwtNasesPayloadDto> {
    const jwtToken = this.nasesUtilsService.createUserJwtToken(oboToken)
    const data = await this.nasesService.getNasesIdentity(jwtToken)
    if (data === null) {
      throw this.throwerErrorGuard.UnauthorizedException(
        ErrorsEnum.UNAUTHORIZED_ERROR,
        ErrorsResponseEnum.UNAUTHORIZED_ERROR,
      )
    }

    return jwt.decode(oboToken) as JwtNasesPayloadDto
  }
}
