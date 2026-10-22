import { createKeyv } from '@keyv/redis'
import { CacheModule } from '@nestjs/cache-manager'
import { Logger, Module } from '@nestjs/common'
import type { Keyv as EsmKeyv } from 'keyv' with { 'resolution-mode': 'import' }

import ApiJwtTokensModule from '../api-jwt-tokens/api-jwt-tokens.module'
import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import { AuthV2Module } from '../auth-v2/auth-v2.module'
import ClientsModule from '../clients/clients.module'
import BaConfigService from '../config/ba-config.service'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsModule from '../forms/forms.module'
import { FormsV2Module } from '../forms-v2/forms-v2.module'
import SignatureVerdictCache from './signature-verdict-cache'
import SignatureVerificationService from './signature-verification.service'
import SignerController from './signer.controller'
import SignerService from './signer.service'

const REDIS_CONNECT_TIMEOUT_MS = 2000
const REDIS_ERROR_LOG_INTERVAL_MS = 60_000

@Module({
  imports: [
    FormsModule,
    FormValidatorRegistryModule,
    UserInfoPipeModule,
    FormsV2Module,
    AuthV2Module,
    ClientsModule,
    ApiJwtTokensModule,
    CacheModule.registerAsync({
      inject: [BaConfigService],
      useFactory: (baConfigService: BaConfigService) => {
        const keyv = createKeyv(
          {
            socket: {
              host: baConfigService.redis.service,
              port: baConfigService.redis.port,
              connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
            },
            // Same credentials as the Bull queues (AppSharedModule).
            username: 'default',
            password: baConfigService.redis.password,
            // Fail commands immediately while disconnected instead of queueing them, the client keeps reconnecting
            // in the background.
            disableOfflineQueue: true,
          },
          {
            throwOnConnectError: false,
            throwOnErrors: false,
            connectionTimeout: REDIS_CONNECT_TIMEOUT_MS,
          },
        )
        // While Redis is down the client reports several errors per second, log at most one per interval.
        const logger = new Logger('SignatureVerdictCacheStore')
        let lastLoggedAt = 0
        let suppressed = 0
        keyv.on('error', (error: unknown) => {
          const now = Date.now()
          if (now - lastLoggedAt < REDIS_ERROR_LOG_INTERVAL_MS) {
            suppressed += 1
            return
          }
          logger.warn(
            `Redis cache error (${suppressed} similar errors suppressed): ${error instanceof Error ? error.message : String(error)}`,
          )
          lastLoggedAt = now
          suppressed = 0
        })
        // keyv ships separate ESM and CommonJS type declarations. This file resolves the CommonJS ones, the ESM-only
        // @nestjs/cache-manager types expect the ESM ones, so TypeScript sees two unrelated classes. At runtime the
        // instance is recognised by shape (`isKeyvInstance`) and used as is.
        return { stores: [keyv as unknown as EsmKeyv] }
      },
    }),
  ],
  controllers: [SignerController],
  providers: [
    SignerService,
    SignatureVerificationService,
    SignatureVerdictCache,
  ],
  exports: [SignerService, SignatureVerificationService],
})
export default class SignerModule {}
