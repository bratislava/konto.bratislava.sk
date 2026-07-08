import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common'

import BaConfigService from '../../config/ba-config.service'
import { ClusterEnv } from '../../config/environment-variables'

@Injectable()
export class NotProductionGuard implements CanActivate {
  constructor(private readonly baConfigService: BaConfigService) {}

  canActivate(): boolean {
    if (this.baConfigService.environment.clusterEnv === ClusterEnv.Production) {
      throw new ForbiddenException(
        'This endpoint is not available in production environment.',
      )
    }
    return true
  }
}
