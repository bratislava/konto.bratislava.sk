import { Injectable } from '@nestjs/common'

import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
import BaConfigService from '../config/ba-config.service'

@Injectable()
export default class AdminService {
  constructor(
    private readonly apiJwtTokensService: ApiJwtTokensService,
    private readonly baConfigService: BaConfigService,
  ) {}

  createTechnicalAccountJwtToken(): string {
    return this.apiJwtTokensService.createTechnicalAccountJwtToken(
      this.baConfigService.slovenskoSk.subNasesTechnicalAccount,
      this.baConfigService.slovenskoSk.apiTokenPrivate,
    )
  }

  createAdministrationJwtToken(): string {
    return this.apiJwtTokensService.createAdministrationJwtToken(
      this.baConfigService.slovenskoSk.apiTokenPrivate,
    )
  }

  createUserJwtToken(oboToken: string): string {
    return this.apiJwtTokensService.createUserJwtToken(
      oboToken,
      this.baConfigService.slovenskoSk.apiTokenPrivate,
    )
  }
}
