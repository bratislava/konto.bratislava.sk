import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common'

@Injectable()
export class NotProductionGuard implements CanActivate {
  canActivate(): boolean {
    if (process.env.CLUSTER_ENV === 'production') {
      throw new ForbiddenException(
        'This endpoint is not available in production environment.',
      )
    }
    return true
  }
}
