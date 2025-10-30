import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { OAuth2Controller } from './oauth2.controller'
import { OAuth2Service } from './oauth2.service'
import { AuthorizationRequestGuard } from './guards/authorization-request.guard'
import { TokenRequestGuard } from './guards/token-request.guard'
import { AuthorizationPayloadGuard } from './guards/authorization-payload.guard'
import { OAuth2ValidationSubservice } from './subservices/oauth2-validation.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { OAuth2ExceptionFilter } from '../utils/filters/oauth2.filter'
import { PrismaService } from '../prisma/prisma.service'
import { NoCacheMiddleware } from '../utils/middlewares/no-cache.middleware'

@Module({
  imports: [],
  providers: [
    OAuth2Service,
    PrismaService,
    CognitoSubservice,
    ThrowerErrorGuard,
    OAuth2ValidationSubservice,
    AuthorizationRequestGuard,
    TokenRequestGuard,
    AuthorizationPayloadGuard,
    OAuth2ExceptionFilter,
  ],
  exports: [AuthorizationRequestGuard, TokenRequestGuard],
  controllers: [OAuth2Controller],
})
export class OAuth2Module implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(NoCacheMiddleware).forRoutes(OAuth2Controller)
  }
}
