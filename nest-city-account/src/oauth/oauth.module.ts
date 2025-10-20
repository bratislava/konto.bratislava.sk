import { Module } from '@nestjs/common'
import { OAuthController } from './oauth.controller'
import { OAuthService } from './oauth.service'
import { PartnerAuthGuard } from './guards/partner-auth.guard'

@Module({
  controllers: [OAuthController],
  providers: [OAuthService, PartnerAuthGuard],
  exports: [OAuthService],
})
export class OAuthModule {}
