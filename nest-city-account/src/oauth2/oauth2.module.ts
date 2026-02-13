import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { OAuth2Controller } from './oauth2.controller'
import { OAuth2Service } from './oauth2.service'
import { AuthorizationRequestGuard } from './guards/authorization-request.guard'
import { TokenRequestGuard } from './guards/token-request.guard'
import { AuthRequestIdGuard } from './guards/auth-request-id.guard'
import { OAuth2AccessGuard } from './guards/oauth2-access.guard'
import { OAuth2ValidationSubservice } from './subservices/oauth2-validation.subservice'
import { OAuth2ClientSubservice } from './subservices/oauth2-client.subservice'
import { OAuth2ExceptionFilter } from './filters/oauth2-exception.filter'
import { NoCacheMiddleware } from '../utils/middlewares/no-cache.middleware'
import { TokenRequestValidationPipe } from './pipes/token-request-validation.pipe'
import { OAuth2ErrorThrower } from './oauth2-error.thrower'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PassportModule, PrismaModule],
  providers: [
    OAuth2Service,
    OAuth2ErrorThrower,
    OAuth2ClientSubservice,
    OAuth2ValidationSubservice,
    AuthorizationRequestGuard,
    TokenRequestGuard,
    AuthRequestIdGuard,
    OAuth2AccessGuard,
    OAuth2ExceptionFilter,
    TokenRequestValidationPipe,
  ],
  exports: [OAuth2AccessGuard, OAuth2ClientSubservice],
  controllers: [OAuth2Controller],
})
export class OAuth2Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(NoCacheMiddleware).forRoutes(OAuth2Controller)
  }
}
